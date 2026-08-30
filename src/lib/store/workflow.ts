"use client";

// Client workflow store — now server/DB-backed. Same public surface as before
// (useWorkflow + workflow.*), so components are unchanged, but state persists in
// Postgres and is shared across roles and devices.

import { useEffect } from "react";
import { useSyncExternalStore } from "react";
import { EMPTY_STATE, type WorkflowState } from "@/lib/workflow-types";

export * from "@/lib/workflow-types"; // re-export types + flow constants

let state: WorkflowState = EMPTY_STATE;
const listeners = new Set<() => void>();
let inflight: Promise<void> | null = null;

function emit() { listeners.forEach((l) => l()); }
function subscribe(l: () => void) { listeners.add(l); return () => listeners.delete(l); }
function getSnapshot() { return state; }
function getServerSnapshot() { return EMPTY_STATE; }

function load(): Promise<void> {
  if (inflight) return inflight;
  inflight = fetch("/api/workflow", { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => { if (data) { state = data; emit(); } })
    .catch(() => {})
    .finally(() => { inflight = null; });
  return inflight;
}

async function apply(action: string, args: unknown) {
  try {
    const res = await fetch("/api/workflow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, args }),
    });
    if (res.ok) { state = await res.json(); emit(); }
  } catch { /* ignore */ }
}

export function useWorkflow(): WorkflowState {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  useEffect(() => { load(); }, []);
  return snap;
}

export const workflow = {
  issuePrescription: (p: { patientId: string; patientName: string; items: string; pharmacy: string; issuedBy: string }) => apply("issuePrescription", p),
  advanceRx: (id: string) => apply("advanceRx", { id }),
  requestLab: (p: { patientId: string; patientName: string; tests: string; lab: string; requestedBy: string }) => apply("requestLab", p),
  advanceLab: (id: string, result?: string) => apply("advanceLab", { id, result }),
  scheduleAppointment: (p: { patientId: string; patientName: string; purpose: string; when: string }) => apply("scheduleAppointment", p),
  setApptStatus: (id: string, status: string) => apply("setApptStatus", { id, status }),
  createReferral: (p: { patientId: string; patientName: string; from: string; to: string; reason: string }) => apply("createReferral", p),
  advanceReferral: (id: string) => apply("advanceReferral", { id }),
  completeHomeVisit: (id: string, outcome: string, escalate: boolean) => apply("completeHomeVisit", { id, outcome, escalate }),
  reset: () => apply("reset", {}),
};
