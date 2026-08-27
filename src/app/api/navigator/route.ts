import { NextResponse } from "next/server";
import { navigatorResponse } from "@/lib/data/demo";

// AI Health Navigation Assistant — MVP endpoint.
//
// Primary path: forward the message + short history to the Cloudflare Worker
// ("the brain"), which runs a free Workers AI Llama model. If the Worker is
// unavailable, we fall back to curated mock guidance so the app never breaks.
//
// The assistant is a NAVIGATION/INFORMATION aid — it must never diagnose,
// prescribe, or make clinical decisions (enforced in the Worker's system prompt).

const WORKER_URL = process.env.NAVIGATOR_WORKER_URL;

export async function POST(request: Request) {
  const { message, history } = await request
    .json()
    .catch(() => ({ message: "", history: [] as string[] }));

  const userMessage = String(message || "");
  const recent: string[] = Array.isArray(history)
    ? history.map((h) => String(h ?? "")).slice(-3)
    : [];

  if (WORKER_URL) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      const res = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, history: recent }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        if (data?.reply) {
          return NextResponse.json({ reply: data.reply, mode: "live" });
        }
      }
    } catch {
      // fall through to mock guidance
    }
  }

  // Fallback: structured mock guidance (rendered by the client as a message).
  const mock = navigatorResponse(userMessage);
  const reply = [
    mock.summary,
    ...mock.information,
    `Warning signs to watch for: ${mock.warningSigns.join(", ")}.`,
    mock.recommendation,
    "This is general guidance, not a diagnosis.",
  ].join(" ");
  return NextResponse.json({ reply, mode: "mock", suggestedStep: mock.suggestedStep });
}
