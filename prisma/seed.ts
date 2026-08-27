// Seed script for MA360 SamaritanLink.
// Populates the database with SYNTHETIC demo data only — no real patient data.
// Run with: npm run db:seed   (or `npm run db:reset` to wipe + reseed)
//
// NOTE: The MVP UI reads from src/lib/data/demo.ts so it can be demonstrated
// without a database. This script mirrors that data into PostgreSQL/SQLite for
// teams that want to run against a live DB. Keep the two in sync.

import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

// Simple salted hash for demo seed users. The app should use a vetted library
// (argon2/bcrypt) in production — see SECURITY.md.
function hash(password: string): string {
  const salt = "ma360-demo-salt";
  return crypto.createHmac("sha256", salt).update(password).digest("hex");
}

async function main() {
  console.log("Resetting demo data…");
  await prisma.auditLog.deleteMany();
  await prisma.followup.deleteMany();
  await prisma.homeVisit.deleteMany();
  await prisma.diagnosticRequest.deleteMany();
  await prisma.referral.deleteMany();
  await prisma.medicineInventory.deleteMany();
  await prisma.pharmacy.deleteMany();
  await prisma.medication.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.consultation.deleteMany();
  await prisma.screening.deleteMany();
  await prisma.professional.deleteMany();
  await prisma.healthWorker.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();

  console.log("Creating demo users…");
  const patientUser = await prisma.user.create({
    data: { name: "Tendai Moyo", email: "patient@demo.samaritanlink", phone: "+263770000001", role: "patient", passwordHash: hash("demo1234") },
  });
  const chwUser = await prisma.user.create({
    data: { name: "Rutendo Nyathi", email: "chw@demo.samaritanlink", phone: "+263770000002", role: "health_worker", passwordHash: hash("demo1234") },
  });
  const proUser = await prisma.user.create({
    data: { name: "Dr. Farai Chikowore", email: "clinician@demo.samaritanlink", phone: "+263770000003", role: "professional", passwordHash: hash("demo1234") },
  });
  await prisma.user.create({
    data: { name: "Unity Pharmacy Desk", email: "pharmacy@demo.samaritanlink", phone: "+263770000004", role: "pharmacy", passwordHash: hash("demo1234") },
  });
  await prisma.user.create({
    data: { name: "MA360 Administrator", email: "admin@demo.samaritanlink", phone: "+263770000005", role: "admin", passwordHash: hash("demo1234") },
  });

  const patient = await prisma.patient.create({
    data: { userId: patientUser.id, sex: "male", location: "Chitungwiza", dateOfBirth: new Date("1972-04-11") },
  });
  const chw = await prisma.healthWorker.create({
    data: { userId: chwUser.id, location: "Epworth" },
  });
  const professional = await prisma.professional.create({
    data: { userId: proUser.id, profession: "doctor", registrationNumber: "MDCZ-DEMO-0042" },
  });

  console.log("Creating clinical demo records…");
  await prisma.screening.create({
    data: {
      patientId: patient.id,
      recordedById: chwUser.id,
      screeningType: "community",
      measurements: JSON.stringify({ bp: "146/92", glucose: 6.9, temp: 36.8, spo2: 97, bmi: 28.4 }),
      status: "requires_followup",
    },
  });

  const prescription = await prisma.prescription.create({
    data: { patientId: patient.id, professionalId: professional.id, status: "ready" },
  });
  await prisma.medication.createMany({
    data: [
      { prescriptionId: prescription.id, name: "Amlodipine", dosage: "5 mg", frequency: "once daily", duration: "30 days" },
      { prescriptionId: prescription.id, name: "Metformin", dosage: "500 mg", frequency: "twice daily", duration: "30 days" },
    ],
  });

  const pharmacy = await prisma.pharmacy.create({ data: { name: "Unity Pharmacy", location: "Harare CBD" } });
  await prisma.medicineInventory.createMany({
    data: [
      { pharmacyId: pharmacy.id, medicineName: "Amlodipine 5 mg", quantity: 120, availabilityStatus: "available" },
      { pharmacyId: pharmacy.id, medicineName: "Metformin 500 mg", quantity: 40, availabilityStatus: "limited" },
    ],
  });

  await prisma.referral.create({
    data: { patientId: patient.id, fromProvider: "Chitungwiza Clinic", toProvider: "Harare Central Hospital", reason: "Specialist hypertension review", status: "appointment" },
  });
  await prisma.diagnosticRequest.create({
    data: { patientId: patient.id, requestedById: proUser.id, testName: "Fasting blood glucose", status: "result_available", result: "6.9 mmol/L — borderline" },
  });
  await prisma.homeVisit.create({
    data: { patientId: patient.id, healthWorkerId: chw.id, visitDate: new Date(Date.now() + 3 * 864e5), purpose: "Blood pressure follow-up", status: "scheduled" },
  });
  await prisma.followup.create({
    data: { patientId: patient.id, type: "appointment", scheduledAt: new Date(Date.now() + 864e5), status: "pending" },
  });

  console.log("Seed complete. Demo password for every account: demo1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
