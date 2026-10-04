import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";
import { Icon } from "@/components/ui/Icon";
import { GlassCard } from "@/components/ui/primitives";
import { PageHeader } from "@/components/app/PageHeader";
import { EquityIntelligence } from "@/components/app/workflow/EquityIntelligence";
import { ADMIN_METRICS } from "@/lib/data/demo";
import { REFERRAL_FLOW, REFERRAL_STAGE_LABEL, BARRIER_LABEL, type BarrierKey, type ReferralStatus } from "@/lib/workflow-types";

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
    referralRows, barrierRows, patientRows,
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
    db.referral.findMany({ select: { status: true, stalled: true, barrier: true, barrierResponse: true, patientId: true } }),
    db.patientBarrier.findMany({ select: { barrier: true, source: true } }),
    db.patient.findMany({ select: { patientId: true, sex: true, location: true } }),
  ]);

  const g = (rows: any[], key: string) => rows.find((r) => r.status === key)?._count._all ?? 0;
  const rxCollected = g(rxByStatus, "collected");
  const labReturned = g(labByStatus, "sent_to_doctor");
  const apptCompleted = g(apptByStatus, "completed");
  const apptMissed = g(apptByStatus, "missed");
  const refCompleted = g(refByStatus, "followup");
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
    { label: "Referral completion", n: refCompleted, d: referrals, hint: "referrals through to follow-up completed" },
    { label: "Medicine fulfilment", n: rxCollected, d: prescriptions, hint: "prescriptions collected" },
    { label: "Lab results returned", n: labReturned, d: labs, hint: "requests sent back to clinician" },
    { label: "Appointment attendance", n: apptCompleted, d: apptCompleted + apptMissed, hint: "completed vs missed" },
    { label: "Home-visit completion", n: visitsCompleted, d: visits, hint: "visits completed or escalated" },
    { label: "Barriers responded to", n: referralRows.filter((r) => r.barrier && r.barrierResponse).length, d: referralRows.filter((r) => r.barrier).length, hint: "referral barriers with a recorded response" },
  ];

  // ---- Closed-loop referrals: where and why care journeys break ----
  const idx = (s: string) => REFERRAL_FLOW.indexOf(s as ReferralStatus);
  const stages = REFERRAL_FLOW.map((s, i) => ({
    label: REFERRAL_STAGE_LABEL[s],
    reached: referralRows.filter((r) => idx(r.status) >= i).length,
    stuck: i === 0 ? 0 : referralRows.filter((r) => r.stalled && idx(r.status) === i - 1).length,
  }));
  const countBy = <T,>(rows: T[], key: (r: T) => string | null | undefined) =>
    Object.entries(rows.reduce<Record<string, number>>((acc, r) => { const k = key(r); if (k) acc[k] = (acc[k] ?? 0) + 1; return acc; }, {}))
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  const broke = referralRows.filter((r) => r.barrier); // journeys that hit a barrier, resolved or not
  const brokeReasons = countBy(broke, (r) => BARRIER_LABEL[r.barrier as BarrierKey]);
  const stillStalled = countBy(referralRows.filter((r) => r.stalled), (r) => BARRIER_LABEL[r.barrier as BarrierKey]);
  const navReasons = countBy(barrierRows.filter((b) => b.source === "navigator"), (b) => BARRIER_LABEL[b.barrier as BarrierKey]);
  const pMap = new Map(patientRows.map((p) => [p.patientId, p]));
  const brokeBySex = countBy(broke, (r) => pMap.get(r.patientId)?.sex);
  const brokeByLocation = countBy(broke, (r) => pMap.get(r.patientId)?.location);

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
        <p className="mt-0.5 text-sm text-ink-500">Live counts across the connected journey. They grow as the platform is used.</p>
        <div className="mt-4 space-y-2.5">
          {funnel.map((f, i) => (
            <div key={f.label} className="flex items-center gap-3">
              <div className="flex w-28 shrink-0 items-center gap-2 sm:w-44">
                <Icon name={f.icon} className="h-4 w-4 text-brand-600" />
                <span className="text-xs font-medium text-ink-700 sm:text-sm">{f.label}</span>
              </div>
              <div className="h-7 flex-1 overflow-hidden rounded-full bg-ink-100">
                <div className="flex h-full items-center justify-end rounded-full bg-brand-700 px-3 text-xs font-bold tabular-nums text-white transition-all" style={{ width: `${Math.max(8, pct(f.value, funnelMax))}%` }}>
                  {f.value}
                </div>
              </div>
              {i > 0 && <span className="w-12 shrink-0 text-right text-xs tabular-nums text-ink-500">{pct(f.value, funnel[0].value)}%</span>}
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Completion rates */}
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rates.map((r) => (
          <GlassCard key={r.label}>
            <p className="text-xs font-medium text-ink-500">{r.label}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-ink-900">{pct(r.n, r.d)}%</p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
              <div className="h-full rounded-full bg-brand-500" style={{ width: `${pct(r.n, r.d)}%` }} />
            </div>
            <p className="mt-1.5 text-xs text-ink-500"><span className="tabular-nums">{r.n}/{r.d}</span> {r.hint}</p>
          </GlassCard>
        ))}
      </div>

      {/* Closed-loop referrals */}
      <GlassCard className="mb-4">
        <h2 className="text-sm font-bold text-ink-900">Referral continuity: where care journeys break</h2>
        <p className="mt-0.5 max-w-prose text-sm text-ink-500">A referral created is not care completed. How many referrals reached each stage, how many are stuck before it, and why.</p>
        <ol className="mt-4 space-y-2.5">
          {stages.map((s, i) => (
            <li key={s.label} className="flex items-center gap-3">
              <span className="w-28 shrink-0 text-xs font-medium text-ink-700 sm:w-44 sm:text-sm">{i + 1}. {s.label}</span>
              <div className="h-7 flex-1 overflow-hidden rounded-full bg-ink-100">
                <div className="flex h-full items-center justify-end rounded-full bg-brand-700 px-3 text-xs font-bold tabular-nums text-white" style={{ width: `${Math.max(8, pct(s.reached, Math.max(1, referralRows.length)))}%` }}>
                  {s.reached}
                </div>
              </div>
              <span className="w-24 shrink-0 text-right text-xs sm:w-28">
                {s.stuck > 0 ? <span className="font-semibold text-rose-700">{s.stuck} stuck before</span> : <span className="text-ink-500">none stuck</span>}
              </span>
            </li>
          ))}
        </ol>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold text-ink-900">Why journeys broke</h3>
            <p className="text-sm text-ink-500">All referrals that hit a barrier. {stillStalled.reduce((n, r) => n + r.value, 0)} still stalled.</p>
            <BreakdownBars rows={brokeReasons} tone="rose" empty="No referral has stalled yet." />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink-900">Barriers reported while navigating</h3>
            <p className="text-sm text-ink-500">Raised by patients before or during care.</p>
            <BreakdownBars rows={navReasons} tone="amber" empty="No barriers reported yet." />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink-900">Broken journeys by sex</h3>
            <BreakdownBars rows={brokeBySex} empty="No data yet." />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink-900">Broken journeys by location</h3>
            <BreakdownBars rows={brokeByLocation} empty="No data yet." />
          </div>
        </div>
      </GlassCard>

      {/* Equity breakdown */}
      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <GlassCard>
          <h2 className="text-sm font-bold text-ink-900">Access by sex</h2>
          <p className="mt-0.5 text-sm text-ink-500">Who is entering care, by sex.</p>
          <BreakdownBars rows={bySex.map((r) => ({ label: r.sex, value: r._count._all }))} />
        </GlassCard>
        <GlassCard>
          <h2 className="text-sm font-bold text-ink-900">Access by location</h2>
          <p className="mt-0.5 text-sm text-ink-500">Geographic reach across communities.</p>
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
          <p className="mt-0.5 text-sm text-ink-500">Aggregate figures for a full pilot cohort. Synthetic, for planning only.</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {ADMIN_METRICS.slice(0, 6).map((m) => (
              <div key={m.label} className="rounded-2xl border border-white/60 bg-white/60 px-3 py-2.5">
                <p className="text-lg font-bold tabular-nums text-ink-900">{m.value}</p>
                <p className="text-xs text-ink-500">{m.label}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </>
  );
}

function BreakdownBars({ rows, tone = "brand", empty }: { rows: { label: string; value: number }[]; tone?: "brand" | "rose" | "amber"; empty?: string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  const fill = { brand: "bg-brand-700", rose: "bg-rose-700", amber: "bg-amber-700" }[tone];
  if (rows.length === 0) return <p className="mt-3 text-sm text-ink-500">{empty ?? "No data yet."}</p>;
  return (
    <div className="mt-3 space-y-2">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-3">
          <span className="w-32 shrink-0 text-xs font-medium leading-tight text-ink-700 sm:w-40">{r.label}</span>
          <div className="h-6 flex-1 overflow-hidden rounded-full bg-ink-100">
            <div className={`flex h-full items-center justify-end rounded-full px-2.5 text-xs font-bold tabular-nums text-white ${fill}`} style={{ width: `${Math.max(12, (r.value / max) * 100)}%` }}>
              {r.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}