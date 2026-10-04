"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { GlassCard } from "@/components/ui/primitives";
import { workflow, useWorkflowStatus } from "@/lib/store/workflow";

const PHARMACIES = ["Unity Pharmacy", "Greenwood Chemist", "St. Anne's Dispensary"];
const LABS = ["MA360 Partner Laboratory", "Harare Central Lab"];

type Tab = "rx" | "lab" | "review";
const TABS: [Tab, string][] = [["rx", "Prescribe"], ["lab", "Request lab"], ["review", "Schedule review"]];

export function DoctorActions({
  patientId,
  patientName,
  providerId,
}: {
  patientId: string;
  patientName: string;
  providerId: string;
}) {
  const { pending } = useWorkflowStatus();
  const [tab, setTab] = useState<Tab>("rx");
  const [rxItems, setRxItems] = useState("");
  const [rxPharmacy, setRxPharmacy] = useState(PHARMACIES[0]);
  const [labTests, setLabTests] = useState("");
  const [lab, setLab] = useState(LABS[0]);
  const [purpose, setPurpose] = useState("30-day review");
  const [when, setWhen] = useState("");
  const [toast, setToast] = useState("");
  const busy = pending > 0;

  function flash(msg: string) { setToast(msg); setTimeout(() => setToast(""), 4000); }

  // Only confirm once the save succeeded; on failure the inputs keep their values
  // and the app-wide message explains what went wrong.
  async function sendRx() {
    if (await workflow.issuePrescription({ patientId, patientName, items: rxItems.trim(), pharmacy: rxPharmacy, issuedBy: providerId })) {
      setRxItems(""); flash(`Prescription sent to ${rxPharmacy}.`);
    }
  }
  async function sendLab() {
    if (await workflow.requestLab({ patientId, patientName, tests: labTests.trim(), lab, requestedBy: providerId })) {
      setLabTests(""); flash(`Test request sent to ${lab}.`);
    }
  }
  async function sendReview() {
    if (await workflow.scheduleAppointment({ patientId, patientName, purpose: purpose.trim(), when: when.replace("T", " ") })) {
      flash("Review scheduled. The patient gets an SMS reminder.");
    }
  }

  return (
    <GlassCard>
      <div className="flex items-center gap-2">
        <Icon name="Stethoscope" className="h-5 w-5 text-brand-600" />
        <h2 className="text-sm font-bold text-ink-900">Clinical actions</h2>
        <span className="pill ml-auto border border-ink-200 bg-white/70 text-ink-500">Prototype</span>
      </div>

      <div className="mt-3 flex gap-1 rounded-full bg-ink-50 p-1" role="tablist" aria-label="Clinical action">
        {TABS.map(([k, label]) => (
          <button
            key={k}
            id={`tab-${k}`}
            role="tab"
            aria-selected={tab === k}
            aria-controls="clinical-panel"
            onClick={() => setTab(k)}
            className={`min-h-10 flex-1 rounded-full px-2 text-sm font-semibold transition ${tab === k ? "bg-brand-600 text-white shadow-glass" : "text-ink-600 hover:text-ink-900"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <form
        id="clinical-panel"
        role="tabpanel"
        aria-labelledby={`tab-${tab}`}
        className="mt-4 space-y-4"
        onSubmit={(e) => { e.preventDefault(); if (tab === "rx") sendRx(); else if (tab === "lab") sendLab(); else sendReview(); }}
      >
        {tab === "rx" && (
          <>
            <Field id="rx-items" label="Medicine, strength and quantity">
              <input id="rx-items" value={rxItems} onChange={(e) => setRxItems(e.target.value)} placeholder="e.g. Amlodipine 5 mg x 30" className={inputCls} />
            </Field>
            <Field id="rx-pharmacy" label="Send to pharmacy">
              <select id="rx-pharmacy" value={rxPharmacy} onChange={(e) => setRxPharmacy(e.target.value)} className={inputCls}>
                {PHARMACIES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </Field>
            <button type="submit" disabled={!rxItems.trim() || busy} className="btn-primary w-full disabled:opacity-50">
              <Icon name="Send" className="h-4 w-4" /> Send prescription to pharmacy
            </button>
          </>
        )}
        {tab === "lab" && (
          <>
            <Field id="lab-tests" label="Tests requested">
              <input id="lab-tests" value={labTests} onChange={(e) => setLabTests(e.target.value)} placeholder="e.g. Fasting glucose, U&E" className={inputCls} />
            </Field>
            <Field id="lab-name" label="Laboratory">
              <select id="lab-name" value={lab} onChange={(e) => setLab(e.target.value)} className={inputCls}>
                {LABS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </Field>
            <button type="submit" disabled={!labTests.trim() || busy} className="btn-primary w-full disabled:opacity-50">
              <Icon name="Send" className="h-4 w-4" /> Send request to laboratory
            </button>
          </>
        )}
        {tab === "review" && (
          <>
            <Field id="review-purpose" label="Purpose">
              <input id="review-purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g. 30-day review" className={inputCls} />
            </Field>
            <Field id="review-when" label="Date and time">
              <input id="review-when" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className={`${inputCls} sm:max-w-xs`} />
            </Field>
            <button type="submit" disabled={!purpose.trim() || !when || busy} className="btn-primary w-full disabled:opacity-50">
              <Icon name="CalendarClock" className="h-4 w-4" /> Schedule review &amp; remind patient
            </button>
          </>
        )}
        {toast && (
          <p role="status" className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
            <Icon name="CheckCircle2" className="h-4 w-4" /> {toast}
          </p>
        )}
      </form>
    </GlassCard>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-ink-700">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-2.5 text-sm text-ink-900 outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-200";
