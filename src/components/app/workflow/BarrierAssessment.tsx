"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { GlassCard } from "@/components/ui/primitives";
import { useWorkflow, useWorkflowStatus, workflow, BARRIERS, BARRIER_LABEL, type BarrierKey } from "@/lib/store/workflow";

// Patient Access Barrier Assessment, built into Health Navigation: not only
// "where does this patient need to go?" but "what might stop them getting there or
// completing care?". Saved barriers go on the patient's record, alert the care team,
// and feed the drop-off analysis.
export function BarrierAssessment() {
  const { barriers, viewer } = useWorkflow();
  const { pending } = useWorkflowStatus();
  const [sel, setSel] = useState<Partial<Record<BarrierKey, boolean>>>({});
  const [otherNote, setOtherNote] = useState("");
  const [saved, setSaved] = useState(false);

  const isPatient = viewer?.role === "patient" && !!viewer.patientId;
  const chosen = BARRIERS.filter((b) => sel[b.key]);
  const onRecord = isPatient ? barriers.filter((b) => b.patientId === viewer!.patientId) : [];
  const canSave = isPatient && chosen.length > 0 && (!sel.other || otherNote.trim().length > 0) && pending === 0;

  async function save() {
    const ok = await workflow.recordBarriers(chosen.map((b) => ({ barrier: b.key, note: b.key === "other" ? otherNote.trim() : undefined })));
    if (ok) { setSel({}); setOtherNote(""); setSaved(true); setTimeout(() => setSaved(false), 5000); }
  }

  return (
    <GlassCard>
      <div className="flex items-center gap-2">
        <Icon name="ClipboardCheck" className="h-5 w-5 text-brand-600" />
        <h2 className="text-sm font-bold text-ink-900">{isPatient ? "What might get in the way of your care?" : "Patient access barrier assessment"}</h2>
      </div>
      <p className="mt-1 max-w-prose text-sm text-ink-500">
        {isPatient
          ? "Tell us what could make it hard to get to care or keep going with it. Your care team will help you plan around it."
          : "Beyond where the patient needs to go: what might stop them getting there or completing care?"}
      </p>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {BARRIERS.map((b) => (
          <button
            key={b.key}
            type="button"
            aria-pressed={!!sel[b.key]}
            onClick={() => setSel((s) => ({ ...s, [b.key]: !s[b.key] }))}
            className={`flex min-h-12 items-start gap-2.5 rounded-2xl border px-3 py-2.5 text-left transition ${sel[b.key] ? "border-brand-500 bg-brand-50" : "border-white/60 bg-white/60 hover:bg-white"}`}
          >
            <Icon name={sel[b.key] ? "CheckCircle2" : b.icon} className={`mt-0.5 h-4.5 w-4.5 shrink-0 ${sel[b.key] ? "text-brand-600" : "text-ink-500"}`} />
            <span>
              <span className="block text-sm font-semibold text-ink-900">{b.label}</span>
              <span className="block text-sm text-ink-500">{b.question}</span>
            </span>
          </button>
        ))}
      </div>

      {sel.other && (
        <div className="mt-3">
          <label htmlFor="barrier-other" className="mb-1 block text-sm font-medium text-ink-700">Describe the other barrier</label>
          <input id="barrier-other" value={otherNote} onChange={(e) => setOtherNote(e.target.value)} placeholder="e.g. Clinic hours clash with school pickup"
            className="w-full rounded-xl border border-white/70 bg-white/80 px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-200" />
        </div>
      )}

      {chosen.length > 0 && (
        <div className="mt-4 rounded-2xl border border-brand-200 bg-brand-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">How the care team can respond</p>
          <ul className="mt-2 space-y-1.5">
            {chosen.map((b) => (
              <li key={b.key} className="flex gap-2 text-sm text-brand-900">
                <Icon name="ArrowRight" className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                <span><span className="font-medium">{b.label}:</span> {b.response}</span>
              </li>
            ))}
          </ul>
          {isPatient && (
            <button type="button" onClick={save} disabled={!canSave} className="btn-primary mt-4 disabled:opacity-50">
              <Icon name="Send" className="h-4 w-4" /> Share with my care team
            </button>
          )}
        </div>
      )}

      {saved && (
        <p role="status" className="mt-3 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800">
          <Icon name="CheckCircle2" className="h-4 w-4" /> Shared. A health worker will follow up with you.
        </p>
      )}

      {onRecord.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Already on your record</p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {onRecord.map((b) => (
              <span key={b.id} className="pill border border-ink-200 bg-white/70 text-sm text-ink-700">{BARRIER_LABEL[b.barrier]}</span>
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  );
}
