"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { GlassCard, Tag } from "@/components/ui/primitives";
import { useWorkflow, workflow, REFERRAL_FLOW, type ReferralStatus } from "@/lib/store/workflow";
import { PATIENTS } from "@/lib/data/connected";

const LABEL: Record<ReferralStatus, string> = {
  created: "Created", patient_notified: "Patient notified", facility_identified: "Facility identified",
  appointment: "Appointment", completed: "Completed", followup: "Follow-up",
};
const FACILITIES = ["Harare Central Hospital", "Parirenyatwa Group", "Chitungwiza Central", "Cimas Radiology"];

export function ReferralTracker({ canCreate = false, from = "SL-DR-000245" }: { canCreate?: boolean; from?: string }) {
  const { referrals } = useWorkflow();
  const [patientId, setPatientId] = useState(PATIENTS[0].patientId);
  const [to, setTo] = useState(FACILITIES[0]);
  const [reason, setReason] = useState("");

  return (
    <GlassCard>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-ink-900">Referral tracking</h2>
        <Icon name="Route" className="h-5 w-5 text-brand-600" />
      </div>

      {canCreate && (
        <div className="mt-3 grid gap-2 rounded-2xl border border-white/60 bg-white/50 p-3 sm:grid-cols-2">
          <select value={patientId} onChange={(e) => setPatientId(e.target.value)} className={inputCls}>
            {PATIENTS.map((p) => <option key={p.patientId} value={p.patientId}>{p.name} · {p.patientId}</option>)}
          </select>
          <select value={to} onChange={(e) => setTo(e.target.value)} className={inputCls}>
            {FACILITIES.map((f) => <option key={f}>{f}</option>)}
          </select>
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for referral" className={`${inputCls} sm:col-span-2`} />
          <button
            disabled={!reason.trim()}
            onClick={() => {
              const p = PATIENTS.find((x) => x.patientId === patientId)!;
              workflow.createReferral({ patientId, patientName: p.name, from, to, reason: reason.trim() });
              setReason("");
            }}
            className="btn-primary sm:col-span-2 disabled:opacity-50"
          >
            <Icon name="Send" className="h-4 w-4" /> Create referral
          </button>
        </div>
      )}

      <div className="mt-3 space-y-2.5">
        {referrals.length === 0 && <p className="text-sm text-ink-500">No referrals yet.</p>}
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
                  <button onClick={() => workflow.advanceReferral(r.id)} className="btn-primary px-3 py-1.5 text-xs">
                    Advance
                  </button>
                )}
              </div>
              <div className="mt-2.5 flex gap-1">
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
  "w-full rounded-xl border border-white/70 bg-white/80 px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-200";
