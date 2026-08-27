// MA360 SamaritanLink — Health Navigator "brain".
//
// A Cloudflare Worker that runs a free Workers AI Llama model to answer health
// navigation questions. It has simple, stateless memory: the client sends the
// last few user prompts in `history`, which are replayed as prior context.
//
// SAFETY: this is an information/navigation assistant, NOT a doctor. The system
// prompt forbids diagnosis, prescription and emergency decision-making, and asks
// the model to direct users to urgent care for red-flag symptoms.

const MODEL = "@cf/meta/llama-3.1-8b-instruct-fp8";

const SYSTEM_PROMPT = `You are the "AI Health Navigation Assistant" for MA360 SamaritanLink, a digital-health platform of the MedAccess360 Foundation in Zimbabwe.

Your role: help people move from a health need to the right next step (community screening, a professional consultation, pharmacy, diagnostics, or urgent care). You provide GENERAL health information and NAVIGATION only.

Strict rules:
- You are NOT a doctor or nurse. NEVER diagnose a condition, prescribe or name specific medicines/doses, or make emergency decisions.
- If the person describes red-flag or emergency symptoms (e.g. chest pain, trouble breathing, severe bleeding, stroke signs, loss of consciousness, seizures), tell them clearly to seek EMERGENCY care immediately (nearest hospital / local emergency services) before anything else.
- Encourage a community screening or a professional consultation when appropriate.
- If the message is unclear, gibberish, or not health-related, respond gently, say you are a health navigation assistant, and ask one short clarifying question.
- Be brief, warm and plain-language (aim for 2-5 short sentences). Do not use markdown headings or emojis. Always remind, briefly, that this is general guidance, not a diagnosis.`;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS });
    }
    if (request.method === "GET") {
      return json({ ok: true, service: "samaritanlink-navigator", model: MODEL });
    }
    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405);
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return json({ error: "Invalid JSON body" }, 400);
    }

    const message = String(payload?.message ?? "").slice(0, 2000).trim();
    if (!message) return json({ error: "Empty message" }, 400);

    // Basic memory: replay up to the last 3 prior user prompts as context.
    const history = Array.isArray(payload?.history) ? payload.history : [];
    const recent = history
      .map((h) => String(h ?? "").slice(0, 1000).trim())
      .filter(Boolean)
      .slice(-3);

    const messages = [{ role: "system", content: SYSTEM_PROMPT }];
    for (const prev of recent) messages.push({ role: "user", content: prev });
    messages.push({ role: "user", content: message });

    try {
      const result = await env.AI.run(MODEL, {
        messages,
        max_tokens: 400,
        temperature: 0.5,
      });
      const reply =
        (result && (result.response || result.result?.response)) ||
        "I'm here to help you find the right care. Could you tell me a little more about your health concern?";
      return json({ reply: reply.trim(), mode: "live" });
    } catch (err) {
      return json({ error: "AI inference failed", detail: String(err) }, 502);
    }
  },
};
