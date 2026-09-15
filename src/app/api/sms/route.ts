import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Inbound SMS keyword handler. Request: { from, text }. Returns a reply string
// (what the gateway would SMS back). Mirrors a real short-code integration, so a
// feature phone with no data can query state by text message.
//   MEDS <id>   → prescription status
//   APPT <id>   → next appointment
//   SCREEN      → request community screening
//   HELP        → keyword list

const RX_LABEL: Record<string, string> = {
  issued: "issued", received: "at pharmacy", preparing: "being prepared",
  ready: "READY for collection", collected: "collected",
};

async function handle(raw: string): Promise<string> {
  const text = raw.trim();
  const [kw, ...rest] = text.split(/\s+/);
  const arg = rest.join(" ").trim();
  switch ((kw || "").toUpperCase()) {
    case "MEDS": {
      if (!arg) return "Reply: MEDS <SamaritanLink ID>, e.g. MEDS SL-P-2026-000001";
      const rx = await db.prescription.findMany({ where: { patientId: arg }, orderBy: { createdAt: "desc" }, take: 3 });
      if (rx.length === 0) return `No prescriptions found for ${arg}. Check your ID.`;
      return "SamaritanLink medicines:\n" + rx.map((r) => `- ${r.items}: ${RX_LABEL[r.status] ?? r.status} (${r.pharmacy})`).join("\n");
    }
    case "APPT": {
      if (!arg) return "Reply: APPT <SamaritanLink ID>";
      const ap = await db.appointment.findFirst({ where: { patientId: arg, status: { in: ["scheduled", "confirmed"] } }, orderBy: { createdAt: "desc" } });
      return ap ? `Next appointment: ${ap.purpose} on ${ap.whenAt}.` : `No upcoming appointments for ${arg}.`;
    }
    case "SCREEN":
      return "Screening requested. A Community Health Worker will contact you to arrange a visit or nearest screening point.";
    case "HELP":
    case "":
      return "MA360 SamaritanLink SMS. Send:\nMEDS <ID> - medicine status\nAPPT <ID> - next appointment\nSCREEN - request screening\nDial *365# for the full menu.";
    default:
      return "Unknown keyword. Send HELP for options, or dial *365#.";
  }
}

export async function POST(request: Request) {
  const { text } = await request.json().catch(() => ({ text: "" }));
  const reply = await handle(String(text || ""));
  return NextResponse.json({ reply });
}
