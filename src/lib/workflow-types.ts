// Shared workflow types + status flows. No "use client" — safe to import from
// both the client store and the server (API routes / Prisma layer).

export type RxStatus = "issued" | "received" | "preparing" | "ready" | "collected";
export const RX_FLOW: RxStatus[] = ["issued", "received", "preparing", "ready", "collected"];

export type LabStatus = "requested" | "sample_collected" | "processing" | "results_ready" | "sent_to_doctor";
export const LAB_FLOW: LabStatus[] = ["requested", "sample_collected", "processing", "results_ready", "sent_to_doctor"];

export type ApptStatus = "scheduled" | "confirmed" | "completed" | "missed" | "rescheduled";

export type ReferralStatus = "created" | "patient_notified" | "facility_identified" | "appointment" | "completed" | "followup";
export const REFERRAL_FLOW: ReferralStatus[] = ["created", "patient_notified", "facility_identified", "appointment", "completed", "followup"];

export type VisitStatus = "scheduled" | "completed" | "escalated";

export interface Prescription {
  id: string; patientId: string; patientName: string; items: string; pharmacy: string;
  status: RxStatus; issuedBy: string; createdAt: number;
}
export interface LabRequest {
  id: string; patientId: string; patientName: string; tests: string; lab: string;
  requestedBy: string; status: LabStatus; result?: string; createdAt: number;
}
export interface Appointment {
  id: string; patientId: string; patientName: string; purpose: string; when: string;
  status: ApptStatus; createdAt: number;
}
export interface Referral {
  id: string; patientId: string; patientName: string; from: string; to: string; reason: string;
  status: ReferralStatus; createdAt: number;
}
export interface HomeVisit {
  id: string; patientId: string; patientName: string; purpose: string; when: string;
  status: VisitStatus; outcome?: string;
}
export interface Notification {
  id: string; to: "patient" | "doctor" | "pharmacy" | "laboratory";
  channel: "SMS" | "WhatsApp" | "In-app"; text: string; at: number;
}
export interface WorkflowState {
  prescriptions: Prescription[];
  labs: LabRequest[];
  appointments: Appointment[];
  referrals: Referral[];
  homeVisits: HomeVisit[];
  notifications: Notification[];
}

export const EMPTY_STATE: WorkflowState = {
  prescriptions: [], labs: [], appointments: [], referrals: [], homeVisits: [], notifications: [],
};
