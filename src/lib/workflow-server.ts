// Server-side workflow engine: all interactive care actions persist to Postgres
// and generate notifications. Shared by the /api/workflow routes.

import { db } from "./db";
import { RX_FLOW, LAB_FLOW, REFERRAL_FLOW, type WorkflowState } from "./workflow-types";

function next<T extends string>(flow: readonly T[], cur: T): T {
  const i = flow.indexOf(cur);
  return flow[Math.min(i + 1, flow.length - 1)];
}

async function notify(recipient: string, channel: string, text: string) {
  await db.notification.create({ data: { recipient, channel, text } });
}

export async function getWorkflowState(): Promise<WorkflowState> {
  const [prescriptions, labs, appointments, referrals, homeVisits, notifications] = await Promise.all([
    db.prescription.findMany({ orderBy: { createdAt: "desc" } }),
    db.labRequest.findMany({ orderBy: { createdAt: "desc" } }),
    db.appointment.findMany({ orderBy: { createdAt: "desc" } }),
    db.referral.findMany({ orderBy: { createdAt: "desc" } }),
    db.homeVisit.findMany({ orderBy: { createdAt: "desc" } }),
    db.notification.findMany({ orderBy: { createdAt: "desc" }, take: 30 }),
  ]);

  return {
    prescriptions: prescriptions.map((p) => ({ id: p.id, patientId: p.patientId, patientName: p.patientName, items: p.items, pharmacy: p.pharmacy, status: p.status as any, issuedBy: p.issuedBy, createdAt: p.createdAt.getTime() })),
    labs: labs.map((l) => ({ id: l.id, patientId: l.patientId, patientName: l.patientName, tests: l.tests, lab: l.lab, requestedBy: l.requestedBy, status: l.status as any, result: l.result ?? undefined, createdAt: l.createdAt.getTime() })),
    appointments: appointments.map((a) => ({ id: a.id, patientId: a.patientId, patientName: a.patientName, purpose: a.purpose, when: a.whenAt, status: a.status as any, createdAt: a.createdAt.getTime() })),
    referrals: referrals.map((r) => ({ id: r.id, patientId: r.patientId, patientName: r.patientName, from: r.fromProvider, to: r.toProvider, reason: r.reason, status: r.status as any, createdAt: r.createdAt.getTime() })),
    homeVisits: homeVisits.map((h) => ({ id: h.id, patientId: h.patientId, patientName: h.patientName, purpose: h.purpose, when: h.whenAt, status: h.status as any, outcome: h.outcome ?? undefined })),
    notifications: notifications.map((n) => ({ id: n.id, to: n.recipient as any, channel: n.channel as any, text: n.text, at: n.createdAt.getTime() })),
  };
}

export async function applyAction(action: string, args: any): Promise<WorkflowState> {
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
    case "createReferral": {
      await db.referral.create({ data: { patientId: args.patientId, patientName: args.patientName, fromProvider: args.from, toProvider: args.to, reason: args.reason, status: "created" } });
      await notify("patient", "SMS", `A referral has been created for you to ${args.to}. You will be contacted with the next steps.`);
      break;
    }
    case "advanceReferral": {
      const r = await db.referral.findUnique({ where: { id: args.id } });
      if (r) {
        const n = next(REFERRAL_FLOW, r.status as any);
        if (n === "completed") await notify("patient", "In-app", `Your referral to ${r.toProvider} is complete. A follow-up will be arranged.`);
        await db.referral.update({ where: { id: r.id }, data: { status: n } });
      }
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
  }
  return getWorkflowState();
}

export async function resetWorkflow() {
  await db.$transaction([
    db.notification.deleteMany(),
    db.prescription.deleteMany(),
    db.labRequest.deleteMany(),
    db.appointment.deleteMany(),
    db.referral.deleteMany(),
    db.homeVisit.deleteMany(),
  ]);
  await db.prescription.create({ data: { patientId: "SL-P-2026-000001", patientName: "Tendai Moyo", items: "Metformin 500 mg × 30", pharmacy: "Unity Pharmacy", status: "received", issuedBy: "SL-DR-000245" } });
  await db.labRequest.createMany({ data: [
    { patientId: "SL-P-2026-000001", patientName: "Tendai Moyo", tests: "Lipid profile", lab: "MA360 Partner Laboratory", requestedBy: "SL-DR-000245", status: "processing" },
    { patientId: "SL-P-2026-000003", patientName: "Blessing Ncube", tests: "U&E, HbA1c", lab: "MA360 Partner Laboratory", requestedBy: "SL-DR-000245", status: "requested" },
  ]});
  await db.appointment.create({ data: { patientId: "SL-P-2026-000001", patientName: "Tendai Moyo", purpose: "30-day hypertension review", whenAt: "2026-09-20 10:30", status: "scheduled" } });
  await db.referral.create({ data: { patientId: "SL-P-2026-000003", patientName: "Blessing Ncube", fromProvider: "SL-CHW-000320", toProvider: "Harare Central Hospital", reason: "Uncontrolled hypertension — urgent review", status: "facility_identified" } });
  await db.homeVisit.createMany({ data: [
    { patientId: "SL-P-2026-000001", patientName: "Tendai Moyo", purpose: "Blood-pressure check", whenAt: "2026-09-05 14:00", status: "scheduled" },
    { patientId: "SL-P-2026-000003", patientName: "Blessing Ncube", purpose: "Urgent review escort", whenAt: "Today 15:30", status: "scheduled" },
  ]});
}
