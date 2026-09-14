import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";
import { Icon } from "@/components/ui/Icon";
import { GlassCard } from "@/components/ui/primitives";
import { PageHeader } from "@/components/app/PageHeader";
import { EquityIntelligence } from "@/components/app/workflow/EquityIntelligence";
import { ADMIN_METRICS } from "@/lib/data/demo";

export const dynamic = "force-dynamic";

function pct(n: number, d: number) {
  return d === 0 ? 0 : Math.round((n / d) * 100);
}

export default async function IntelligencePage() {
  const user = await getCurrentUser();
  if (!user) return null;
  // Health Intelligence is an aggregated, privacy-controlled view.
  if (user.role !== "admin") redirect("/app");

  const [
    patients, prescriptions, labs, appts, referrals, visits,
    rxByStatus, labByStatus, apptByStatus, refByStatus, visitByStatus, stageDist, bySex, byLocation,
  ] = await Promise.all([
    db.patient.count(),
    db.prescription.count(),
    db.labRequest.count(),
    db.appointment.count(),
    db.referral.count(),
    db.homeVisit.count(),
    db.prescription.groupBy({ by: ["status"], _count: { _all: true } }),
    db.labRequest.groupBy({ by: ["status"], _count: { _all: true } }),
    db.appointment.groupBy({ by: ["status"], _count: { _all: true } }),
    db.referral.groupBy({ by: ["status"], _count: { _all: true } }),
    db.homeVisit.groupBy({ by: ["status"], _count: { _all: true } }),
    db.journeyEvent.groupBy({ by: ["stage"], _count: { _all: true } }),
    db.patient.groupBy({ by: ["sex"], _count: { _all: true } }),
    db.patient.groupBy({ by: ["location"], _count: { _all: true } }),
  ]);

  const g = (rows: any[], key: string) => rows.find((r) => r.status === key)?._count._all ?? 0;
  const rxCollected = g(rxByStatus, "collected");
  const labReturned = g(labByStatus, "sent_to_doctor");
  const apptCompleted = g(apptByStatus, "completed");
  const apptMissed = g(apptByStatus, "missed");
  const refCompleted = g(refByStatus, "completed") + g(refByStatus, "followup");
  const visitsCompleted = g(visitByStatus, "completed") + g(visitByStatus, "escalated");

  // Care continuum (live counts)
  const stage = (s: string) => stageDist.find((r) => r.stage === s)?._count._all ?? 0;
  const funnel = [
    { label: "Registered", value: patients, icon: "UserRound" },
    { label: "Screened", value: stage("screening") || 0, icon: "Activity" },
    { label: "Clinical assessment", value: stage("consultation") || 0, icon: "Stethoscope" },
    { label: "Diagnostics", value: labs, icon: "FlaskConical" },
    { label: "Medicines", value: prescriptions, icon: "Pill" },
    { label: "Referral", value: referrals, icon: "Route" },
    { label: "Follow-up", value: visits + apptCompleted, icon: "HeartPulse" },
  ];
  const funnelMax = Math.max(1, ...funnel.map((f) => f.value));

  const rates = [
    { label: "Referral completion", n: refCompleted, d: referrals, hint: "referrals reaching completion/follow-up" },
    { label: "Medicine fulfilment", n: rxCollected, d: prescriptions, hint: "prescriptions collected" },
    { label: "Lab results returned", n: labReturned, d: labs, hint: "requests sent back to clinician" },
    { label: "Appointment attendance", n: apptCompleted, d: apptCompleted + apptMissed, hint: "completed vs missed" },
    { label: "Home-visit completion", n: visitsCompleted, d: visits, hint: "visits completed or escalated" },
  ];

  return (
    <>
      <PageHeader
        title="Health Intelligence — M&E dashboard"
        subtitle="Live monitoring & evaluation from the connected-care database, with an equity lens."
        action={<span className="pill border border-emerald-200 bg-emerald-50 text-emerald-700"><Icon name="LineChart" className="h-3.5 w-3.5" /> Live data</span>}
      />

      {/* Care continuum funnel */}
      <GlassCard className="mb-4">
        <h2 className="text-sm font-bold text-ink-900">Care continuum — coverage funnel</h2>
        <p className="text-xs text-ink-500">Live counts across the connected journey (grows as the platform is used).</p>
        <div className="mt-4 space-y-2.5">
          {funnel.map((f, i) => (
            <div key={f.label} className="flex items-center gap-3">
              <div className="flex w-40 shrink-0 items-center gap-2">
                <Icon name={f.icon} className="h-4 w-4 text-brand-600" />
                <span className="text-xs font-medium text-ink-700">{f.label}</span>
              </div>
              <div className="h-7 flex-1 overflow-hidden rounded-full bg-ink-100">
                <div className="flex h-full items-center justify-end rounded-full bg-brand-500 px-3 text-xs font-bold text-white transition-all" style={{ width: `${Math.max(8, pct(f.value, funnelMax))}%` }}>
                  {f.value}
                </div>
              </div>
              {i > 0 && <span className="w-12 shrink-0 text-right text-xs text-ink-400">{pct(f.value, funnel[0].value)}%</span>}
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Completion rates */}
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {rates.map((r) => (
          <GlassCard key={r.label}>
            <p className="text-xs font-medium text-ink-500">{r.label}</p>
            <p className="mt-1 text-2xl font-bold text-ink-900">{pct(r.n, r.d)}%</p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
              <div className="h-full rounded-full bg-brand-500" style={{ width: `${pct(r.n, r.d)}%` }} />
            </div>
            <p className="mt-1.5 text-[11px] text-ink-400">{r.n}/{r.d} {r.hint}</p>
          </GlassCard>
        ))}
      </div>

      {/* Equity breakdown */}
      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <GlassCard>
          <h2 className="text-sm font-bold text-ink-900">Access by sex</h2>
          <p className="text-xs text-ink-500">Who is entering care (equity lens).</p>
          <BreakdownBars rows={bySex.map((r) => ({ label: r.sex, value: r._count._all }))} />
        </GlassCard>
        <GlassCard>
          <h2 className="text-sm font-bold text-ink-900">Access by location</h2>
          <p className="text-xs text-ink-500">Geographic reach across communities.</p>
          <BreakdownBars rows={byLocation.map((r) => ({ label: r.location, value: r._count._all }))} />
        </GlassCard>
      </div>

      {/* Equity lens + illustrative pilot targets */}
      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <EquityIntelligence />
        <GlassCard>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-ink-900">Pilot programme targets</h2>
            <span className="pill border border-ink-200 bg-white/70 text-ink-500">Illustrative</span>
          </div>
          <p className="text-xs text-ink-500">Aggregate figures for a full pilot cohort (synthetic).</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {ADMIN_METRICS.slice(0, 6).map((m) => (
              <div key={m.label} className="rounded-2xl border border-white/60 bg-white/60 px-3 py-2.5">
                <p className="text-lg font-bold text-ink-900">{m.value}</p>
                <p className="text-[11px] text-ink-500">{m.label}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </>
  );
}

function BreakdownBars({ rows }: { rows: { label: string; value: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="mt-3 space-y-2">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-3">
          <span className="w-28 shrink-0 truncate text-xs font-medium text-ink-700">{r.label}</span>
          <div className="h-6 flex-1 overflow-hidden rounded-full bg-ink-100">
            <div className="flex h-full items-center justify-end rounded-full bg-brand-400 px-2.5 text-[11px] font-bold text-white" style={{ width: `${Math.max(12, (r.value / max) * 100)}%` }}>
              {r.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
