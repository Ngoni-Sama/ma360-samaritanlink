// Shared domain types for the MA360 SamaritanLink MVP.
// These mirror the Prisma schema so the mock-data layer can be swapped for the
// database with minimal changes. See DATABASE.md.

export type Role =
  | "patient"
  | "health_worker"
  | "professional"
  | "pharmacy"
  | "admin";

export type CareStatus =
  | "within_range"
  | "requires_followup"
  | "requires_urgent_attention";

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  password: string; // demo only — real system stores a hash (see SECURITY.md)
  role: Role;
  location?: string;
}

export interface JourneyStep {
  key: string;
  label: string;
  state: "done" | "current" | "upcoming";
}

export interface QuickAction {
  key: string;
  label: string;
  icon: string;
  href: string;
}

export interface UpcomingItem {
  id: string;
  kind: "appointment" | "followup" | "refill" | "diagnostic";
  title: string;
  when: string;
  location?: string;
}

export interface CareProgramme {
  id: string;
  name: string;
  status: "active" | "monitoring" | "stable";
  nextAction: string;
  lastReading?: string;
}

export interface ScreeningRecord {
  id: string;
  patientName: string;
  age: number;
  sex: string;
  location: string;
  measurements: { label: string; value: string; unit: string }[];
  status: CareStatus;
  recordedBy: string;
  date: string;
}

export interface PharmacyCard {
  id: string;
  name: string;
  location: string;
  availability: "available" | "limited" | "out_of_stock";
  distanceKm: number;
}

export interface PrescriptionItem {
  id: string;
  medicine: string;
  dosage: string;
  duration: string;
  prescriber: string;
  date: string;
  status: "issued" | "reserved" | "ready" | "dispensed";
}

export interface ReferralStep {
  key: string;
  label: string;
  state: "done" | "current" | "upcoming";
  at?: string;
}

export interface DiagnosticItem {
  id: string;
  test: string;
  facility: string;
  date: string;
  status: "requested" | "in_progress" | "result_available";
  result?: string;
}

export interface StatMetric {
  label: string;
  value: string;
  delta?: string;
}
