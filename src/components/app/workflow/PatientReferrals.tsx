"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { GlassCard, Tag } from "@/components/ui/primitives";
import { EmptyState, LoadingRows } from "@/components/ui/EmptyState";
import { ReferralStages } from "./ReferralStages";
import { useWorkflow, useWorkflowStatus, REFERRAL_FLOW, REFERRAL_STAGE_LABEL, BARRIER_LABEL } from "@/lib/store/workflow";

function when(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

// One patient's referrals in the closed loop, plus the access barriers on record.
// "patient" audience: plain language. "team" audience: stage detail and barriers.
export function PatientReferrals({ patientId, audience }: { patientId: string; audience: "patient" | "team" }) {
  const { referrals, barriers } = useWorkflow();
  const { loaded } = useWorkflowStatus();
  const mine = referrals.filter((r) => r.patientId === patientId).sort((a, b) => Number(b.stalled) - Number(a.stalled));
  const recorded = barriers.filter((b) => b.patientId === patientId);
  const team = audience === "team";

  return (
    <GlassCard>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-ink-900">{team ? "Referrals & access barriers" : "My referrals"}</h2>
        {team && <Link href="/app/referrals" className="text-sm font-semibold text-brand-700 hover:underline">Manage referrals</Link>}
      </div>

      <div className="mt-3 space-y-2.5">
        {!loaded && <LoadingRows rows={1} />}
        {loaded && mine.length === 0 && (
          <EmptyState
            icon="Route"
            title={team ? "No referrals for this patient" : "No referrals yet"}
            hint={team ? "Refer the patient from the Referrals page. Every stage is then tracked here." : "If you need a specialist or another service, your care team will refer you and you'll see every step here."}
            action={team ? { label: "Create a referral", href: "/app/referrals" } : { label: "Find services", href: "/app/directory" }}
          />
        )}
        {mine.map((r) => {
          const idx = REFERRAL_FLOW.indexOf(r.status);
          const nextStage = REFERRAL_FLOW[idx + 1];
          const done = r.status === "followup";
          return (
            <div key={r.id} className={`rounded-2xl border px-4 py-3 ${r.stalled ? "border-rose-200 bg-rose-50/60" : "border-white/60 bg-white/60"}`}>
              <div className="flex flex-wrap items-start gap-x-3 gap-y-1">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink-900">{r.reason}</p>
                  <p className="text-xs text-ink-500">To {r.to} · referred {when(r.createdAt)}</p>
                </div>
                {r.stalled ? <Tag tone="rose">{team ? "Stalled" : "Needs help"}</Tag> : <Tag tone={done ? "green" : "brand"}>{done ? "Completed" : REFERRAL_STAGE_LABEL[r.status]}</Tag>}
              </div>
              <ReferralStages status={r.status} stalled={r.stalled} />

              {r.stalled && r.barrier && (
                <p className="mt-2.5 text-sm text-ink-800">
                  {team ? (
                    <>
                      <span className="font-semibold text-rose-800">Stuck before {REFERRAL_STAGE_LABEL[nextStage].toLowerCase()}.</span> Barrier: <span className="font-semibold">{BARRIER_LABEL[r.barrier]}</span>
                      {r.barrierNote && <span className="text-ink-600">. “{r.barrierNote}”</span>}
                    </>
                  ) : (
                    <>Your care team knows <span className="font-semibold">{BARRIER_LABEL[r.barrier].toLowerCase()}</span> is making this hard and is arranging help. A health worker will contact you.</>
                  )}
                </p>
              )}
              {!r.stalled && r.barrierResponse && r.barrier && (
                <p className="mt-2.5 flex items-start gap-1.5 text-sm text-emerald-800">
                  <Icon name="CheckCircle2" className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{team ? `${BARRIER_LABEL[r.barrier]} barrier addressed: ` : "Support arranged: "}{r.barrierResponse}</span>
                </p>
              )}
            </div>
          );
        })}
      </div>

      {team && loaded && recorded.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Access barriers on record</p>
          <ul className="mt-1.5 space-y-1.5">
            {recorded.map((b) => (
              <li key={b.id} className="flex flex-wrap items-baseline gap-x-2 text-sm text-ink-700">
                <span className="font-semibold text-ink-900">{BARRIER_LABEL[b.barrier]}</span>
                <span className="text-xs text-ink-500">{b.source === "navigator" ? "reported when navigating" : "stopped a referral"} · {when(b.createdAt)}</span>
                {b.note && <span className="w-full text-ink-600">“{b.note}”</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </GlassCard>
  );
}
