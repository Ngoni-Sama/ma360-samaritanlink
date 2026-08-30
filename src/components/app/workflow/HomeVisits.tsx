"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { GlassCard, Tag } from "@/components/ui/primitives";
import { useWorkflow, workflow } from "@/lib/store/workflow";

export function HomeVisits() {
  const { homeVisits } = useWorkflow();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [open, setOpen] = useState<string | null>(null);

  return (
    <GlassCard>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-ink-900">Home visits &amp; follow-up</h2>
        <Icon name="Home" className="h-5 w-5 text-brand-600" />
      </div>
      <div className="mt-3 space-y-2.5">
        {homeVisits.map((h) => (
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
                <button onClick={() => setOpen(open === h.id ? null : h.id)} className="btn-secondary px-3 py-1.5 text-xs">
                  Record outcome
                </button>
              )}
            </div>
            {h.outcome && <p className="mt-1.5 text-xs text-ink-500">Outcome: {h.outcome}</p>}
            {open === h.id && h.status === "scheduled" && (
              <div className="mt-2.5 space-y-2">
                <input
                  value={drafts[h.id] ?? ""}
                  onChange={(e) => setDrafts((d) => ({ ...d, [h.id]: e.target.value }))}
                  placeholder="Observations, e.g. BP 150/95, medication adherence good"
                  className="w-full rounded-xl border border-white/70 bg-white/80 px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-200"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => { workflow.completeHomeVisit(h.id, drafts[h.id] || "Visit completed", false); setOpen(null); }}
                    className="btn-primary px-3 py-1.5 text-xs"
                  >
                    Mark completed
                  </button>
                  <button
                    onClick={() => { workflow.completeHomeVisit(h.id, drafts[h.id] || "Escalation required", true); setOpen(null); }}
                    className="btn-ghost px-3 py-1.5 text-xs text-rose-600"
                  >
                    Escalate to clinician
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
