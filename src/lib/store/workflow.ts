"use client";

// Client workflow store, backed by Postgres through /api/workflow. State is shared
// across roles and devices. A separate status store tracks loading, in-flight
// saves and the last error, so screens can show loading, saving and error states
// instead of silently ignoring failures.

import { useEffect } from "react";
import { useSyncExternalStore } from "react";
import { EMPTY_STATE, type WorkflowState } from "@/lib/workflow-types";

export * from "@/lib/workflow-types"; // re-export types + flow constants

// ---- data ----
let state: WorkflowState = EMPTY_STATE;
const listeners = new Set<() => void>();
let inflight: Promise<void> | null = null;

function emit() { listeners.forEach((l) => l()); }
function subscribe(l: () => void) { listeners.add(l); return () => listeners.delete(l); }
function getSnapshot() { return state; }
function getServerSnapshot() { return EMPTY_STATE; }

// ---- status ----
export interface WorkflowStatus {
  loaded: boolean; // first load finished (successfully or not)
  pending: number; // saves in flight
  error: string | null; // last failure, shown until dismissed or the next success
}
const SERVER_STATUS: WorkflowStatus = { loaded: false, pending: 0, error: null };
let status: WorkflowStatus = SERVER_STATUS;
const statusListeners = new Set<() => void>();

function setStatus(patch: Partial<WorkflowStatus>) {
  status = { ...status, ...patch };
  statusListeners.forEach((l) => l());
}
function subscribeStatus(l: () => void) { statusListeners.add(l); return () => statusListeners.delete(l); }

function errorFor(code: number | null, verb: "load" | "save"): string {
  if (code === 401) return "Your session has ended. Sign in again to continue.";
  return verb === "load"
    ? "Couldn't load the latest care data. Check your connection, then refresh the page."
    : "That change wasn't saved. Check your connection and try again.";
}

function load(): Promise<void> {
  if (inflight) return inflight;
  inflight = fetch("/api/workflow", { cache: "no-store" })
    .then(async (r) => {
      if (!r.ok) { setStatus({ loaded: true, error: errorFor(r.status, "load") }); return; }
      state = await r.json();
      emit();
      setStatus({ loaded: true });
    })
    .catch(() => setStatus({ loaded: true, error: errorFor(null, "load") }))
    .finally(() => { inflight = null; });
  return inflight;
}

async function apply(action: string, args: unknown): Promise<boolean> {
  setStatus({ pending: status.pending + 1, error: null });
  try {
    const res = await fetch("/api/workflow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, args }),
    });
    if (!res.ok) {
      // 4xx responses carry a message the user can act on; otherwise use the generic one.
      const body = res.status >= 400 && res.status < 500 && res.status !== 401 ? await res.json().catch(() => null) : null;
      setStatus({ error: body?.error ?? errorFor(res.status, "save") });
      return false;
    }
    state = await res.json();
    emit();
    return true;
  } catch {
    setStatus({ error: errorFor(null, "save") });
    return false;
  } finally {
    setStatus({ pending: Math.max(0, status.pending - 1) });
  }
}

export function useWorkflow(): WorkflowState {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  useEffect(() => { load(); }, []);
  return snap;
}

export function useWorkflowStatus(): WorkflowStatus {
  return useSyncExternalStore(subscribeStatus, () => status, () => SERVER_STATUS);
}

export function dismissWorkflowError() { setStatus({ error: null }); }

// Every action resolves to true when the change was saved, false otherwise.
export const workflow = {
  issuePrescription: (p: { patientId: string; patientName: string; items: string; pharmacy: string; issuedBy: string }) => apply("issuePrescription", p),
  advanceRx: (id: string) => apply("advanceRx", { id }),
  requestLab: (p: { patientId: string; patientName: string; tests: string; lab: string; requestedBy: string }) => apply("requestLab", p),
  advanceLab: (id: string, result?: string) => apply("advanceLab", { id, result }),
  scheduleAppointment: (p: { patientId: string; patientName: string; purpose: string; when: string }) => apply("scheduleAppointment", p),
  setApptStatus: (id: string, status: string) => apply("setApptStatus", { id, status }),
  createReferral: (p: { patientId: string; patientName: string; from: string; to: string; reason: string }) => apply("createReferral", p),
  advanceReferral: (id: string) => apply("advanceReferral", { id }),
  stallReferral: (id: string, barrier: string, note: string) => apply("stallReferral", { id, barrier, note }),
  resolveReferral: (id: string, response: string) => apply("resolveReferral", { id, response }),
  recordBarriers: (barriers: { barrier: string; note?: string }[], patientId?: string) => apply("recordBarriers", { barriers, patientId }),
  completeHomeVisit: (id: string, outcome: string, escalate: boolean) => apply("completeHomeVisit", { id, outcome, escalate }),
  reset: () => apply("reset", {}),
};
