// Shared workflow types + status flows. No "use client" — safe to import from
// both the client store and the server (API routes / Prisma layer).

export type RxStatus = "issued" | "received" | "preparing" | "ready" | "collected";
export const RX_FLOW: RxStatus[] = ["issued", "received", "preparing", "ready", "collected"];

export type LabStatus = "requested" | "sample_collected" | "processing" | "results_ready" | "sent_to_doctor";
export const LAB_FLOW: LabStatus[] = ["requested", "sample_collected", "processing", "results_ready", "sent_to_doctor"];

export type ApptStatus = "scheduled" | "confirmed" | "completed" | "missed" | "rescheduled";

// Closed-loop referral: a referral created is not care completed. Each stage must
// be confirmed; a referral that stops progressing is marked stalled at its stage
// with the access barrier that caused it.
export type ReferralStatus = "created" | "received" | "attended" | "treatment" | "followup";
export const REFERRAL_FLOW: ReferralStatus[] = ["created", "received", "attended", "treatment", "followup"];
export const REFERRAL_STAGE_LABEL: Record<ReferralStatus, string> = {
  created: "Referral created",
  received: "Referral received",
  attended: "Appointment attended",
  treatment: "Treatment started",
  followup: "Follow-up completed",
};

// Health Access Equity barriers, used both when navigating (before care) and when
// a referral stops progressing (during care), so the two can be compared.
export type BarrierKey =
  | "transport" | "cost" | "distance" | "mobility" | "work"
  | "caregiving" | "privacy" | "disability" | "digital" | "other";

export const BARRIERS: { key: BarrierKey; label: string; icon: string; question: string; response: string }[] = [
  { key: "transport", label: "Transport", icon: "Truck", question: "Can the patient get or afford transport?", response: "Transport support or a community lift arranged" },
  { key: "cost", label: "Cost", icon: "Package", question: "Can they afford fees or medicines?", response: "Affordability support or sponsored care applied" },
  { key: "distance", label: "Distance", icon: "MapPin", question: "Is the facility too far?", response: "Referred to a nearer participating facility" },
  { key: "mobility", label: "Mobility", icon: "Activity", question: "Is getting around difficult?", response: "Home visit or assisted transport arranged" },
  { key: "work", label: "Work", icon: "Building2", question: "Does the appointment clash with work?", response: "Appointment moved to a time that fits work" },
  { key: "caregiving", label: "Caregiving", icon: "Users", question: "Is there no one to care for dependents?", response: "Home follow-up or a caregiver-friendly slot arranged" },
  { key: "privacy", label: "Privacy", icon: "Shield", question: "Is privacy stopping them from seeking care?", response: "Confidential channel and discreet follow-up agreed" },
  { key: "disability", label: "Disability / accessibility", icon: "HeartHandshake", question: "Is the facility or service accessible to them?", response: "Accessible facility or home-based care arranged" },
  { key: "digital", label: "Digital / connectivity", icon: "Phone", question: "Can they receive calls, SMS or data?", response: "Switched to USSD/SMS or CHW in-person contact" },
  { key: "other", label: "Other", icon: "MessageSquareText", question: "Anything else in the way?", response: "Case reviewed and support agreed with the patient" },
];
export const BARRIER_LABEL = Object.fromEntries(BARRIERS.map((b) => [b.key, b.label])) as Record<BarrierKey, string>;

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
  stalled: boolean; // the journey broke at `status`
  barrier?: BarrierKey; // why it broke
  barrierNote?: string;
  barrierResponse?: string; // what the care team did about it
  stalledAt?: number;
}
export interface PatientBarrier {
  id: string; patientId: string; patientName: string; barrier: BarrierKey; note?: string;
  source: "navigator" | "referral"; createdAt: number;
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
  barriers: PatientBarrier[];
  notifications: Notification[];
  viewer: { role: string; patientId: string | null } | null; // who is looking
}

export const EMPTY_STATE: WorkflowState = {
  prescriptions: [], labs: [], appointments: [], referrals: [], homeVisits: [], barriers: [], notifications: [], viewer: null,
};
