"use client";

import { Icon } from "@/components/ui/Icon";
import { GlassCard, Tag } from "@/components/ui/primitives";
import { EmptyState, LoadingRows } from "@/components/ui/EmptyState";
import { useWorkflow, useWorkflowStatus } from "@/lib/store/workflow";

const RX_TONE: Record<string, "neutral" | "brand" | "amber" | "green"> = {
  issued: "neutral", received: "brand", preparing: "amber", ready: "green", collected: "green",
};
const RX_LABEL: Record<string, string> = {
  issued: "Issued", received: "At pharmacy", preparing: "Being prepared", ready: "Ready for collection", collected: "Collected",
};

export function PatientWorkflow({ patientId }: { patientId: string }) {
  const { prescriptions, labs, appointments } = useWorkflow();
  const { loaded } = useWorkflowStatus();
  const rx = prescriptions.filter((p) => p.patientId === patientId);
  const lab = labs.filter((l) => l.patientId === patientId);
  const appt = appointments.filter((a) => a.patientId === patientId);
  const nothing = rx.length + lab.length + appt.length === 0;

  return (
    <GlassCard>
      <h2 className="text-sm font-bold text-ink-900">Medicines, tests &amp; appointments</h2>

      {!loaded && <div className="mt-3"><LoadingRows rows={3} /></div>}

      {loaded && nothing && (
        <div className="mt-3">
          <EmptyState
            icon="HeartPulse"
            title="Nothing in progress right now"
            hint="Prescriptions, lab tests and review appointments from the care team appear here as soon as they are created."
            action={{ label: "Ask the Health Navigator", href: "/app/navigator" }}
          />
        </div>
      )}

      {loaded && !nothing && (
        <div className="mt-3 space-y-4">
          <Section title="Medicines" empty="No prescriptions yet. A clinician's prescription appears here with its pharmacy status.">
            {rx.map((p) => (
              <Row key={p.id} icon="Pill" title={p.items} meta={p.pharmacy} tag={<Tag tone={RX_TONE[p.status]}>{RX_LABEL[p.status]}</Tag>} />
            ))}
          </Section>
          <Section title="Laboratory tests" empty="No tests requested. Results go to your doctor first, who will explain them.">
            {lab.map((l) => (
              <Row key={l.id} icon="FlaskConical" title={l.tests} meta={l.lab}
                tag={<Tag tone={l.status === "sent_to_doctor" ? "green" : "amber"}>{l.status === "sent_to_doctor" ? "With your doctor" : "In progress"}</Tag>} />
            ))}
          </Section>
          <Section title="Appointments" empty="No appointments booked. You'll get an SMS reminder when one is scheduled.">
            {appt.map((a) => (
              <Row key={a.id} icon="CalendarClock" title={a.purpose} meta={a.when}
                tag={<Tag tone={a.status === "missed" ? "rose" : a.status === "completed" ? "green" : "brand"}>{a.status}</Tag>} />
            ))}
          </Section>
        </div>
      )}
    </GlassCard>
  );
}

function Section({ title, empty, children }: { title: string; empty: string; children: React.ReactNode[] }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{title}</p>
      <div className="mt-1.5 space-y-2">
        {children.length === 0 ? <p className="text-sm text-ink-500">{empty}</p> : children}
      </div>
    </div>
  );
}

function Row({ icon, title, meta, tag }: { icon: string; title: string; meta: string; tag: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/60 px-4 py-2.5">
      <Icon name={icon} className="h-4.5 w-4.5 shrink-0 text-brand-600" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink-900">{title}</p>
        <p className="text-xs text-ink-500">{meta}</p>
      </div>
      {tag}
    </div>
  );
}
