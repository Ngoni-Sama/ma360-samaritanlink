import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// USSD gateway — Africa's Talking-compatible protocol.
// Request (form or JSON): { sessionId, phoneNumber, text }.
// Response: plain text beginning "CON " (expect more input) or "END " (final).
// `text` is the accumulated user input joined by "*", e.g. "2*SL-P-2026-000001".
// DB-backed so a feature phone (no data / no smartphone) can query real state.
// Point a real gateway (Econet/NetOne/Telecel via an aggregator) at this URL.

const RX_LABEL: Record<string, string> = {
  issued: "issued", received: "at pharmacy", preparing: "being prepared",
  ready: "READY for collection", collected: "collected",
};

async function medicines(id: string): Promise<string> {
  const rx = await db.prescription.findMany({ where: { patientId: id }, orderBy: { createdAt: "desc" }, take: 3 });
  if (rx.length === 0) return `END No prescriptions found for ${id}. Check your SamaritanLink ID.`;
  const lines = rx.map((r) => `${r.items} - ${RX_LABEL[r.status] ?? r.status} (${r.pharmacy})`).join("\n");
  return `END Your medicines:\n${lines}\n\nAn SMS with details will be sent.`;
}

async function appointments(id: string): Promise<string> {
  const ap = await db.appointment.findFirst({ where: { patientId: id, status: { in: ["scheduled", "confirmed"] } }, orderBy: { createdAt: "desc" } });
  if (!ap) return `END No upcoming appointments for ${id}.`;
  return `END Next appointment:\n${ap.purpose}\n${ap.whenAt}\n\nReply 1 to confirm (SMS).`;
}

function reply(text: string) {
  return new NextResponse(text, { headers: { "Content-Type": "text/plain" } });
}

async function handle(text: string): Promise<string> {
  const parts = text ? text.split("*") : [];
  const lvl1 = parts[0] ?? "";

  if (lvl1 === "") {
    return [
      "CON MA360 SamaritanLink",
      "Care that crosses the distance.",
      "1. Find care near me",
      "2. My medicines",
      "3. Request screening",
      "4. My appointments",
      "5. Talk to a health worker",
      "0. About",
    ].join("\n");
  }
  switch (lvl1) {
    case "1":
      return "END To find care, share your area by SMS to 365, or a Community Health Worker will call you. Emergencies: go to the nearest hospital now.";
    case "2":
      if (parts.length < 2) return "CON Enter your SamaritanLink ID:\n(e.g. SL-P-2026-000001)";
      return medicines(parts[1].trim());
    case "3":
      return "END Screening requested. A Community Health Worker will contact you to arrange a visit or nearest screening point.";
    case "4":
      if (parts.length < 2) return "CON Enter your SamaritanLink ID:";
      return appointments(parts[1].trim());
    case "5":
      return "END A Community Health Worker will call you shortly. If urgent, go to the nearest clinic.";
    case "0":
      return "END SamaritanLink connects you across community, screening, clinic, pharmacy, referral and follow-up. A service of MedAccess360 Foundation.";
    default:
      return "END Invalid choice. Dial *365# to start again.";
  }
}

export async function POST(request: Request) {
  let text = "";
  const ct = request.headers.get("content-type") || "";
  try {
    if (ct.includes("application/json")) {
      const b = await request.json();
      text = String(b.text ?? "");
    } else {
      const f = await request.formData();
      text = String(f.get("text") ?? "");
    }
  } catch { /* empty text = main menu */ }
  return reply(await handle(text));
}
