"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { GlassCard, Tag } from "@/components/ui/primitives";
import { EmptyState, LoadingRows } from "@/components/ui/EmptyState";
import { useWorkflow, useWorkflowStatus, workflow } from "@/lib/store/workflow";

export function HomeVisits() {
  const { homeVisits } = useWorkflow();
  const { loaded, pending } = useWorkflowStatus();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [open, setOpen] = useState<string | null>(null);
  const busy = pending > 0;

  async function complete(id: string, escalate: boolean) {
    const outcome = drafts[id] || (escalate ? "Escalation required" : "Visit completed");
    if (await workflow.completeHomeVisit(id, outcome, escalate)) setOpen(null);
  }

  return (
    <GlassCard>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-ink-900">Home visits &amp; follow-up</h2>
        <Icon name="Home" className="h-5 w-5 text-brand-600" />
      </div>
      <div className="mt-3 space-y-2.5">
        {!loaded && <LoadingRows />}
        {loaded && homeVisits.length === 0 && (
          <EmptyState
            icon="Home"
            title="No home visits scheduled"
            hint="Visits for follow-up, priority patients and referral escorts appear here."
            action={{ label: "Search patients", href: "/app/patients" }}
          />
        )}
        {homeVisits.map((h) => {
          const inputId = `visit-${h.id}`;
          return (
            <div key={h.id} className="rounded-2xl border border-white/60 bg-white/60 px-4 py-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink-900">{h.purpose}</p>
                  <Link href={`/app/patients/${h.patientId}`} className="text-xs text-ink-500 hover:text-brand-700">
                    {h.patientName} · {h.when}
                  </Link>
                </div>
                <Tag tone={h.status === "completed" ? "green" : h.status === "escalated" ? "rose" : "brand"}>{h.status}</Tag>
                {h.status === "scheduled" && (
                  <button onClick={() => setOpen(open === h.id ? null : h.id)} aria-expanded={open === h.id} className="btn-secondary px-3 py-1.5 text-xs">
                    Record outcome
                  </button>
                )}
              </div>
              {h.outcome && <p className="mt-1.5 text-sm text-ink-500">Outcome: {h.outcome}</p>}
              {open === h.id && h.status === "scheduled" && (
                <div className="mt-2.5 space-y-3">
                  <div>
                    <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-ink-700">Observations</label>
                    <input
                      id={inputId}
                      value={drafts[h.id] ?? ""}
                      onChange={(e) => setDrafts((d) => ({ ...d, [h.id]: e.target.value }))}
                      placeholder="e.g. BP 150/95, taking medication as prescribed"
                      className="w-full rounded-xl border border-white/70 bg-white/80 px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-200"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => complete(h.id, false)} disabled={busy} className="btn-primary px-3 py-1.5 text-xs disabled:opacity-60">
                      Mark completed
                    </button>
                    <button onClick={() => complete(h.id, true)} disabled={busy} className="btn-ghost px-3 py-1.5 text-xs text-rose-700 disabled:opacity-60">
                      Escalate to clinician
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
