"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { GlassCard, Tag } from "@/components/ui/primitives";
import { EmptyState, LoadingRows } from "@/components/ui/EmptyState";
import { ReferralStages } from "./ReferralStages";
import {
  useWorkflow, useWorkflowStatus, workflow,
  REFERRAL_FLOW, REFERRAL_STAGE_LABEL, BARRIERS, BARRIER_LABEL, type Referral, type BarrierKey,
} from "@/lib/store/workflow";
import { PATIENTS } from "@/lib/data/connected";

const FACILITIES = ["Harare Central Hospital", "Parirenyatwa Group", "Chitungwiza Central", "Cimas Radiology"];
type Filter = "all" | "stalled" | "active" | "done";

function daysSince(ts?: number) {
  if (!ts) return null;
  const d = Math.floor((Date.now() - ts) / 864e5);
  return d <= 0 ? "today" : d === 1 ? "1 day ago" : `${d} days ago`;
}

export function ReferralTracker({ canCreate = false, from = "SL-DR-000245" }: { canCreate?: boolean; from?: string }) {
  const { referrals } = useWorkflow();
  const { loaded, pending } = useWorkflowStatus();
  const [patientId, setPatientId] = useState(PATIENTS[0].patientId);
  const [to, setTo] = useState(FACILITIES[0]);
  const [reason, setReason] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const reasonRef = useRef<HTMLInputElement>(null);
  const busy = pending > 0;

  const counts = useMemo(() => ({
    all: referrals.length,
    stalled: referrals.filter((r) => r.stalled).length,
    active: referrals.filter((r) => !r.stalled && r.status !== "followup").length,
    done: referrals.filter((r) => r.status === "followup").length,
  }), [referrals]);

  // Stalled first: those are the journeys that need someone to act.
  const shown = useMemo(() => {
    const list = referrals.filter((r) =>
      filter === "all" ? true : filter === "stalled" ? r.stalled : filter === "active" ? !r.stalled && r.status !== "followup" : r.status === "followup");
    return [...list].sort((a, b) => Number(b.stalled) - Number(a.stalled));
  }, [referrals, filter]);

  async function create() {
    const p = PATIENTS.find((x) => x.patientId === patientId)!;
    if (await workflow.createReferral({ patientId, patientName: p.name, from, to, reason: reason.trim() })) setReason("");
  }

  return (
    <GlassCard>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-ink-900">Referrals</h2>
        <Icon name="Route" className="h-5 w-5 text-brand-600" />
      </div>
      <p className="mt-1 max-w-prose text-sm text-ink-500">
        Confirm each stage as it happens. If a patient stops progressing, record the barrier so the team can respond.
      </p>

      {canCreate && (
        <form onSubmit={(e) => { e.preventDefault(); create(); }} className="mt-3 grid gap-4 rounded-2xl border border-white/60 bg-white/50 p-3 sm:grid-cols-2">
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

      {loaded && referrals.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Show referrals">
          {([["all", "All"], ["stalled", "Needs attention"], ["active", "In progress"], ["done", "Completed"]] as [Filter, string][]).map(([k, label]) => (
            <button key={k} type="button" aria-pressed={filter === k} onClick={() => setFilter(k)}
              className={`pill min-h-10 border px-3.5 text-sm ${filter === k ? "border-brand-600 bg-brand-600 text-white" : k === "stalled" && counts.stalled > 0 ? "border-rose-200 bg-rose-50 text-rose-800" : "border-ink-200 bg-white/70 text-ink-700"}`}>
              {label} <span className="tabular-nums">({counts[k]})</span>
            </button>
          ))}
        </div>
      )}

      <div className="mt-3 space-y-2.5">
        {!loaded && <LoadingRows />}
        {loaded && referrals.length === 0 && (
          <EmptyState
            icon="Route"
            title="No referrals yet"
            hint={canCreate ? "Write a referral above. Each stage is tracked until the patient's follow-up is done." : "Referrals created by your care team appear here."}
            action={canCreate ? { label: "Write a referral", onClick: () => reasonRef.current?.focus() } : { label: "Find services", href: "/app/directory" }}
          />
        )}
        {loaded && referrals.length > 0 && shown.length === 0 && (
          <EmptyState icon="CheckCircle2" title="Nothing in this view" hint="No referrals match this filter right now." action={{ label: "Show all referrals", onClick: () => setFilter("all") }} />
        )}
        {shown.map((r) => <ReferralRow key={r.id} r={r} canEdit={canCreate} busy={busy} />)}
      </div>
    </GlassCard>
  );
}

function ReferralRow({ r, canEdit, busy }: { r: Referral; canEdit: boolean; busy: boolean }) {
  const [mode, setMode] = useState<"idle" | "stall">("idle");
  const [barrier, setBarrier] = useState<BarrierKey | null>(null);
  const [note, setNote] = useState("");
  const [response, setResponse] = useState(() => BARRIERS.find((b) => b.key === r.barrier)?.response ?? "");
  const idx = REFERRAL_FLOW.indexOf(r.status);
  const done = r.status === "followup";
  const nextStage = done ? null : REFERRAL_FLOW[idx + 1];

  async function saveStall() {
    if (barrier && (await workflow.stallReferral(r.id, barrier, note))) {
      setMode("idle"); setNote("");
      setResponse(BARRIERS.find((b) => b.key === barrier)?.response ?? "");
    }
  }

  return (
    <div className={`rounded-2xl border px-4 py-3 ${r.stalled ? "border-rose-200 bg-rose-50/60" : "border-white/60 bg-white/60"}`}>
      <div className="flex flex-wrap items-start gap-x-3 gap-y-1">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink-900">{r.reason}</p>
          <Link href={`/app/patients/${r.patientId}`} className="text-xs text-ink-500 hover:text-brand-700">
            {r.patientName} · {r.from} → {r.to}
          </Link>
        </div>
        {r.stalled ? (
          <Tag tone="rose"><Icon name="AlertTriangle" className="h-3.5 w-3.5" /> Stalled</Tag>
        ) : (
          <Tag tone={done ? "green" : "brand"}>{done ? "Completed" : REFERRAL_STAGE_LABEL[r.status]}</Tag>
        )}
      </div>

      <ReferralStages status={r.status} stalled={r.stalled} />

      {r.stalled && nextStage && (
        <div className="mt-3 rounded-xl border border-rose-200 bg-white/80 p-3">
          <p className="text-sm text-ink-800">
            <span className="font-semibold text-rose-800">Stuck before {REFERRAL_STAGE_LABEL[nextStage].toLowerCase()}.</span>{" "}
            Barrier: <span className="font-semibold">{r.barrier ? BARRIER_LABEL[r.barrier] : "Not recorded"}</span>
            {r.stalledAt && <span className="text-ink-500"> · reported {daysSince(r.stalledAt)}</span>}
          </p>
          {r.barrierNote && <p className="mt-1 text-sm text-ink-600">“{r.barrierNote}”</p>}
          {canEdit && (
            <form className="mt-3 space-y-2" onSubmit={async (e) => { e.preventDefault(); await workflow.resolveReferral(r.id, response); }}>
              <label htmlFor={`resp-${r.id}`} className="block text-sm font-medium text-ink-700">How was it addressed?</label>
              <input id={`resp-${r.id}`} value={response} onChange={(e) => setResponse(e.target.value)} className={inputCls} />
              <button type="submit" disabled={!response.trim() || busy} className="btn-primary px-4 text-sm disabled:opacity-60">
                <Icon name="CheckCircle2" className="h-4 w-4" /> Record response &amp; resume
              </button>
            </form>
          )}
        </div>
      )}

      {!r.stalled && r.barrierResponse && r.barrier && (
        <p className="mt-2.5 flex items-start gap-1.5 text-sm text-emerald-800">
          <Icon name="CheckCircle2" className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{BARRIER_LABEL[r.barrier]} barrier addressed: {r.barrierResponse}</span>
        </p>
      )}

      {canEdit && !r.stalled && nextStage && mode === "idle" && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => workflow.advanceReferral(r.id)} disabled={busy} className="btn-primary px-4 text-sm disabled:opacity-60">
            <Icon name="CheckCircle2" className="h-4 w-4" /> Confirm: {REFERRAL_STAGE_LABEL[nextStage].toLowerCase()}
          </button>
          <button type="button" onClick={() => setMode("stall")} className="btn-ghost px-4 text-sm text-rose-700">
            <Icon name="AlertTriangle" className="h-4 w-4" /> Not progressing
          </button>
        </div>
      )}

      {canEdit && mode === "stall" && nextStage && (
        <form className="mt-3 rounded-xl border border-rose-200 bg-white/80 p-3" onSubmit={(e) => { e.preventDefault(); saveStall(); }}>
          <fieldset>
            <legend className="text-sm font-semibold text-ink-900">
              What is stopping {r.patientName.split(" ")[0]} from reaching “{REFERRAL_STAGE_LABEL[nextStage].toLowerCase()}”?
            </legend>
            <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Barrier">
              {BARRIERS.map((b) => (
                <button key={b.key} type="button" role="radio" aria-checked={barrier === b.key} onClick={() => setBarrier(b.key)}
                  className={`pill min-h-10 border px-3 text-sm ${barrier === b.key ? "border-rose-600 bg-rose-600 text-white" : "border-ink-200 bg-white text-ink-700 hover:bg-rose-50"}`}>
                  <Icon name={b.icon} className="h-3.5 w-3.5" /> {b.label}
                </button>
              ))}
            </div>
          </fieldset>
          <label htmlFor={`note-${r.id}`} className="mb-1 mt-3 block text-sm font-medium text-ink-700">
            What happened? {barrier !== "other" && <span className="font-normal text-ink-500">(optional)</span>}
          </label>
          <input id={`note-${r.id}`} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Cannot afford the bus fare to Harare" className={inputCls} />
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="submit" disabled={!barrier || (barrier === "other" && !note.trim()) || busy} className="btn-primary px-4 text-sm disabled:opacity-50">Save barrier</button>
            <button type="button" onClick={() => { setMode("idle"); setBarrier(null); setNote(""); }} className="btn-ghost px-4 text-sm">Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-white/70 bg-white/80 px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-200";
