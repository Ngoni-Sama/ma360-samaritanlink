"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { GlassCard } from "@/components/ui/primitives";
import { workflow } from "@/lib/store/workflow";

const PHARMACIES = ["Unity Pharmacy", "Greenwood Chemist", "St. Anne's Dispensary"];
const LABS = ["MA360 Partner Laboratory", "Harare Central Lab"];

type Tab = "rx" | "lab" | "review";

export function DoctorActions({
  patientId,
  patientName,
  providerId,
}: {
  patientId: string;
  patientName: string;
  providerId: string;
}) {
  const [tab, setTab] = useState<Tab>("rx");
  const [rxItems, setRxItems] = useState("");
  const [rxPharmacy, setRxPharmacy] = useState(PHARMACIES[0]);
  const [labTests, setLabTests] = useState("");
  const [lab, setLab] = useState(LABS[0]);
  const [purpose, setPurpose] = useState("30-day review");
  const [when, setWhen] = useState("");
  const [toast, setToast] = useState("");

  function flash(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  return (
    <GlassCard>
      <div className="flex items-center gap-2">
        <Icon name="Stethoscope" className="h-5 w-5 text-brand-600" />
        <h2 className="text-sm font-bold text-ink-900">Clinical actions</h2>
        <span className="pill ml-auto border border-ink-200 bg-white/70 text-ink-500">Prototype</span>
      </div>

      <div className="mt-3 flex gap-1 rounded-full bg-ink-50 p-1">
        {([["rx", "Prescribe"], ["lab", "Request lab"], ["review", "Schedule review"]] as [Tab, string][]).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition ${tab === k ? "bg-brand-600 text-white shadow-glass" : "text-ink-600 hover:text-ink-900"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {tab === "rx" && (
          <>
            <input value={rxItems} onChange={(e) => setRxItems(e.target.value)} placeholder="e.g. Amlodipine 5 mg × 30" className={inputCls} />
            <select value={rxPharmacy} onChange={(e) => setRxPharmacy(e.target.value)} className={inputCls}>
              {PHARMACIES.map((p) => <option key={p}>{p}</option>)}
            </select>
            <button
              disabled={!rxItems.trim()}
              onClick={() => { workflow.issuePrescription({ patientId, patientName, items: rxItems.trim(), pharmacy: rxPharmacy, issuedBy: providerId }); setRxItems(""); flash(`Prescription sent to ${rxPharmacy}.`); }}
              className="btn-primary w-full disabled:opacity-50"
            >
              <Icon name="Send" className="h-4 w-4" /> Send prescription to pharmacy
            </button>
          </>
        )}
        {tab === "lab" && (
          <>
            <input value={labTests} onChange={(e) => setLabTests(e.target.value)} placeholder="e.g. Fasting glucose, U&E" className={inputCls} />
            <select value={lab} onChange={(e) => setLab(e.target.value)} className={inputCls}>
              {LABS.map((l) => <option key={l}>{l}</option>)}
            </select>
            <button
              disabled={!labTests.trim()}
              onClick={() => { workflow.requestLab({ patientId, patientName, tests: labTests.trim(), lab, requestedBy: providerId }); setLabTests(""); flash(`Test request sent to ${lab}.`); }}
              className="btn-primary w-full disabled:opacity-50"
            >
              <Icon name="Send" className="h-4 w-4" /> Send request to laboratory
            </button>
          </>
        )}
        {tab === "review" && (
          <>
            <input value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Purpose, e.g. 30-day review" className={inputCls} />
            <input value={when} onChange={(e) => setWhen(e.target.value)} placeholder="When, e.g. 2026-09-20 10:30" className={inputCls} />
            <button
              disabled={!purpose.trim() || !when.trim()}
              onClick={() => { workflow.scheduleAppointment({ patientId, patientName, purpose: purpose.trim(), when: when.trim() }); flash("Review scheduled; patient reminder created."); }}
              className="btn-primary w-full disabled:opacity-50"
            >
              <Icon name="CalendarClock" className="h-4 w-4" /> Schedule review &amp; remind patient
            </button>
          </>
        )}
        {toast && (
          <p className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
            <Icon name="CheckCircle2" className="h-4 w-4" /> {toast}
          </p>
        )}
      </div>
    </GlassCard>
  );
}

const inputCls =
  "w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-2.5 text-sm text-ink-900 outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-200";
