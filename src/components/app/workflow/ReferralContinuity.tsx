"use client";

import { Icon } from "@/components/ui/Icon";
import { GlassCard } from "@/components/ui/primitives";
import { LoadingRows } from "@/components/ui/EmptyState";
import { useWorkflow, useWorkflowStatus, REFERRAL_FLOW, REFERRAL_STAGE_LABEL, BARRIER_LABEL, type BarrierKey } from "@/lib/store/workflow";

// Live closed-loop summary: how far referrals get, and where and why they break.
// A referral created is not care completed.
export function ReferralContinuity() {
  const { referrals } = useWorkflow();
  const { loaded } = useWorkflowStatus();
  const total = referrals.length;

  const stages = REFERRAL_FLOW.map((s, i) => ({
    key: s,
    label: REFERRAL_STAGE_LABEL[s],
    reached: referrals.filter((r) => REFERRAL_FLOW.indexOf(r.status) >= i).length,
    // stuck *before* this stage = stalled with the previous stage confirmed
    stuck: i === 0 ? 0 : referrals.filter((r) => r.stalled && REFERRAL_FLOW.indexOf(r.status) === i - 1).length,
  }));

  const reasons = Object.entries(
    referrals.filter((r) => r.stalled && r.barrier).reduce<Record<string, number>>((acc, r) => {
      acc[r.barrier as string] = (acc[r.barrier as string] ?? 0) + 1;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);

  return (
    <GlassCard>
      <div className="flex items-center gap-2">
        <Icon name="LineChart" className="h-5 w-5 text-brand-600" />
        <h2 className="text-sm font-bold text-ink-900">Where care journeys stand</h2>
      </div>
      <p className="mt-1 max-w-prose text-sm text-ink-500">A referral created is not care completed. This shows how far each referral got, and where journeys broke.</p>

      {!loaded && <div className="mt-3"><LoadingRows rows={1} /></div>}

      {loaded && (
        <>
          <ol className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-5">
            {stages.map((s, i) => (
              <li key={s.key} className="rounded-2xl border border-white/60 bg-white/60 px-3 py-2.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Step {i + 1}</p>
                <p className="text-sm font-semibold leading-snug text-ink-900">{s.label}</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-ink-900">
                  {s.reached}
                  <span className="ml-1 text-sm font-medium text-ink-500">of {total}</span>
                </p>
                {s.stuck > 0 && (
                  <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-rose-700">
                    <Icon name="AlertTriangle" className="h-3.5 w-3.5" /> {s.stuck} stuck before this
                  </p>
                )}
              </li>
            ))}
          </ol>

          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Why journeys are stuck now</p>
            {reasons.length === 0 ? (
              <p className="mt-1.5 text-sm text-ink-600">No referral is stalled right now.</p>
            ) : (
              <div className="mt-1.5 flex flex-wrap gap-2">
                {reasons.map(([k, n]) => (
                  <span key={k} className="pill border border-rose-200 bg-rose-50 text-sm text-rose-800">
                    {BARRIER_LABEL[k as BarrierKey]} <span className="tabular-nums font-bold">{n}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </GlassCard>
  );
}
