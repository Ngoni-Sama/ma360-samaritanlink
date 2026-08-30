"use client";

import { Icon } from "@/components/ui/Icon";
import { GlassCard, Tag } from "@/components/ui/primitives";
import { useWorkflow } from "@/lib/store/workflow";

const RX_TONE: Record<string, "neutral" | "brand" | "amber" | "green"> = {
  issued: "neutral", received: "brand", preparing: "amber", ready: "green", collected: "green",
};
const RX_LABEL: Record<string, string> = {
  issued: "Issued", received: "At pharmacy", preparing: "Being prepared", ready: "Ready for collection", collected: "Collected",
};

export function PatientWorkflow({ patientId }: { patientId: string }) {
  const { prescriptions, labs, appointments } = useWorkflow();
  const rx = prescriptions.filter((p) => p.patientId === patientId);
  const lab = labs.filter((l) => l.patientId === patientId);
  const appt = appointments.filter((a) => a.patientId === patientId);

  return (
    <GlassCard>
      <h2 className="text-sm font-bold text-ink-900">My medicines, tests &amp; appointments</h2>

      <div className="mt-3 space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Medicines</p>
          <div className="mt-1.5 space-y-2">
            {rx.length === 0 && <p className="text-sm text-ink-500">No active prescriptions.</p>}
            {rx.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/60 px-4 py-2.5">
                <Icon name="Pill" className="h-4.5 w-4.5 text-brand-600" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink-900">{p.items}</p>
                  <p className="text-xs text-ink-400">{p.pharmacy}</p>
                </div>
                <Tag tone={RX_TONE[p.status]}>{RX_LABEL[p.status]}</Tag>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Laboratory tests</p>
          <div className="mt-1.5 space-y-2">
            {lab.length === 0 && <p className="text-sm text-ink-500">No tests requested.</p>}
            {lab.map((l) => (
              <div key={l.id} className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/60 px-4 py-2.5">
                <Icon name="FlaskConical" className="h-4.5 w-4.5 text-brand-600" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink-900">{l.tests}</p>
                  <p className="text-xs text-ink-400">{l.lab}</p>
                </div>
                <Tag tone={l.status === "sent_to_doctor" ? "green" : "amber"}>
                  {l.status === "sent_to_doctor" ? "With your doctor" : "In progress"}
                </Tag>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Appointments</p>
          <div className="mt-1.5 space-y-2">
            {appt.length === 0 && <p className="text-sm text-ink-500">No appointments scheduled.</p>}
            {appt.map((a) => (
              <div key={a.id} className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/60 px-4 py-2.5">
                <Icon name="CalendarClock" className="h-4.5 w-4.5 text-brand-600" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink-900">{a.purpose}</p>
                  <p className="text-xs text-ink-400">{a.when}</p>
                </div>
                <Tag tone={a.status === "missed" ? "rose" : a.status === "completed" ? "green" : "brand"}>{a.status}</Tag>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
