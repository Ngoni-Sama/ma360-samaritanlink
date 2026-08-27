import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { GlassCard, Tag } from "@/components/ui/primitives";
import { PageHeader } from "./PageHeader";
import {
  ADMIN_DIRECTORY, ADMIN_METRICS, CHW_PANELS, PATIENT_PROGRAMMES,
  PATIENT_QUICK_ACTIONS, PATIENT_JOURNEY, PATIENT_UPCOMING, PHARMACY_PANELS,
  PROFESSIONAL_PANELS,
} from "@/lib/data/demo";

function StatTile({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <GlassCard className="flex items-center gap-4">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600/10 text-brand-700">
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <div>
        <p className="text-2xl font-bold leading-none text-ink-900">{value}</p>
        <p className="mt-1 text-xs font-medium text-ink-500">{label}</p>
      </div>
    </GlassCard>
  );
}

const UPCOMING_ICON: Record<string, string> = {
  appointment: "CalendarClock", followup: "HeartPulse", refill: "Pill", diagnostic: "FlaskConical",
};

// --------------------------------------------------------------------------
// Patient
// --------------------------------------------------------------------------
export function PatientDashboard({ name }: { name: string }) {
  return (
    <>
      <PageHeader title={`Welcome to SamaritanLink, ${name.split(" ")[0]}`} subtitle="Your connected health journey in one place." />

      <GlassCard className="mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-ink-900">Your health journey</h2>
          <Icon name="Route" className="h-5 w-5 text-brand-600" />
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {PATIENT_JOURNEY.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <div
                className={`flex shrink-0 flex-col items-center gap-1.5 rounded-2xl border px-3 py-2.5 ${
                  s.state === "done"
                    ? "border-brand-200 bg-brand-50"
                    : s.state === "current"
                    ? "border-brand-500 bg-brand-600 text-white shadow-glass"
                    : "border-ink-200 bg-white/50"
                }`}
              >
                <Icon
                  name={s.state === "done" ? "CheckCircle2" : s.state === "current" ? "HeartPulse" : "ClipboardList"}
                  className={`h-4 w-4 ${s.state === "current" ? "text-white" : "text-brand-600"}`}
                />
                <span className={`whitespace-nowrap text-[11px] font-medium ${s.state === "current" ? "text-white" : "text-ink-600"}`}>
                  {s.label}
                </span>
              </div>
              {i < PATIENT_JOURNEY.length - 1 && <Icon name="ArrowRight" className="h-4 w-4 shrink-0 text-brand-300" />}
            </div>
          ))}
        </div>
      </GlassCard>

      <h2 className="mb-3 mt-6 text-sm font-bold text-ink-900">Quick actions</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {PATIENT_QUICK_ACTIONS.map((a) => (
          <Link
            key={a.key}
            href={a.href}
            className="glass-panel flex flex-col items-start gap-3 p-4 transition hover:-translate-y-0.5 hover:shadow-glass-lg"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600/10 text-brand-700">
              <Icon name={a.icon} className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold text-ink-900">{a.label}</span>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <GlassCard>
          <h2 className="text-sm font-bold text-ink-900">Upcoming</h2>
          <div className="mt-3 space-y-2.5">
            {PATIENT_UPCOMING.map((u) => (
              <div key={u.id} className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/60 px-4 py-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600/10 text-brand-700">
                  <Icon name={UPCOMING_ICON[u.kind]} className="h-4.5 w-4.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink-900">{u.title}</p>
                  <p className="text-xs text-ink-500">{u.location}</p>
                </div>
                <span className="whitespace-nowrap text-xs font-medium text-brand-700">{u.when}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="text-sm font-bold text-ink-900">Care status</h2>
          <div className="mt-3 space-y-2.5">
            {PATIENT_PROGRAMMES.map((p) => (
              <div key={p.id} className="rounded-2xl border border-white/60 bg-white/60 px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-ink-900">{p.name}</p>
                  <Tag tone={p.status === "active" ? "green" : "amber"}>
                    {p.status === "active" ? "Active" : "Monitoring"}
                  </Tag>
                </div>
                <p className="mt-1.5 text-xs text-ink-500">
                  Next action: <span className="font-medium text-ink-700">{p.nextAction}</span>
                </p>
                {p.lastReading && <p className="text-xs text-ink-500">Last reading: {p.lastReading}</p>}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </>
  );
}

// --------------------------------------------------------------------------
// Community Health Worker
// --------------------------------------------------------------------------
export function HealthWorkerDashboard({ name }: { name: string }) {
  const p = CHW_PANELS;
  return (
    <>
      <PageHeader title={`Community dashboard`} subtitle={`${name} · frontline care coordination`} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatTile label="Assigned patients" value={p.assignedPatients} icon="Users" />
        <StatTile label="Today's visits" value={p.todaysVisits} icon="Home" />
        <StatTile label="Pending follow-ups" value={p.pendingFollowups} icon="HeartPulse" />
        <StatTile label="Referrals" value={p.referrals} icon="Route" />
        <StatTile label="Screening tasks" value={p.screeningTasks} icon="Activity" />
        <StatTile label="Alerts" value={p.alerts} icon="Bell" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <GlassCard>
          <h2 className="text-sm font-bold text-ink-900">Today&apos;s visits</h2>
          <div className="mt-3 space-y-2.5">
            {p.visits.map((v) => (
              <div key={v.id} className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/60 px-4 py-3">
                <span className="text-sm font-semibold text-brand-700">{v.time}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink-900">{v.patient}</p>
                  <p className="text-xs text-ink-500">{v.purpose}</p>
                </div>
                <Tag tone={v.status === "escalation_required" ? "rose" : "brand"}>
                  {v.status === "escalation_required" ? "Escalate" : "Scheduled"}
                </Tag>
              </div>
            ))}
          </div>
        </GlassCard>
        <GlassCard>
          <h2 className="text-sm font-bold text-ink-900">Field actions</h2>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[
              { label: "Register patient", icon: "UserRound" },
              { label: "Conduct screening", icon: "Activity" },
              { label: "Create referral", icon: "Route" },
              { label: "Record visit", icon: "ClipboardCheck" },
              { label: "Schedule follow-up", icon: "CalendarClock" },
              { label: "Raise alert", icon: "Bell" },
            ].map((a) => (
              <button key={a.label} className="glass flex flex-col items-start gap-2 rounded-2xl p-3 text-left hover:bg-white">
                <Icon name={a.icon} className="h-5 w-5 text-brand-700" />
                <span className="text-xs font-semibold text-ink-800">{a.label}</span>
              </button>
            ))}
          </div>
        </GlassCard>
      </div>
    </>
  );
}

// --------------------------------------------------------------------------
// Healthcare Professional
// --------------------------------------------------------------------------
export function ProfessionalDashboard({ name }: { name: string }) {
  const p = PROFESSIONAL_PANELS;
  return (
    <>
      <PageHeader title="Clinical dashboard" subtitle={`${name} · prototype clinical workflows`} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatTile label="Consultations today" value={p.consultationsToday} icon="Stethoscope" />
        <StatTile label="Patient queue" value={p.patientQueue} icon="Users" />
        <StatTile label="Pending referrals" value={p.pendingReferrals} icon="Route" />
        <StatTile label="Diagnostic results" value={p.diagnosticResults} icon="FlaskConical" />
        <StatTile label="Follow-up patients" value={p.followupPatients} icon="HeartPulse" />
        <StatTile label="ChronicCare" value={p.chronicPatients} icon="LineChart" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <GlassCard>
          <h2 className="text-sm font-bold text-ink-900">Patient queue</h2>
          <div className="mt-3 space-y-2.5">
            {p.queue.map((q) => (
              <div key={q.id} className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/60 px-4 py-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600/10 text-brand-700">
                  <Icon name="UserRound" className="h-4.5 w-4.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink-900">{q.patient}</p>
                  <p className="text-xs text-ink-500">{q.type}</p>
                </div>
                <span className="whitespace-nowrap text-xs font-medium text-ink-500">{q.waiting}</span>
              </div>
            ))}
          </div>
        </GlassCard>
        <GlassCard>
          <h2 className="text-sm font-bold text-ink-900">Clinical actions</h2>
          <p className="mt-1 text-xs text-ink-500">Prototype only — no real prescribing or clinical decisions.</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[
              { label: "Review patient", icon: "ClipboardList" },
              { label: "Conduct consultation", icon: "Stethoscope" },
              { label: "Record notes", icon: "ClipboardCheck" },
              { label: "Request diagnostics", icon: "FlaskConical" },
              { label: "Create referral", icon: "Route" },
              { label: "Demo prescription", icon: "Pill" },
            ].map((a) => (
              <button key={a.label} className="glass flex flex-col items-start gap-2 rounded-2xl p-3 text-left hover:bg-white">
                <Icon name={a.icon} className="h-5 w-5 text-brand-700" />
                <span className="text-xs font-semibold text-ink-800">{a.label}</span>
              </button>
            ))}
          </div>
        </GlassCard>
      </div>
    </>
  );
}

// --------------------------------------------------------------------------
// Pharmacy
// --------------------------------------------------------------------------
export function PharmacyDashboard({ name }: { name: string }) {
  const p = PHARMACY_PANELS;
  return (
    <>
      <PageHeader title="Pharmacy dashboard" subtitle={`${name} · mock inventory`} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatTile label="Prescription queue" value={p.prescriptionQueue} icon="ClipboardList" />
        <StatTile label="Medicine requests" value={p.medicineRequests} icon="Package" />
        <StatTile label="Reserved" value={p.reserved} icon="BadgeCheck" />
        <StatTile label="Completed orders" value={p.completedOrders} icon="CheckCircle2" />
        <StatTile label="Refill requests" value={p.refillRequests} icon="Pill" />
      </div>
      <GlassCard className="mt-6">
        <h2 className="text-sm font-bold text-ink-900">Prescription queue</h2>
        <div className="mt-3 space-y-2.5">
          {p.queue.map((q) => (
            <div key={q.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/60 bg-white/60 px-4 py-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600/10 text-brand-700">
                <Icon name="Pill" className="h-4.5 w-4.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink-900">{q.medicine}</p>
                <p className="text-xs text-ink-500">{q.patient}</p>
              </div>
              <Tag tone={q.status === "ready" ? "green" : q.status === "reserved" ? "amber" : "neutral"}>
                {q.status}
              </Tag>
              <div className="flex gap-2">
                <button className="btn-secondary px-3 py-1.5 text-xs">Confirm</button>
                <button className="btn-primary px-3 py-1.5 text-xs">Mark ready</button>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </>
  );
}

// --------------------------------------------------------------------------
// Administrator
// --------------------------------------------------------------------------
export function AdminDashboard({ name }: { name: string }) {
  return (
    <>
      <PageHeader title="Administrator dashboard" subtitle={`${name} · pilot overview (synthetic data)`} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatTile label="Patients" value={ADMIN_DIRECTORY.patients.toLocaleString()} icon="Users" />
        <StatTile label="Health workers" value={ADMIN_DIRECTORY.healthWorkers} icon="UserRound" />
        <StatTile label="Professionals" value={ADMIN_DIRECTORY.professionals} icon="Stethoscope" />
        <StatTile label="Pharmacies" value={ADMIN_DIRECTORY.pharmacies} icon="Pill" />
        <StatTile label="Diagnostic partners" value={ADMIN_DIRECTORY.diagnostics} icon="FlaskConical" />
      </div>

      <h2 className="mb-3 mt-6 text-sm font-bold text-ink-900">Pilot statistics</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {ADMIN_METRICS.map((m) => (
          <GlassCard key={m.label}>
            <p className="text-xs font-medium text-ink-500">{m.label}</p>
            <p className="mt-1 text-2xl font-bold text-ink-900">{m.value}</p>
            {m.delta && <p className="mt-1 text-xs font-medium text-brand-600">{m.delta}</p>}
          </GlassCard>
        ))}
      </div>
    </>
  );
}
