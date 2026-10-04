import { NextResponse } from "next/server";
import { getWorkflowState, applyAction, ActionError } from "@/lib/workflow-server";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getWorkflowState({ role: user.role, patientId: user.patientId }));
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { action, args } = await request.json().catch(() => ({ action: "", args: {} }));
  if (!action) return NextResponse.json({ error: "Missing action" }, { status: 400 });
  try {
    const state = await applyAction(String(action), args ?? {}, { role: user.role, patientId: user.patientId });
    return NextResponse.json(state);
  } catch (e) {
    if (e instanceof ActionError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
