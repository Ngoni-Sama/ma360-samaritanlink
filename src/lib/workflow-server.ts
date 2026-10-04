// Server-side workflow engine: all interactive care actions persist to Postgres
// and generate notifications. Shared by the /api/workflow routes.

import { db } from "./db";
import {
  RX_FLOW, LAB_FLOW, REFERRAL_FLOW, REFERRAL_STAGE_LABEL, BARRIERS, BARRIER_LABEL,
  type WorkflowState, type ReferralStatus, type BarrierKey,
} from "./workflow-types";

export interface Viewer { role: string; patientId: string | null }

// Thrown for requests the caller can fix; the route turns it into a 4xx.
export class ActionError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

const CARE_TEAM = ["professional", "health_worker", "admin"];
const BARRIER_KEYS = new Set<string>(BARRIERS.map((b) => b.key));

function next<T extends string>(flow: readonly T[], cur: T): T {
  const i = flow.indexOf(cur);
  return flow[Math.min(i + 1, flow.length - 1)];
}

async function notify(recipient: string, channel: string, text: string) {
  await db.notification.create({ data: { recipient, channel, text } });
}

function requireCareTeam(viewer: Viewer) {
  if (!CARE_TEAM.includes(viewer.role)) throw new ActionError("Only the care team can update referrals.", 403);
}

function requireBarrier(key: unknown): BarrierKey {
  if (typeof key !== "string" || !BARRIER_KEYS.has(key)) throw new ActionError("Choose a barrier from the list.");
  return key as BarrierKey;
}

export async function getWorkflowState(viewer: Viewer | null = null): Promise<WorkflowState> {
  const [prescriptions, labs, appointments, referrals, homeVisits, barriers, notifications] = await Promise.all([
    db.prescription.findMany({ orderBy: { createdAt: "desc" } }),
    db.labRequest.findMany({ orderBy: { createdAt: "desc" } }),
    db.appointment.findMany({ orderBy: { createdAt: "desc" } }),
    db.referral.findMany({ orderBy: { createdAt: "desc" } }),
    db.homeVisit.findMany({ orderBy: { createdAt: "desc" } }),
    db.patientBarrier.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
    db.notification.findMany({ orderBy: { createdAt: "desc" }, take: 30 }),
  ]);

  return {
    prescriptions: prescriptions.map((p) => ({ id: p.id, patientId: p.patientId, patientName: p.patientName, items: p.items, pharmacy: p.pharmacy, status: p.status as any, issuedBy: p.issuedBy, createdAt: p.createdAt.getTime() })),
    labs: labs.map((l) => ({ id: l.id, patientId: l.patientId, patientName: l.patientName, tests: l.tests, lab: l.lab, requestedBy: l.requestedBy, status: l.status as any, result: l.result ?? undefined, createdAt: l.createdAt.getTime() })),
    appointments: appointments.map((a) => ({ id: a.id, patientId: a.patientId, patientName: a.patientName, purpose: a.purpose, when: a.whenAt, status: a.status as any, createdAt: a.createdAt.getTime() })),
    referrals: referrals.map((r) => ({
      id: r.id, patientId: r.patientId, patientName: r.patientName, from: r.fromProvider, to: r.toProvider, reason: r.reason,
      status: r.status as ReferralStatus, createdAt: r.createdAt.getTime(),
      stalled: r.stalled, barrier: (r.barrier ?? undefined) as BarrierKey | undefined, barrierNote: r.barrierNote ?? undefined,
      barrierResponse: r.barrierResponse ?? undefined, stalledAt: r.stalledAt?.getTime(),
    })),
    homeVisits: homeVisits.map((h) => ({ id: h.id, patientId: h.patientId, patientName: h.patientName, purpose: h.purpose, when: h.whenAt, status: h.status as any, outcome: h.outcome ?? undefined })),
    barriers: barriers.map((b) => ({ id: b.id, patientId: b.patientId, patientName: b.patientName, barrier: b.barrier as BarrierKey, note: b.note ?? undefined, source: b.source as any, createdAt: b.createdAt.getTime() })),
    notifications: notifications.map((n) => ({ id: n.id, to: n.recipient as any, channel: n.channel as any, text: n.text, at: n.createdAt.getTime() })),
    viewer,
  };
}

export async function applyAction(action: string, args: any, viewer: Viewer): Promise<WorkflowState> {
  switch (action) {
    case "issuePrescription": {
      await db.prescription.create({ data: { patientId: args.patientId, patientName: args.patientName, items: args.items, pharmacy: args.pharmacy, issuedBy: args.issuedBy, status: "received" } });
      await notify("pharmacy", "In-app", `New prescription for ${args.patientName} (${args.patientId}) received from ${args.issuedBy}.`);
      await notify("patient", "SMS", `Your prescription has been sent to ${args.pharmacy}. You will be notified when it is ready.`);
      break;
    }
    case "advanceRx": {
      const rx = await db.prescription.findUnique({ where: { id: args.id } });
      if (rx) {
        const n = next(RX_FLOW, rx.status as any);
        if (n === "ready") await notify("patient", "WhatsApp", `Your medication (${rx.items}) from ${rx.pharmacy} is ready for collection.`);
        if (n === "collected") await notify("patient", "In-app", `Medication collected from ${rx.pharmacy}. Your care journey has been updated.`);
        await db.prescription.update({ where: { id: rx.id }, data: { status: n } });
      }
      break;
    }
    case "requestLab": {
      await db.labRequest.create({ data: { patientId: args.patientId, patientName: args.patientName, tests: args.tests, lab: args.lab, requestedBy: args.requestedBy, status: "requested" } });
      await notify("laboratory", "In-app", `New test request for ${args.patientName} (${args.patientId}): ${args.tests}.`);
      break;
    }
    case "advanceLab": {
      const l = await db.labRequest.findUnique({ where: { id: args.id } });
      if (l) {
        const n = next(LAB_FLOW, l.status as any);
        if (n === "sent_to_doctor") {
          await notify("doctor", "In-app", `New laboratory results received for ${l.patientName} (${l.patientId}).`);
          await notify("patient", "SMS", `Your laboratory results have been sent to your healthcare provider. Please follow their instructions regarding review.`);
        }
        await db.labRequest.update({ where: { id: l.id }, data: { status: n, result: args.result ?? l.result } });
      }
      break;
    }
    case "scheduleAppointment": {
      await db.appointment.create({ data: { patientId: args.patientId, patientName: args.patientName, purpose: args.purpose, whenAt: args.when, status: "scheduled" } });
      await notify("patient", "SMS", `Dear ${args.patientName}, your follow-up appointment is scheduled for ${args.when}. Contact reception if you need to reschedule.`);
      break;
    }
    case "setApptStatus": {
      const a = await db.appointment.findUnique({ where: { id: args.id } });
      if (a) {
        if (args.status === "missed") await notify("doctor", "In-app", `${a.patientName} missed "${a.purpose}". Follow-up task created.`);
        await db.appointment.update({ where: { id: a.id }, data: { status: args.status } });
      }
      break;
    }

    // ---- Closed-loop referrals ----
    case "createReferral": {
      requireCareTeam(viewer);
      await db.referral.create({ data: { patientId: args.patientId, patientName: args.patientName, fromProvider: args.from, toProvider: args.to, reason: args.reason, status: "created" } });
      await notify("patient", "SMS", `A referral has been created for you to ${args.to}. You will be contacted with the next steps.`);
      break;
    }
    case "advanceReferral": {
      requireCareTeam(viewer);
      const r = await db.referral.findUnique({ where: { id: args.id } });
      if (!r) throw new ActionError("That referral no longer exists.", 404);
      if (r.stalled) throw new ActionError("Record how the barrier was addressed before moving this referral on.");
      const n = next(REFERRAL_FLOW, r.status as ReferralStatus);
      if (n === "received") await notify("patient", "SMS", `${r.toProvider} has received your referral. They will contact you with an appointment.`);
      if (n === "attended") await notify("doctor", "In-app", `${r.patientName} attended their appointment at ${r.toProvider}.`);
      if (n === "treatment") await notify("patient", "In-app", `Your treatment at ${r.toProvider} has started. Your care team will follow up.`);
      if (n === "followup") await notify("patient", "In-app", `Your referral to ${r.toProvider} is complete, including follow-up.`);
      await db.referral.update({ where: { id: r.id }, data: { status: n } });
      break;
    }
    case "stallReferral": {
      requireCareTeam(viewer);
      const barrier = requireBarrier(args.barrier);
      const r = await db.referral.findUnique({ where: { id: args.id } });
      if (!r) throw new ActionError("That referral no longer exists.", 404);
      if (r.status === "followup") throw new ActionError("This referral is already complete.");
      const stuckBefore = next(REFERRAL_FLOW, r.status as ReferralStatus);
      const note = String(args.note ?? "").trim().slice(0, 300) || null;
      await db.referral.update({ where: { id: r.id }, data: { stalled: true, barrier, barrierNote: note, barrierResponse: null, stalledAt: new Date() } });
      await db.patientBarrier.create({ data: { patientId: r.patientId, patientName: r.patientName, barrier, note, source: "referral" } });
      await notify("doctor", "In-app", `Referral for ${r.patientName} is stuck before "${REFERRAL_STAGE_LABEL[stuckBefore]}". Barrier: ${BARRIER_LABEL[barrier]}.`);
      break;
    }
    case "resolveReferral": {
      requireCareTeam(viewer);
      const r = await db.referral.findUnique({ where: { id: args.id } });
      if (!r) throw new ActionError("That referral no longer exists.", 404);
      const response = String(args.response ?? "").trim().slice(0, 300);
      if (!response) throw new ActionError("Describe how the barrier was addressed.");
      await db.referral.update({ where: { id: r.id }, data: { stalled: false, barrierResponse: response } });
      await notify("patient", "SMS", `Your care team has arranged support: ${response}. Your referral to ${r.toProvider} continues.`);
      break;
    }

    // ---- Barriers identified while navigating ----
    case "recordBarriers": {
      // Patients record their own; the care team records for a named patient.
      const patientId = viewer.role === "patient" ? viewer.patientId : CARE_TEAM.includes(viewer.role) ? String(args.patientId ?? "") : null;
      if (!patientId) throw new ActionError("Sign in as a patient, or open a patient's record, to save barriers.", 403);
      const patient = await db.patient.findUnique({ where: { patientId }, select: { name: true } });
      if (!patient) throw new ActionError("Patient record not found.", 404);
      const items: { barrier: BarrierKey; note: string | null }[] = (Array.isArray(args.barriers) ? args.barriers : []).map((b: any) => ({
        barrier: requireBarrier(b?.barrier),
        note: String(b?.note ?? "").trim().slice(0, 300) || null,
      }));
      if (items.length === 0) throw new ActionError("Choose at least one barrier.");
      await db.patientBarrier.createMany({ data: items.map((i) => ({ patientId, patientName: patient.name, barrier: i.barrier, note: i.note, source: "navigator" })) });
      await notify("doctor", "In-app", `${patient.name} reported access barriers: ${items.map((i) => BARRIER_LABEL[i.barrier]).join(", ")}. A health worker should follow up.`);
      break;
    }

    case "completeHomeVisit": {
      const h = await db.homeVisit.findUnique({ where: { id: args.id } });
      if (h) {
        if (args.escalate) await notify("doctor", "In-app", `Home visit for ${h.patientName}: escalation required — ${args.outcome}`);
        await db.homeVisit.update({ where: { id: h.id }, data: { status: args.escalate ? "escalated" : "completed", outcome: args.outcome } });
      }
      break;
    }
    case "reset": {
      await resetWorkflow();
      break;
    }
    default:
      throw new ActionError("Unknown action.");
  }
  return getWorkflowState(viewer);
}

const DAY = 864e5;

export async function resetWorkflow() {
  await db.$transaction([
    db.notification.deleteMany(),
    db.prescription.deleteMany(),
    db.labRequest.deleteMany(),
    db.appointment.deleteMany(),
    db.referral.deleteMany(),
    db.homeVisit.deleteMany(),
    db.patientBarrier.deleteMany(),
  ]);
  const now = Date.now();
  await db.prescription.create({ data: { patientId: "SL-P-2026-000001", patientName: "Tendai Moyo", items: "Metformin 500 mg x 30", pharmacy: "Unity Pharmacy", status: "received", issuedBy: "SL-DR-000245" } });
  await db.labRequest.createMany({ data: [
    { patientId: "SL-P-2026-000001", patientName: "Tendai Moyo", tests: "Lipid profile", lab: "MA360 Partner Laboratory", requestedBy: "SL-DR-000245", status: "processing" },
    { patientId: "SL-P-2026-000003", patientName: "Blessing Ncube", tests: "U&E, HbA1c", lab: "MA360 Partner Laboratory", requestedBy: "SL-DR-000245", status: "requested" },
  ]});
  await db.appointment.create({ data: { patientId: "SL-P-2026-000001", patientName: "Tendai Moyo", purpose: "30-day hypertension review", whenAt: "2026-09-20 10:30", status: "scheduled" } });

  // Referrals at different points of the closed loop, including two that broke.
  await db.referral.createMany({ data: [
    { patientId: "SL-P-2026-000003", patientName: "Blessing Ncube", fromProvider: "SL-CHW-000320", toProvider: "Harare Central Hospital", reason: "Uncontrolled hypertension, urgent review", status: "received", createdAt: new Date(now - 6 * DAY),
      stalled: true, barrier: "transport", barrierNote: "Cannot afford the bus fare to Harare and has no one to go with him.", stalledAt: new Date(now - 2 * DAY) },
    { patientId: "SL-P-2026-000002", patientName: "Chipo Dube", fromProvider: "SL-NUR-000191", toProvider: "Chitungwiza Central", reason: "Antenatal ultrasound at 28 weeks", status: "created", createdAt: new Date(now - 4 * DAY),
      stalled: true, barrier: "caregiving", barrierNote: "No one to look after her two children on clinic days.", stalledAt: new Date(now - 1 * DAY) },
    { patientId: "SL-P-2026-000001", patientName: "Tendai Moyo", fromProvider: "SL-DR-000245", toProvider: "Parirenyatwa Group", reason: "Specialist hypertension review", status: "attended", createdAt: new Date(now - 12 * DAY),
      stalled: false, barrier: "work", barrierNote: "Weekday appointments clashed with his shift.", barrierResponse: "Appointment moved to a Saturday clinic" },
    { patientId: "SL-P-2026-000001", patientName: "Tendai Moyo", fromProvider: "SL-DR-000245", toProvider: "Cimas Radiology", reason: "Retinal screening (diabetes risk)", status: "followup", createdAt: new Date(now - 30 * DAY), stalled: false },
  ]});
  await db.patientBarrier.createMany({ data: [
    { patientId: "SL-P-2026-000003", patientName: "Blessing Ncube", barrier: "transport", note: "Cannot afford the bus fare to Harare and has no one to go with him.", source: "referral", createdAt: new Date(now - 2 * DAY) },
    { patientId: "SL-P-2026-000002", patientName: "Chipo Dube", barrier: "caregiving", note: "No one to look after her two children on clinic days.", source: "referral", createdAt: new Date(now - 1 * DAY) },
    { patientId: "SL-P-2026-000001", patientName: "Tendai Moyo", barrier: "work", note: "Weekday appointments clash with his shift.", source: "navigator", createdAt: new Date(now - 13 * DAY) },
    { patientId: "SL-P-2026-000003", patientName: "Blessing Ncube", barrier: "cost", note: null, source: "navigator", createdAt: new Date(now - 7 * DAY) },
  ]});
  await db.homeVisit.createMany({ data: [
    { patientId: "SL-P-2026-000001", patientName: "Tendai Moyo", purpose: "Blood-pressure check", whenAt: "2026-09-05 14:00", status: "scheduled" },
    { patientId: "SL-P-2026-000003", patientName: "Blessing Ncube", purpose: "Urgent review escort", whenAt: "Today 15:30", status: "scheduled" },
  ]});
}
