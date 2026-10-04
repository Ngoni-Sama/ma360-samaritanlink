"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { GlassCard, Tag } from "@/components/ui/primitives";
import { EmptyState, LoadingRows } from "@/components/ui/EmptyState";
import { useWorkflow, useWorkflowStatus, workflow, REFERRAL_FLOW, type ReferralStatus } from "@/lib/store/workflow";
import { PATIENTS } from "@/lib/data/connected";

const LABEL: Record<ReferralStatus, string> = {
  created: "Created", patient_notified: "Patient notified", facility_identified: "Facility identified",
  appointment: "Appointment", completed: "Completed", followup: "Follow-up",
};
const FACILITIES = ["Harare Central Hospital", "Parirenyatwa Group", "Chitungwiza Central", "Cimas Radiology"];

export function ReferralTracker({ canCreate = false, from = "SL-DR-000245" }: { canCreate?: boolean; from?: string }) {
  const { referrals } = useWorkflow();
  const { loaded, pending } = useWorkflowStatus();
  const [patientId, setPatientId] = useState(PATIENTS[0].patientId);
  const [to, setTo] = useState(FACILITIES[0]);
  const [reason, setReason] = useState("");
  const reasonRef = useRef<HTMLInputElement>(null);
  const busy = pending > 0;

  async function create() {
    const p = PATIENTS.find((x) => x.patientId === patientId)!;
    if (await workflow.createReferral({ patientId, patientName: p.name, from, to, reason: reason.trim() })) setReason("");
  }

  return (
    <GlassCard>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-ink-900">Referral tracking</h2>
        <Icon name="Route" className="h-5 w-5 text-brand-600" />
      </div>

      {canCreate && (
        <form
          onSubmit={(e) => { e.preventDefault(); create(); }}
          className="mt-3 grid gap-4 rounded-2xl border border-white/60 bg-white/50 p-3 sm:grid-cols-2"
        >
          <div>
            <label htmlFor="ref-patient" className="mb-1 block text-sm font-medium text-ink-700">Patient</label>
            <select id="ref-patient" value={patientId} onChange={(e) => setPatientId(e.target.value)} className={inputCls}>
              {PATIENTS.map((p) => <option key={p.patientId} value={p.patientId}>{p.name} · {p.patientId}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="ref-to" className="mb-1 block text-sm font-medium text-ink-700">Refer to</label>
            <select id="ref-to" value={to} onChange={(e) => setTo(e.target.value)} className={inputCls}>
              {FACILITIES.map((f) => <option key={f}>{f}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="ref-reason" className="mb-1 block text-sm font-medium text-ink-700">Reason for referral</label>
            <input id="ref-reason" ref={reasonRef} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Uncontrolled hypertension, specialist review" className={inputCls} />
          </div>
          <button type="submit" disabled={!reason.trim() || busy} className="btn-primary sm:col-span-2 disabled:opacity-50">
            <Icon name="Send" className="h-4 w-4" /> Create referral
          </button>
        </form>
      )}

      <div className="mt-3 space-y-2.5">
        {!loaded && <LoadingRows />}
        {loaded && referrals.length === 0 && (
          <EmptyState
            icon="Route"
            title="No referrals yet"
            hint={canCreate ? "Write a referral above. Each step is tracked until the patient's follow-up is done." : "Referrals created by your care team appear here."}
            action={canCreate ? { label: "Write a referral", onClick: () => reasonRef.current?.focus() } : { label: "Find services", href: "/app/directory" }}
          />
        )}
        {referrals.map((r) => {
          const idx = REFERRAL_FLOW.indexOf(r.status);
          const done = r.status === "followup";
          return (
            <div key={r.id} className="rounded-2xl border border-white/60 bg-white/60 px-4 py-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink-900">{r.reason}</p>
                  <Link href={`/app/patients/${r.patientId}`} className="text-xs text-ink-500 hover:text-brand-700">
                    {r.patientName} · {r.from} → {r.to}
                  </Link>
                </div>
                <Tag tone={done ? "green" : "brand"}>{LABEL[r.status]}</Tag>
                {!done && (
                  <button onClick={() => workflow.advanceReferral(r.id)} disabled={busy} className="btn-primary px-3 py-1.5 text-xs disabled:opacity-60">
                    Advance to {LABEL[REFERRAL_FLOW[idx + 1]].toLowerCase()}
                  </button>
                )}
              </div>
              <div className="mt-2.5 flex gap-1" aria-hidden>
                {REFERRAL_FLOW.map((s, i) => (
                  <span key={s} className={`h-1.5 flex-1 rounded-full ${i <= idx ? "bg-brand-500" : "bg-ink-100"}`} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

const inputCls =
  "w-full rounded-xl border border-white/70 bg-white/80 px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-200";
