// Seed the Neon/Postgres database with the SYNTHETIC demo data.
// Pulls from the app's existing data modules so there is a single source of truth.
// Run: npm run db:seed   (Vercel build runs migrate deploy; seed is run once here.)

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEMO_USERS } from "../src/lib/data/demo";
import { PATIENTS, PROVIDERS, providerForRole } from "../src/lib/data/connected";
import { DIRECTORY_PROVIDERS } from "../src/lib/data/directory";

const prisma = new PrismaClient();

async function main() {
  console.log("Clearing existing data…");
  await prisma.$transaction([
    prisma.notification.deleteMany(),
    prisma.homeVisit.deleteMany(),
    prisma.referral.deleteMany(),
    prisma.appointment.deleteMany(),
    prisma.labRequest.deleteMany(),
    prisma.prescription.deleteMany(),
    prisma.document.deleteMany(),
    prisma.journeyEvent.deleteMany(),
    prisma.labResult.deleteMany(),
    prisma.medication.deleteMany(),
    prisma.patient.deleteMany(),
    prisma.provider.deleteMany(),
    prisma.user.deleteMany(),
    prisma.auditLog.deleteMany(),
  ]);

  // --- Users (hashed passwords) ---
  console.log("Seeding users…");
  for (const u of DEMO_USERS) {
    await prisma.user.create({
      data: {
        name: u.name,
        email: u.email,
        role: u.role,
        passwordHash: await bcrypt.hash(u.password, 10),
        providerId: providerForRole(u.role)?.providerId ?? null,
      },
    });
  }

  // --- Providers (merge connected + directory by providerId) ---
  console.log("Seeding providers…");
  const providerMap = new Map<string, any>();
  for (const p of PROVIDERS) {
    providerMap.set(p.providerId, {
      providerId: p.providerId, name: p.name, role: p.role, profession: p.profession,
      specialty: p.specialty ?? null, facility: p.facility, location: null,
      registration: p.registrationNumber ?? null, category: null, available: true,
    });
  }
  for (const d of DIRECTORY_PROVIDERS) {
    const existing = providerMap.get(d.id) ?? {};
    providerMap.set(d.id, {
      providerId: d.id, name: d.name, role: existing.role ?? "professional",
      profession: existing.profession ?? d.specialty, specialty: d.specialty,
      facility: d.facility, location: d.location, registration: existing.registration ?? null,
      category: d.category, available: d.available,
    });
  }
  for (const p of providerMap.values()) await prisma.provider.create({ data: p });

  // --- Patients + related records ---
  console.log("Seeding patients…");
  for (const pt of PATIENTS) {
    await prisma.patient.create({
      data: {
        patientId: pt.patientId, nationalId: pt.nationalId ?? null, name: pt.name, age: pt.age,
        sex: pt.sex, contact: pt.contact, location: pt.location, emergencyContact: pt.emergencyContact,
        allergies: pt.allergies, alerts: pt.alerts, conditions: pt.conditions,
        medications: { create: pt.medications.map((m) => ({ name: m.name, dosage: m.dosage, frequency: m.frequency, status: m.status, pharmacy: m.pharmacy ?? null })) },
        labResults: { create: pt.labResults.map((l) => ({ test: l.test, value: l.value, flag: l.flag, date: l.date })) },
        journey: { create: pt.journey.map((j) => ({ date: j.date, stage: j.stage, title: j.title, detail: j.detail, by: j.by, status: j.status, patientVisible: j.patientVisible })) },
        documents: { create: pt.documents.map((d) => ({ name: d.name, kind: d.kind, date: d.date })) },
      },
    });
  }

  // --- Workflow seed rows ---
  console.log("Seeding workflow…");
  await prisma.prescription.create({ data: { patientId: "SL-P-2026-000001", patientName: "Tendai Moyo", items: "Metformin 500 mg × 30", pharmacy: "Unity Pharmacy", status: "received", issuedBy: "SL-DR-000245" } });
  await prisma.labRequest.createMany({ data: [
    { patientId: "SL-P-2026-000001", patientName: "Tendai Moyo", tests: "Lipid profile", lab: "MA360 Partner Laboratory", requestedBy: "SL-DR-000245", status: "processing" },
    { patientId: "SL-P-2026-000003", patientName: "Blessing Ncube", tests: "U&E, HbA1c", lab: "MA360 Partner Laboratory", requestedBy: "SL-DR-000245", status: "requested" },
  ]});
  await prisma.appointment.create({ data: { patientId: "SL-P-2026-000001", patientName: "Tendai Moyo", purpose: "30-day hypertension review", whenAt: "2026-09-20 10:30", status: "scheduled" } });
  await prisma.referral.create({ data: { patientId: "SL-P-2026-000003", patientName: "Blessing Ncube", fromProvider: "SL-CHW-000320", toProvider: "Harare Central Hospital", reason: "Uncontrolled hypertension — urgent review", status: "facility_identified" } });
  await prisma.homeVisit.createMany({ data: [
    { patientId: "SL-P-2026-000001", patientName: "Tendai Moyo", purpose: "Blood-pressure check", whenAt: "2026-09-05 14:00", status: "scheduled" },
    { patientId: "SL-P-2026-000003", patientName: "Blessing Ncube", purpose: "Urgent review escort", whenAt: "Today 15:30", status: "scheduled" },
  ]});

  console.log("Seed complete. Demo password for every account: demo1234");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
