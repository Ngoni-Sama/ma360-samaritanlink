// -----------------------------------------------------------------------------
// CONNECTED CARE — Phase 1 data model (SYNTHETIC DEMO DATA ONLY).
//
// Implements the "one patient, one ID, one journey" concept from the MA360
// SamaritanLink next-stage brief:
//   - SamaritanLink Patient ID  (SL-P-YYYY-NNNNNN)
//   - Provider IDs              (SL-DR / SL-PH / SL-LAB / SL-CHW / SL-NUR / SL-ADM)
//   - Longitudinal patient profile with role-based visibility
//   - "My Care Journey" timeline
//   - Smart tasks / alerts per role
// The UI reads these shapes today; production swaps in Prisma/PostgreSQL.
// -----------------------------------------------------------------------------

import type { Role } from "./types";

export type ProviderRole = "professional" | "pharmacy" | "laboratory" | "health_worker" | "nurse" | "admin";

export interface Provider {
  providerId: string; // SL-DR-000245, etc.
  name: string;
  role: ProviderRole;
  profession: string;
  specialty?: string;
  facility: string;
  registration?: string;
}

export const PROVIDERS: Provider[] = [
  { providerId: "SL-DR-000245", name: "Dr. Farai Chikowore", role: "professional", profession: "Medical Doctor", specialty: "Internal Medicine", facility: "Harare Central Hospital", registration: "MDCZ-DEMO-0042" },
  { providerId: "SL-PH-000087", name: "Unity Pharmacy", role: "pharmacy", profession: "Community Pharmacy", facility: "Harare CBD" },
  { providerId: "SL-LAB-000052", name: "MA360 Partner Laboratory", role: "laboratory", profession: "Diagnostic Laboratory", facility: "Harare" },
  { providerId: "SL-CHW-000320", name: "Rutendo Nyathi", role: "health_worker", profession: "Community Health Worker", facility: "Epworth" },
  { providerId: "SL-NUR-000191", name: "Sister Tapiwa Mudimu", role: "nurse", profession: "Registered Nurse", facility: "Chitungwiza Clinic" },
  { providerId: "SL-ADM-000001", name: "MA360 Administrator", role: "admin", profession: "Programme Administration", facility: "MA360 HQ" },
];

// Map the auth demo user's role to their provider record.
export function providerForRole(role: Role): Provider | undefined {
  const map: Record<string, ProviderRole> = {
    professional: "professional",
    pharmacy: "pharmacy",
    health_worker: "health_worker",
    admin: "admin",
  };
  const pr = map[role];
  return PROVIDERS.find((p) => p.role === pr);
}

export type JourneyStage =
  | "registration" | "screening" | "consultation" | "lab_request" | "lab_result"
  | "prescription" | "pharmacy" | "referral" | "follow_up" | "review" | "home_visit";

export interface JourneyEvent {
  id: string;
  date: string; // ISO date
  stage: JourneyStage;
  title: string;
  detail: string;
  by: string; // provider name / id
  status: "completed" | "active" | "scheduled" | "missed";
  patientVisible: boolean; // patients see a simple subset
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  status: "active" | "collected" | "ready" | "pending";
  pharmacy?: string;
}

export interface LabResult {
  test: string;
  value: string;
  flag: "normal" | "borderline" | "high" | "low";
  date: string;
}

export interface SamaritanPatient {
  patientId: string; // SL-P-2026-000001
  nationalId?: string;
  name: string;
  age: number;
  sex: string;
  contact: string;
  location: string;
  emergencyContact: string;
  allergies: string[];
  alerts: string[];
  conditions: string[];
  medications: Medication[];
  labResults: LabResult[];
  journey: JourneyEvent[];
  documents: { name: string; kind: string; date: string }[];
}

export const PATIENTS: SamaritanPatient[] = [
  {
    patientId: "SL-P-2026-000001",
    nationalId: "63-1234567-A-42",
    name: "Tendai Moyo",
    age: 54,
    sex: "Male",
    contact: "+263 77 000 0001",
    location: "Chitungwiza",
    emergencyContact: "Chipo Moyo (spouse) · +263 77 000 0011",
    allergies: ["Penicillin"],
    alerts: ["Hypertension — active", "Borderline blood glucose"],
    conditions: ["Hypertension", "Pre-diabetes"],
    medications: [
      { name: "Amlodipine", dosage: "5 mg", frequency: "once daily", status: "collected", pharmacy: "Unity Pharmacy" },
      { name: "Metformin", dosage: "500 mg", frequency: "twice daily", status: "ready", pharmacy: "Unity Pharmacy" },
    ],
    labResults: [
      { test: "Fasting blood glucose", value: "6.9 mmol/L", flag: "borderline", date: "2026-08-18" },
      { test: "Serum creatinine", value: "94 µmol/L", flag: "normal", date: "2026-08-18" },
    ],
    journey: [
      { id: "j1", date: "2026-08-12", stage: "screening", title: "Community screening completed", detail: "BP 146/92, glucose 6.9 — flagged for follow-up", by: "SL-CHW-000320 · Rutendo Nyathi", status: "completed", patientVisible: true },
      { id: "j2", date: "2026-08-15", stage: "consultation", title: "Doctor consultation completed", detail: "Hypertension review; diagnostics ordered", by: "SL-DR-000245 · Dr. Farai Chikowore", status: "completed", patientVisible: true },
      { id: "j3", date: "2026-08-15", stage: "lab_request", title: "Laboratory tests requested", detail: "Fasting glucose, U&E, lipid profile", by: "SL-DR-000245", status: "completed", patientVisible: true },
      { id: "j4", date: "2026-08-18", stage: "lab_result", title: "Results received by doctor", detail: "Glucose borderline; renal function normal", by: "SL-LAB-000052", status: "completed", patientVisible: true },
      { id: "j5", date: "2026-08-19", stage: "prescription", title: "Prescription issued", detail: "Amlodipine 5 mg; Metformin 500 mg", by: "SL-DR-000245", status: "completed", patientVisible: true },
      { id: "j6", date: "2026-08-20", stage: "pharmacy", title: "Medication collected", detail: "Amlodipine collected at Unity Pharmacy; Metformin ready", by: "SL-PH-000087 · Unity Pharmacy", status: "active", patientVisible: true },
      { id: "j7", date: "2026-09-05", stage: "home_visit", title: "Home blood-pressure check", detail: "CHW household visit scheduled", by: "SL-CHW-000320", status: "scheduled", patientVisible: true },
      { id: "j8", date: "2026-09-20", stage: "review", title: "Review appointment", detail: "30-day hypertension review with clinician", by: "SL-DR-000245", status: "scheduled", patientVisible: true },
    ],
    documents: [
      { name: "Laboratory report — 2026-08-18", kind: "Lab report", date: "2026-08-18" },
      { name: "Referral letter — specialist review", kind: "Referral", date: "2026-08-22" },
    ],
  },
  {
    patientId: "SL-P-2026-000002",
    nationalId: "63-7654321-B-18",
    name: "Chipo Dube",
    age: 39,
    sex: "Female",
    contact: "+263 77 000 0002",
    location: "Epworth",
    emergencyContact: "Farai Dube (brother) · +263 77 000 0022",
    allergies: [],
    alerts: ["Antenatal — 28 weeks"],
    conditions: ["Pregnancy (ANC)"],
    medications: [{ name: "Ferrous + folic acid", dosage: "1 tab", frequency: "once daily", status: "active", pharmacy: "Greenwood Chemist" }],
    labResults: [{ test: "Haemoglobin", value: "11.4 g/dL", flag: "normal", date: "2026-08-21" }],
    journey: [
      { id: "k1", date: "2026-08-10", stage: "registration", title: "Patient registered", detail: "Enrolled in maternal care pathway", by: "SL-NUR-000191", status: "completed", patientVisible: true },
      { id: "k2", date: "2026-08-21", stage: "screening", title: "Antenatal screening", detail: "BP normal, Hb 11.4", by: "SL-CHW-000320", status: "completed", patientVisible: true },
      { id: "k3", date: "2026-09-04", stage: "review", title: "ANC review", detail: "Midwife review scheduled", by: "SL-NUR-000191", status: "scheduled", patientVisible: true },
    ],
    documents: [],
  },
  {
    patientId: "SL-P-2026-000003",
    nationalId: "63-2468101-C-77",
    name: "Blessing Ncube",
    age: 61,
    sex: "Male",
    contact: "+263 77 000 0003",
    location: "Epworth",
    emergencyContact: "Sibongile Ncube (daughter) · +263 77 000 0033",
    allergies: ["Sulfa drugs"],
    alerts: ["Requires urgent clinical attention", "BP 182/108"],
    conditions: ["Hypertension (uncontrolled)", "Type 2 diabetes"],
    medications: [{ name: "Amlodipine", dosage: "10 mg", frequency: "once daily", status: "pending" }],
    labResults: [{ test: "Random blood glucose", value: "9.8 mmol/L", flag: "high", date: "2026-08-25" }],
    journey: [
      { id: "l1", date: "2026-08-25", stage: "screening", title: "Community screening — urgent", detail: "BP 182/108, glucose 9.8 — urgent referral raised", by: "SL-CHW-000320", status: "completed", patientVisible: true },
      { id: "l2", date: "2026-08-26", stage: "referral", title: "Referral created", detail: "Urgent clinician review", by: "SL-CHW-000320", status: "active", patientVisible: true },
      { id: "l3", date: "2026-08-27", stage: "consultation", title: "Clinician review", detail: "Awaiting consultation", by: "SL-DR-000245", status: "scheduled", patientVisible: true },
    ],
    documents: [],
  },
];

// Generate the next SamaritanLink Patient ID for the current year.
export function nextPatientId(): string {
  const year = new Date().getFullYear();
  const nums = PATIENTS
    .map((p) => Number(p.patientId.split("-").pop()))
    .filter((n) => !Number.isNaN(n));
  const next = (Math.max(0, ...nums) + 1).toString().padStart(6, "0");
  return `SL-P-${year}-${next}`;
}

export function findPatient(query: string): SamaritanPatient | undefined {
  const q = query.trim().toLowerCase();
  return PATIENTS.find(
    (p) => p.patientId.toLowerCase() === q || p.name.toLowerCase().includes(q) || p.nationalId?.toLowerCase() === q,
  );
}

// ---- Smart tasks / alerts (active care coordination) ----

export interface SmartTask {
  id: string;
  text: string;
  patientId?: string;
  urgency: "info" | "action" | "urgent";
}

export const SMART_TASKS: Record<string, SmartTask[]> = {
  professional: [
    { id: "t1", text: "3 laboratory results awaiting your review", urgency: "action" },
    { id: "t2", text: "Blessing Ncube (SL-P-2026-000003): BP 182/108 — urgent review", patientId: "SL-P-2026-000003", urgency: "urgent" },
    { id: "t3", text: "Tendai Moyo: 30-day hypertension review due 20 Sep", patientId: "SL-P-2026-000001", urgency: "info" },
  ],
  pharmacy: [
    { id: "t4", text: "2 prescriptions waiting for preparation", urgency: "action" },
    { id: "t5", text: "Metformin 500 mg ready for collection — Tendai Moyo", patientId: "SL-P-2026-000001", urgency: "info" },
  ],
  laboratory: [
    { id: "t6", text: "1 incoming test request — sample not yet collected", urgency: "action" },
    { id: "t7", text: "Lipid profile results awaiting verification", urgency: "action" },
  ],
  health_worker: [
    { id: "t8", text: "Blessing Ncube has missed two hypertension reviews — home follow-up recommended", patientId: "SL-P-2026-000003", urgency: "urgent" },
    { id: "t9", text: "Home BP check due for Tendai Moyo on 5 Sep", patientId: "SL-P-2026-000001", urgency: "info" },
  ],
  admin: [
    { id: "t10", text: "18 referrals issued but not yet confirmed as completed", urgency: "action" },
    { id: "t11", text: "Follow-up completion rate at 81% this month", urgency: "info" },
  ],
};

export const STAGE_META: Record<JourneyStage, { label: string; icon: string }> = {
  registration: { label: "Registration", icon: "UserRound" },
  screening: { label: "Screening", icon: "Activity" },
  consultation: { label: "Consultation", icon: "Stethoscope" },
  lab_request: { label: "Lab request", icon: "FlaskConical" },
  lab_result: { label: "Lab result", icon: "FlaskConical" },
  prescription: { label: "Prescription", icon: "Pill" },
  pharmacy: { label: "Pharmacy", icon: "Package" },
  referral: { label: "Referral", icon: "Route" },
  follow_up: { label: "Follow-up", icon: "HeartPulse" },
  review: { label: "Review", icon: "CalendarClock" },
  home_visit: { label: "Home visit", icon: "Home" },
};
