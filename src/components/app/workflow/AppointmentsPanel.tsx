"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { GlassCard, Tag } from "@/components/ui/primitives";
import { useWorkflow, workflow, type ApptStatus } from "@/lib/store/workflow";

const TONE: Record<ApptStatus, "neutral" | "brand" | "green" | "amber" | "rose"> = {
  scheduled: "brand", confirmed: "brand", completed: "green", missed: "rose", rescheduled: "amber",
};

export function AppointmentsPanel() {
  const { appointments } = useWorkflow();

  return (
    <GlassCard>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-ink-900">Appointments &amp; follow-up</h2>
        <Icon name="CalendarClock" className="h-5 w-5 text-brand-600" />
      </div>
      <div className="mt-3 space-y-2.5">
        {appointments.length === 0 && <p className="text-sm text-ink-500">No appointments scheduled.</p>}
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
              <div className="mt-2.5 flex gap-2">
                <button onClick={() => workflow.setApptStatus(a.id, "completed")} className="btn-secondary px-3 py-1.5 text-xs">Mark completed</button>
                <button onClick={() => workflow.setApptStatus(a.id, "missed")} className="btn-ghost px-3 py-1.5 text-xs text-rose-600">Mark missed</button>
              </div>
            )}
            {a.status === "missed" && (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-rose-600">
                <Icon name="AlertTriangle" className="h-3.5 w-3.5" /> Follow-up task created — care continues.
              </p>
            )}
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
