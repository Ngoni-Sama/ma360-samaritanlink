import { NextResponse } from "next/server";
import { navigatorResponse } from "@/lib/data/demo";

// AI Health Navigation Assistant — MVP endpoint.
//
// This runs on curated mock guidance so the platform is fully demo-able with no
// API key. When ANTHROPIC_API_KEY is configured, this is the single place to
// swap in a server-side Claude call. The assistant is a NAVIGATION/INFORMATION
// aid — it must never diagnose, prescribe, or make clinical decisions.

export async function POST(request: Request) {
  const { message } = await request.json().catch(() => ({ message: "" }));
  const reply = navigatorResponse(String(message || ""));
  return NextResponse.json({ reply, mode: process.env.ANTHROPIC_API_KEY ? "live-ready" : "mock" });
}
