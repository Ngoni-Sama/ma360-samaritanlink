"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { GlassCard, Tag } from "@/components/ui/primitives";
import { EmptyState, LoadingRows } from "@/components/ui/EmptyState";
import { useWorkflow, useWorkflowStatus, workflow, type ApptStatus } from "@/lib/store/workflow";

const TONE: Record<ApptStatus, "neutral" | "brand" | "green" | "amber" | "rose"> = {
  scheduled: "brand", confirmed: "brand", completed: "green", missed: "rose", rescheduled: "amber",
};

export function AppointmentsPanel() {
  const { appointments } = useWorkflow();
  const { loaded, pending } = useWorkflowStatus();

  return (
    <GlassCard>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-ink-900">Appointments &amp; follow-up</h2>
        <Icon name="CalendarClock" className="h-5 w-5 text-brand-600" />
      </div>
      <div className="mt-3 space-y-2.5">
        {!loaded && <LoadingRows />}
        {loaded && appointments.length === 0 && (
          <EmptyState
            icon="CalendarClock"
            title="No appointments scheduled"
            hint="Open a patient to schedule a review. The patient gets an SMS reminder automatically."
            action={{ label: "Find a patient", href: "/app/patients" }}
          />
        )}
        {appointments.map((a) => (
          <div key={a.id} className="rounded-2xl border border-white/60 bg-white/60 px-4 py-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink-900">{a.purpose}</p>
                <Link href={`/app/patients/${a.patientId}`} className="text-xs text-ink-500 hover:text-brand-700">
                  {a.patientName} · {a.when}
                </Link>
              </div>
              <Tag tone={TONE[a.status]}>{a.status}</Tag>
            </div>
            {(a.status === "scheduled" || a.status === "confirmed") && (
              <div className="mt-2.5 flex flex-wrap gap-2">
                <button onClick={() => workflow.setApptStatus(a.id, "completed")} disabled={pending > 0} className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-60">Mark completed</button>
                <button onClick={() => workflow.setApptStatus(a.id, "missed")} disabled={pending > 0} className="btn-ghost px-3 py-1.5 text-xs text-rose-700 disabled:opacity-60">Mark missed</button>
              </div>
            )}
            {a.status === "missed" && (
              <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-rose-700">
                <Icon name="AlertTriangle" className="h-4 w-4" /> Follow-up task created, so care continues.
              </p>
            )}
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
