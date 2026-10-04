"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { GlassCard } from "@/components/ui/primitives";
import { EmptyState, LoadingRows } from "@/components/ui/EmptyState";
import { useWorkflow, useWorkflowStatus, REFERRAL_FLOW, REFERRAL_STAGE_LABEL, BARRIER_LABEL } from "@/lib/store/workflow";

const DAY = 864e5;
function ago(ts?: number) {
  if (!ts) return "";
  const d = Math.floor((Date.now() - ts) / DAY);
  return d <= 0 ? "today" : d === 1 ? "1 day ago" : `${d} days ago`;
}

// Care journeys that broke (stalled referrals) or are at risk (barriers a patient
// reported while navigating), oldest first, so the care team can respond.
export function DropOffTasks() {
  const { referrals, barriers } = useWorkflow();
  const { loaded } = useWorkflowStatus();

  const stalled = referrals.filter((r) => r.stalled).sort((a, b) => (a.stalledAt ?? 0) - (b.stalledAt ?? 0));
  const stalledPatients = new Set(stalled.map((r) => r.patientId));
  const atRisk = barriers
    .filter((b) => b.source === "navigator" && Date.now() - b.createdAt < 30 * DAY && !stalledPatients.has(b.patientId));
  const total = stalled.length + atRisk.length;

  return (
    <GlassCard>
      <div className="flex items-center gap-2">
        <Icon name="AlertTriangle" className="h-5 w-5 text-rose-600" />
        <h2 className="text-sm font-bold text-ink-900">Care journeys needing follow-up</h2>
        {loaded && total > 0 && <span className="pill ml-auto border border-rose-200 bg-rose-50 tabular-nums text-rose-800">{total}</span>}
      </div>

      <div className="mt-3 space-y-2">
        {!loaded && <LoadingRows rows={2} />}
        {loaded && total === 0 && (
          <EmptyState
            icon="CheckCircle2"
            title="No broken care journeys"
            hint="When a referral stops progressing or a patient reports a barrier, it appears here so someone can respond."
            action={{ label: "Open referrals", href: "/app/referrals" }}
          />
        )}
        {stalled.map((r) => {
          const nextStage = REFERRAL_FLOW[REFERRAL_FLOW.indexOf(r.status) + 1];
          return (
            <Link key={r.id} href="/app/referrals" className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-rose-900 transition hover:bg-rose-100">
              <Icon name="Route" className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="min-w-0 flex-1 text-sm">
                <span className="font-semibold">{r.patientName}</span> is stuck before {REFERRAL_STAGE_LABEL[nextStage].toLowerCase()} ({r.to}).{" "}
                Barrier: <span className="font-semibold">{r.barrier ? BARRIER_LABEL[r.barrier] : "not recorded"}</span>
                <span className="block text-xs text-rose-800">Stalled {ago(r.stalledAt)} · record a response to resume</span>
              </span>
              <Icon name="ArrowRight" className="mt-0.5 h-4 w-4 shrink-0 opacity-70" />
            </Link>
          );
        })}
        {atRisk.map((b) => (
          <Link key={b.id} href={`/app/patients/${b.patientId}`} className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-amber-900 transition hover:bg-amber-100">
            <Icon name="Bell" className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="min-w-0 flex-1 text-sm">
              <span className="font-semibold">{b.patientName}</span> reported <span className="font-semibold">{BARRIER_LABEL[b.barrier].toLowerCase()}</span> as a barrier
              <span className="block text-xs text-amber-800">Reported {ago(b.createdAt)} · plan support before their next step</span>
            </span>
            <Icon name="ArrowRight" className="mt-0.5 h-4 w-4 shrink-0 opacity-70" />
          </Link>
        ))}
      </div>
    </GlassCard>
  );
}
