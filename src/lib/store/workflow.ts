"use client";

// -----------------------------------------------------------------------------
// Connected-care WORKFLOW store (client-side demo).
//
// Backs the three interactive Phase-1 workflows so a doctor's action is visible
// on the pharmacy / laboratory dashboards and as a patient notification — all
// within the browser session (localStorage), no backend required. Production
// swaps this for server state + real messaging.
// -----------------------------------------------------------------------------

import { useEffect, useSyncExternalStore } from "react";

export type RxStatus = "issued" | "received" | "preparing" | "ready" | "collected";
export const RX_FLOW: RxStatus[] = ["issued", "received", "preparing", "ready", "collected"];

export type LabStatus = "requested" | "sample_collected" | "processing" | "results_ready" | "sent_to_doctor";
export const LAB_FLOW: LabStatus[] = ["requested", "sample_collected", "processing", "results_ready", "sent_to_doctor"];

export type ApptStatus = "scheduled" | "confirmed" | "completed" | "missed" | "rescheduled";

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  items: string;
  pharmacy: string;
  status: RxStatus;
  issuedBy: string;
  createdAt: number;
}

export interface LabRequest {
  id: string;
  patientId: string;
  patientName: string;
  tests: string;
  lab: string;
  requestedBy: string;
  status: LabStatus;
  result?: string;
  createdAt: number;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  purpose: string;
  when: string;
  status: ApptStatus;
  createdAt: number;
}

export interface Notification {
  id: string;
  to: "patient" | "doctor" | "pharmacy" | "laboratory";
  channel: "SMS" | "WhatsApp" | "In-app";
  text: string;
  at: number;
}

export interface WorkflowState {
  prescriptions: Prescription[];
  labs: LabRequest[];
  appointments: Appointment[];
  notifications: Notification[];
}

const KEY = "sl_workflow_v1";
const uid = () => Math.random().toString(36).slice(2, 9);

function seed(): WorkflowState {
  const now = Date.now();
  return {
    prescriptions: [
      { id: "rx-seed1", patientId: "SL-P-2026-000001", patientName: "Tendai Moyo", items: "Metformin 500 mg × 30", pharmacy: "Unity Pharmacy", status: "received", issuedBy: "SL-DR-000245", createdAt: now - 3600_000 },
    ],
    labs: [
      { id: "lab-seed1", patientId: "SL-P-2026-000001", patientName: "Tendai Moyo", tests: "Lipid profile", lab: "MA360 Partner Laboratory", requestedBy: "SL-DR-000245", status: "processing", createdAt: now - 7200_000 },
      { id: "lab-seed2", patientId: "SL-P-2026-000003", patientName: "Blessing Ncube", tests: "U&E, HbA1c", lab: "MA360 Partner Laboratory", requestedBy: "SL-DR-000245", status: "requested", createdAt: now - 1800_000 },
    ],
    appointments: [
      { id: "ap-seed1", patientId: "SL-P-2026-000001", patientName: "Tendai Moyo", purpose: "30-day hypertension review", when: "2026-09-20 10:30", status: "scheduled", createdAt: now },
    ],
    notifications: [],
  };
}

// Single source of truth; replaced (not mutated) on every change.
let state: WorkflowState = seed();
const serverSnapshot: WorkflowState = seed();
let hydrated = false;
const listeners = new Set<() => void>();

function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
}
function emit() { persist(); listeners.forEach((l) => l()); }
function subscribe(l: () => void) { listeners.add(l); return () => listeners.delete(l); }
function getSnapshot() { return state; }
function getServerSnapshot() { return serverSnapshot; }

function hydrate() {
  if (hydrated) return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { state = JSON.parse(raw); emit(); }
  } catch { /* ignore */ }
}

function notify(n: Omit<Notification, "id" | "at">) {
  state = { ...state, notifications: [{ id: uid(), at: Date.now(), ...n }, ...state.notifications].slice(0, 30) };
}

// ---- actions ----

export const workflow = {
  issuePrescription(p: { patientId: string; patientName: string; items: string; pharmacy: string; issuedBy: string }) {
    const rx: Prescription = { id: uid(), status: "received", createdAt: Date.now(), ...p };
    state = { ...state, prescriptions: [rx, ...state.prescriptions] };
    notify({ to: "pharmacy", channel: "In-app", text: `New prescription for ${p.patientName} (${p.patientId}) received from ${p.issuedBy}.` });
    notify({ to: "patient", channel: "SMS", text: `Your prescription has been sent to ${p.pharmacy}. You will be notified when it is ready.` });
    emit();
  },
  advanceRx(id: string) {
    state = {
      ...state,
      prescriptions: state.prescriptions.map((rx) => {
        if (rx.id !== id) return rx;
        const i = RX_FLOW.indexOf(rx.status);
        const next = RX_FLOW[Math.min(i + 1, RX_FLOW.length - 1)];
        if (next === "ready") notify({ to: "patient", channel: "WhatsApp", text: `Your medication (${rx.items}) from ${rx.pharmacy} is ready for collection.` });
        if (next === "collected") notify({ to: "patient", channel: "In-app", text: `Medication collected from ${rx.pharmacy}. Your care journey has been updated.` });
        return { ...rx, status: next };
      }),
    };
    emit();
  },
  requestLab(p: { patientId: string; patientName: string; tests: string; lab: string; requestedBy: string }) {
    const lab: LabRequest = { id: uid(), status: "requested", createdAt: Date.now(), ...p };
    state = { ...state, labs: [lab, ...state.labs] };
    notify({ to: "laboratory", channel: "In-app", text: `New test request for ${p.patientName} (${p.patientId}): ${p.tests}.` });
    emit();
  },
  advanceLab(id: string, result?: string) {
    state = {
      ...state,
      labs: state.labs.map((l) => {
        if (l.id !== id) return l;
        const i = LAB_FLOW.indexOf(l.status);
        const next = LAB_FLOW[Math.min(i + 1, LAB_FLOW.length - 1)];
        const updated = { ...l, status: next, result: result ?? l.result };
        if (next === "sent_to_doctor") {
          notify({ to: "doctor", channel: "In-app", text: `New laboratory results received for ${l.patientName} (${l.patientId}).` });
          notify({ to: "patient", channel: "SMS", text: `Your laboratory results have been sent to your healthcare provider. Please follow their instructions regarding review.` });
        }
        return updated;
      }),
    };
    emit();
  },
  scheduleAppointment(p: { patientId: string; patientName: string; purpose: string; when: string }) {
    const ap: Appointment = { id: uid(), status: "scheduled", createdAt: Date.now(), ...p };
    state = { ...state, appointments: [ap, ...state.appointments] };
    notify({ to: "patient", channel: "SMS", text: `Dear ${p.patientName}, your follow-up appointment is scheduled for ${p.when}. Contact reception if you need to reschedule.` });
    emit();
  },
  setApptStatus(id: string, status: ApptStatus) {
    state = {
      ...state,
      appointments: state.appointments.map((a) => {
        if (a.id !== id) return a;
        if (status === "missed") notify({ to: "doctor", channel: "In-app", text: `${a.patientName} missed "${a.purpose}". Follow-up task created.` });
        return { ...a, status };
      }),
    };
    emit();
  },
  reset() { state = seed(); hydrated = true; emit(); },
};

export function useWorkflow(): WorkflowState {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  useEffect(() => { hydrate(); }, []);
  return snap;
}
