import { db } from "@/lib/db";
import { PatientSearchClient, type PatientRow } from "@/components/app/PatientSearchClient";

function nextPatientId(ids: string[]): string {
  const year = new Date().getFullYear();
  const nums = ids.map((id) => Number(id.split("-").pop())).filter((n) => !Number.isNaN(n));
  const next = (Math.max(0, ...nums) + 1).toString().padStart(6, "0");
  return `SL-P-${year}-${next}`;
}

export default async function PatientsPage() {
  const rows = await db.patient.findMany({
    select: { patientId: true, name: true, age: true, sex: true, location: true, nationalId: true, alerts: true },
    orderBy: { patientId: "asc" },
  });

  const patients: PatientRow[] = rows.map((p) => ({
    patientId: p.patientId,
    name: p.name,
    age: p.age,
    sex: p.sex,
    location: p.location,
    nationalId: p.nationalId,
    urgent: p.alerts.some((a) => a.toLowerCase().includes("urgent")),
  }));

  return <PatientSearchClient patients={patients} nextId={nextPatientId(rows.map((r) => r.patientId))} />;
}
