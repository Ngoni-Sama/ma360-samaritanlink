// -----------------------------------------------------------------------------
// DEMO / SYNTHETIC DATA ONLY.
// None of the records below represent real people or real MA360 pilot figures.
// This layer powers the MVP so it can be demonstrated without a database.
// The production system reads the same shapes from PostgreSQL via Prisma.
// -----------------------------------------------------------------------------

import type {
  CareProgramme,
  DemoUser,
  DiagnosticItem,
  JourneyStep,
  PharmacyCard,
  PrescriptionItem,
  QuickAction,
  ReferralStep,
  ScreeningRecord,
  StatMetric,
  UpcomingItem,
} from "./types";

export const DEMO_USERS: DemoUser[] = [
  { id: "u-pat", name: "Tendai Moyo", email: "patient@demo.samaritanlink", password: "demo1234", role: "patient", location: "Chitungwiza" },
  { id: "u-chw", name: "Rutendo Nyathi", email: "chw@demo.samaritanlink", password: "demo1234", role: "health_worker", location: "Epworth" },
  { id: "u-pro", name: "Dr. Farai Chikowore", email: "clinician@demo.samaritanlink", password: "demo1234", role: "professional", location: "Harare Central" },
  { id: "u-pha", name: "Unity Pharmacy Desk", email: "pharmacy@demo.samaritanlink", password: "demo1234", role: "pharmacy", location: "Harare CBD" },
  { id: "u-lab", name: "MA360 Partner Laboratory", email: "lab@demo.samaritanlink", password: "demo1234", role: "laboratory", location: "Harare" },
  { id: "u-adm", name: "MA360 Administrator", email: "admin@demo.samaritanlink", password: "demo1234", role: "admin", location: "MA360 HQ" },
];

export const ROLE_LABELS: Record<string, string> = {
  patient: "Patient",
  health_worker: "Community Health Worker",
  professional: "Healthcare Professional",
  pharmacy: "Pharmacy",
  laboratory: "Laboratory",
  admin: "Administrator",
};

// --- Patient dashboard ---

export const PATIENT_JOURNEY: JourneyStep[] = [
  { key: "need", label: "Need identified", state: "done" },
  { key: "screening", label: "Screening", state: "done" },
  { key: "clinical", label: "Clinical assessment", state: "current" },
  { key: "diagnostics", label: "Diagnostics", state: "upcoming" },
  { key: "treatment", label: "Treatment", state: "upcoming" },
  { key: "medicine", label: "Medicine", state: "upcoming" },
  { key: "followup", label: "Follow-up", state: "upcoming" },
];

export const PATIENT_QUICK_ACTIONS: QuickAction[] = [
  { key: "find", label: "Find Care", icon: "Compass", href: "/app/navigator" },
  { key: "screen", label: "Request Screening", icon: "Activity", href: "/app/screening" },
  { key: "consult", label: "Consult a Professional", icon: "Stethoscope", href: "/app" },
  { key: "meds", label: "My Medicines", icon: "Pill", href: "/app/pharmacy" },
  { key: "referrals", label: "My Referrals", icon: "Route", href: "/app/referrals" },
  { key: "appointments", label: "My Appointments", icon: "CalendarClock", href: "/app" },
  { key: "diagnostics", label: "My Diagnostics", icon: "FlaskConical", href: "/app/diagnostics" },
  { key: "followup", label: "My Follow-up", icon: "HeartPulse", href: "/app" },
];

export const PATIENT_UPCOMING: UpcomingItem[] = [
  { id: "up1", kind: "appointment", title: "Clinical assessment — General Health", when: "Tomorrow, 10:30", location: "Chitungwiza Clinic" },
  { id: "up2", kind: "diagnostic", title: "Fasting blood glucose", when: "Thu, 08:00", location: "MA360 partner lab" },
  { id: "up3", kind: "refill", title: "Amlodipine refill", when: "In 6 days", location: "Unity Pharmacy" },
  { id: "up4", kind: "followup", title: "Home visit — blood pressure check", when: "Next Mon, 14:00", location: "Home" },
];

export const PATIENT_PROGRAMMES: CareProgramme[] = [
  { id: "cp1", name: "Hypertension Care", status: "active", nextAction: "Blood pressure follow-up", lastReading: "146 / 92 mmHg" },
  { id: "cp2", name: "Diabetes Screening", status: "monitoring", nextAction: "Fasting glucose test", lastReading: "6.9 mmol/L" },
];

// --- Screening module ---

export const SCREENING_RECORDS: ScreeningRecord[] = [
  {
    id: "sc1", patientName: "Tendai Moyo", age: 54, sex: "Male", location: "Chitungwiza",
    measurements: [
      { label: "Blood Pressure", value: "146/92", unit: "mmHg" },
      { label: "Blood Glucose", value: "6.9", unit: "mmol/L" },
      { label: "Temperature", value: "36.8", unit: "°C" },
      { label: "SpO2", value: "97", unit: "%" },
      { label: "BMI", value: "28.4", unit: "kg/m²" },
    ],
    status: "requires_followup", recordedBy: "Rutendo Nyathi (CHW)", date: "2026-08-24",
  },
  {
    id: "sc2", patientName: "Chipo Dube", age: 39, sex: "Female", location: "Epworth",
    measurements: [
      { label: "Blood Pressure", value: "118/76", unit: "mmHg" },
      { label: "Blood Glucose", value: "5.1", unit: "mmol/L" },
      { label: "Temperature", value: "36.6", unit: "°C" },
      { label: "SpO2", value: "99", unit: "%" },
      { label: "BMI", value: "23.1", unit: "kg/m²" },
    ],
    status: "within_range", recordedBy: "Rutendo Nyathi (CHW)", date: "2026-08-24",
  },
  {
    id: "sc3", patientName: "Blessing Ncube", age: 61, sex: "Male", location: "Epworth",
    measurements: [
      { label: "Blood Pressure", value: "182/108", unit: "mmHg" },
      { label: "Blood Glucose", value: "9.8", unit: "mmol/L" },
      { label: "Temperature", value: "37.1", unit: "°C" },
      { label: "SpO2", value: "94", unit: "%" },
      { label: "BMI", value: "31.2", unit: "kg/m²" },
    ],
    status: "requires_urgent_attention", recordedBy: "Rutendo Nyathi (CHW)", date: "2026-08-25",
  },
];

// --- Pharmacy Connect ---

export const PATIENT_PRESCRIPTIONS: PrescriptionItem[] = [
  { id: "rx1", medicine: "Amlodipine", dosage: "5 mg", duration: "30 days", prescriber: "Dr. Farai Chikowore", date: "2026-08-20", status: "ready" },
  { id: "rx2", medicine: "Metformin", dosage: "500 mg", duration: "30 days", prescriber: "Dr. Farai Chikowore", date: "2026-08-20", status: "issued" },
];

export const PHARMACY_CARDS: PharmacyCard[] = [
  { id: "ph1", name: "Unity Pharmacy", location: "Harare CBD", availability: "available", distanceKm: 2.1 },
  { id: "ph2", name: "Greenwood Chemist", location: "Chitungwiza", availability: "limited", distanceKm: 0.8 },
  { id: "ph3", name: "St. Anne's Dispensary", location: "Epworth", availability: "out_of_stock", distanceKm: 4.6 },
];

// --- Referral tracker ---

export const REFERRAL_TIMELINE: ReferralStep[] = [
  { key: "created", label: "Referral Created", state: "done", at: "2026-08-22" },
  { key: "notified", label: "Patient Notified", state: "done", at: "2026-08-22" },
  { key: "facility", label: "Facility Identified", state: "done", at: "2026-08-23" },
  { key: "appointment", label: "Appointment", state: "current", at: "2026-08-27" },
  { key: "completed", label: "Referral Completed", state: "upcoming" },
  { key: "followup", label: "Follow-up", state: "upcoming" },
];

// --- Diagnostics ---

export const DIAGNOSTIC_ITEMS: DiagnosticItem[] = [
  { id: "dx1", test: "Fasting blood glucose", facility: "MA360 partner lab", date: "2026-08-25", status: "result_available", result: "6.9 mmol/L — borderline" },
  { id: "dx2", test: "Lipid profile", facility: "Harare Central Lab", date: "2026-08-26", status: "in_progress" },
  { id: "dx3", test: "Serum creatinine", facility: "MA360 partner lab", date: "2026-08-28", status: "requested" },
];

// --- Role dashboard panels (headline demo figures) ---

export const CHW_PANELS = {
  assignedPatients: 42,
  todaysVisits: 6,
  pendingFollowups: 9,
  referrals: 4,
  screeningTasks: 7,
  alerts: 2,
  visits: [
    { id: "v1", patient: "Tendai Moyo", purpose: "BP follow-up", time: "14:00", status: "scheduled" },
    { id: "v2", patient: "Blessing Ncube", purpose: "Urgent review escort", time: "15:30", status: "escalation_required" },
    { id: "v3", patient: "Chipo Dube", purpose: "Maternal check-in", time: "16:15", status: "scheduled" },
  ],
};

export const PROFESSIONAL_PANELS = {
  consultationsToday: 8,
  patientQueue: 3,
  pendingReferrals: 5,
  diagnosticResults: 4,
  followupPatients: 11,
  chronicPatients: 23,
  queue: [
    { id: "q1", patient: "Tendai Moyo", type: "Chronic — Hypertension", waiting: "waiting 8 min" },
    { id: "q2", patient: "Netsai Gwara", type: "General Health", waiting: "waiting 3 min" },
    { id: "q3", patient: "Blessing Ncube", type: "Urgent review", waiting: "flagged urgent" },
  ],
};

export const PHARMACY_PANELS = {
  prescriptionQueue: 5,
  medicineRequests: 3,
  reserved: 4,
  completedOrders: 27,
  refillRequests: 6,
  queue: [
    { id: "pq1", patient: "Tendai Moyo", medicine: "Amlodipine 5 mg", status: "ready" },
    { id: "pq2", patient: "Tendai Moyo", medicine: "Metformin 500 mg", status: "issued" },
    { id: "pq3", patient: "Netsai Gwara", medicine: "Paracetamol 500 mg", status: "reserved" },
  ],
};

export const ADMIN_METRICS: StatMetric[] = [
  { label: "Patients Registered", value: "1,284", delta: "+64 this week" },
  { label: "Screenings Completed", value: "3,912", delta: "+210 this week" },
  { label: "Consultations", value: "742", delta: "+38 this week" },
  { label: "Referrals", value: "418" },
  { label: "Referrals Completed", value: "301", delta: "72% completion" },
  { label: "Medicines Fulfilled", value: "1,097" },
  { label: "Follow-ups Completed", value: "889", delta: "81% adherence" },
];

export const ADMIN_DIRECTORY = {
  patients: 1284,
  healthWorkers: 58,
  professionals: 46,
  pharmacies: 19,
  diagnostics: 12,
};

// --- Health Navigator canned responses (mock AI) ---

export interface NavigatorReply {
  summary: string;
  information: string[];
  warningSigns: string[];
  recommendation: string;
  suggestedStep: { label: string; href: string };
}

export function navigatorResponse(input: string): NavigatorReply {
  const text = input.toLowerCase();
  const urgent = ["chest pain", "can't breathe", "cannot breathe", "unconscious", "severe bleeding", "stroke", "fits", "seizure"];
  if (urgent.some((u) => text.includes(u))) {
    return {
      summary: "The symptoms you described may indicate an emergency.",
      information: [
        "Emergency warning signs should never be managed at home.",
        "SamaritanLink is a navigation assistant and cannot handle emergencies.",
      ],
      warningSigns: ["Chest pain", "Difficulty breathing", "Loss of consciousness", "Severe bleeding"],
      recommendation: "Seek emergency care immediately — go to the nearest hospital or call local emergency services.",
      suggestedStep: { label: "Find nearest facility", href: "/app/referrals" },
    };
  }
  if (text.includes("headache") || text.includes("dizz")) {
    return {
      summary: "Headaches with dizziness can have many causes, including raised blood pressure.",
      information: [
        "Persistent headaches and dizziness are worth checking, especially if you have high blood pressure.",
        "A simple community screening can measure your blood pressure and blood glucose.",
        "Keep hydrated and rest; note when the symptoms occur and how long they last.",
      ],
      warningSigns: ["Sudden severe headache", "Vision changes", "Weakness on one side", "Confusion"],
      recommendation: "Book a community screening, and consult a professional if symptoms persist or worsen.",
      suggestedStep: { label: "Request a screening", href: "/app/screening" },
    };
  }
  return {
    summary: "Thank you — here is some general guidance and a suggested next step.",
    information: [
      "SamaritanLink helps you reach the right service for your health need.",
      "For most non-urgent concerns, a community screening or a professional consultation is a good starting point.",
      "This assistant provides general information only and does not diagnose or prescribe.",
    ],
    warningSigns: ["Symptoms that are severe, sudden, or rapidly worsening", "High fever that does not settle", "Breathing difficulty"],
    recommendation: "Consider a community screening, then a professional consultation if needed.",
    suggestedStep: { label: "Request a screening", href: "/app/screening" },
  };
}
