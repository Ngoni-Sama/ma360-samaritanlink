"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { GlassCard, Tag } from "@/components/ui/primitives";
import { EmptyState, LoadingRows } from "@/components/ui/EmptyState";
import { useWorkflow, useWorkflowStatus, workflow, LAB_FLOW, type LabStatus } from "@/lib/store/workflow";

const LABEL: Record<LabStatus, string> = {
  requested: "Requested", sample_collected: "Sample collected", processing: "Processing",
  results_ready: "Results ready", sent_to_doctor: "Sent to doctor",
};
const TONE: Record<LabStatus, "neutral" | "brand" | "amber" | "green"> = {
  requested: "neutral", sample_collected: "brand", processing: "amber", results_ready: "green", sent_to_doctor: "green",
};
const NEXT_LABEL: Record<LabStatus, string> = {
  requested: "Collect sample", sample_collected: "Start processing", processing: "Results ready", results_ready: "Send to doctor", sent_to_doctor: "",
};

export function LabQueue() {
  const { labs } = useWorkflow();
  const { loaded, pending } = useWorkflowStatus();
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  return (
    <GlassCard>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-ink-900">Incoming test requests</h2>
        <Icon name="FlaskConical" className="h-5 w-5 text-brand-600" />
      </div>
      <div className="mt-3 space-y-2.5">
        {!loaded && <LoadingRows />}
        {loaded && labs.length === 0 && (
          <EmptyState
            icon="FlaskConical"
            title="No test requests waiting"
            hint="Requests from clinicians appear here. You collect the sample, enter the result and send it back to the doctor."
            action={{ label: "Search patients", href: "/app/patients" }}
          />
        )}
        {labs.map((l) => {
          const done = l.status === "sent_to_doctor";
          const idx = LAB_FLOW.indexOf(l.status);
          const askResult = l.status === "processing"; // enter a result before "Results ready"
          const inputId = `result-${l.id}`;
          return (
            <div key={l.id} className="rounded-2xl border border-white/60 bg-white/60 px-4 py-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600/10 text-brand-700">
                  <Icon name="FlaskConical" className="h-4.5 w-4.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink-900">{l.tests}</p>
                  <Link href={`/app/patients/${l.patientId}`} className="text-xs text-ink-500 hover:text-brand-700">
                    {l.patientName} · {l.patientId} · requested by {l.requestedBy}
                  </Link>
                </div>
                <Tag tone={TONE[l.status]}>{LABEL[l.status]}</Tag>
                {!done && (
                  <button
                    onClick={() => workflow.advanceLab(l.id, askResult ? drafts[l.id] : undefined)}
                    disabled={pending > 0}
                    className="btn-primary px-3 py-1.5 text-xs disabled:opacity-60"
                  >
                    {NEXT_LABEL[l.status]}
                  </button>
                )}
              </div>
              {askResult && (
                <div className="mt-2.5">
                  <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-ink-700">Result summary</label>
                  <input
                    id={inputId}
                    value={drafts[l.id] ?? ""}
                    onChange={(e) => setDrafts((d) => ({ ...d, [l.id]: e.target.value }))}
                    placeholder="e.g. Total cholesterol 5.4 mmol/L"
                    className="w-full rounded-xl border border-white/70 bg-white/80 px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-200"
                  />
                </div>
              )}
              {l.result && <p className="mt-2 text-sm font-medium text-brand-700">Result: {l.result}</p>}
              <div className="mt-2.5 flex gap-1" aria-hidden>
                {LAB_FLOW.map((s, i) => (
                  <span key={s} className={`h-1.5 flex-1 rounded-full ${i <= idx ? "bg-brand-500" : "bg-ink-100"}`} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-sm text-ink-500">Sending results notifies the requesting doctor and tells the patient their results are with their doctor.</p>
    </GlassCard>
  );
}
