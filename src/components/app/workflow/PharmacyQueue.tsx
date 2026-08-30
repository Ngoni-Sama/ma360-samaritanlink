"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { GlassCard, Tag } from "@/components/ui/primitives";
import { useWorkflow, workflow, RX_FLOW, type RxStatus } from "@/lib/store/workflow";

const LABEL: Record<RxStatus, string> = {
  issued: "Issued", received: "Received", preparing: "Being prepared", ready: "Ready for collection", collected: "Collected",
};
const TONE: Record<RxStatus, "neutral" | "brand" | "amber" | "green"> = {
  issued: "neutral", received: "brand", preparing: "amber", ready: "green", collected: "green",
};
const NEXT_LABEL: Record<RxStatus, string> = {
  issued: "Mark received", received: "Start preparing", preparing: "Mark ready", ready: "Mark collected", collected: "",
};

export function PharmacyQueue() {
  const { prescriptions } = useWorkflow();

  return (
    <GlassCard>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-ink-900">Incoming prescriptions</h2>
        <Icon name="Pill" className="h-5 w-5 text-brand-600" />
      </div>
      <div className="mt-3 space-y-2.5">
        {prescriptions.length === 0 && <p className="text-sm text-ink-500">No prescriptions in the queue.</p>}
        {prescriptions.map((rx) => {
          const done = rx.status === "collected";
          const idx = RX_FLOW.indexOf(rx.status);
          return (
            <div key={rx.id} className="rounded-2xl border border-white/60 bg-white/60 px-4 py-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600/10 text-brand-700">
                  <Icon name="Pill" className="h-4.5 w-4.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink-900">{rx.items}</p>
                  <Link href={`/app/patients/${rx.patientId}`} className="text-xs text-ink-500 hover:text-brand-700">
                    {rx.patientName} · {rx.patientId}
                  </Link>
                </div>
                <Tag tone={TONE[rx.status]}>{LABEL[rx.status]}</Tag>
                {!done && (
                  <button onClick={() => workflow.advanceRx(rx.id)} className="btn-primary px-3 py-1.5 text-xs">
                    {NEXT_LABEL[rx.status]}
                  </button>
                )}
              </div>
              {/* progress bar */}
              <div className="mt-2.5 flex gap-1">
                {RX_FLOW.map((s, i) => (
                  <span key={s} className={`h-1.5 flex-1 rounded-full ${i <= idx ? "bg-brand-500" : "bg-ink-100"}`} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-ink-400">Marking &ldquo;Ready&rdquo; notifies the patient by SMS/WhatsApp (demo).</p>
    </GlassCard>
  );
}
