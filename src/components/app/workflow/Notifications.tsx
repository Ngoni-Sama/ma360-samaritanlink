"use client";

import { Icon } from "@/components/ui/Icon";
import { GlassCard } from "@/components/ui/primitives";
import { EmptyState, LoadingRows, type EmptyAction } from "@/components/ui/EmptyState";
import { useWorkflow, useWorkflowStatus, type Notification } from "@/lib/store/workflow";

const CHANNEL_ICON: Record<Notification["channel"], string> = {
  SMS: "MessageSquareText", WhatsApp: "MessageSquareText", "In-app": "Bell",
};

const EMPTY: Record<Notification["to"], { hint: string; action?: EmptyAction }> = {
  patient: { hint: "Updates about your medicines, tests and appointments arrive here and by SMS.", action: { label: "View My Care Journey", href: "/app/journey" } },
  doctor: { hint: "Lab results, missed appointments and escalations from the care team arrive here.", action: { label: "Search patients", href: "/app/patients" } },
  pharmacy: { hint: "New prescriptions sent to this pharmacy arrive here.", action: { label: "Search patients", href: "/app/patients" } },
  laboratory: { hint: "New test requests from clinicians arrive here.", action: { label: "Search patients", href: "/app/patients" } },
};

export function Notifications({ to, title = "Notifications" }: { to: Notification["to"]; title?: string }) {
  const { notifications } = useWorkflow();
  const { loaded } = useWorkflowStatus();
  const items = notifications.filter((n) => n.to === to);

  return (
    <GlassCard>
      <div className="flex items-center gap-2">
        <Icon name="Bell" className="h-5 w-5 text-brand-600" />
        <h2 className="text-sm font-bold text-ink-900">{title}</h2>
      </div>
      <div className="mt-3 space-y-2">
        {!loaded && <LoadingRows />}
        {loaded && items.length === 0 && <EmptyState icon="Bell" title="No messages yet" hint={EMPTY[to].hint} action={EMPTY[to].action} />}
        {items.map((n) => (
          <div key={n.id} className="flex items-start gap-2.5 rounded-2xl border border-white/60 bg-white/60 px-4 py-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600/10 text-brand-700">
              <Icon name={CHANNEL_ICON[n.channel]} className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-ink-800">{n.text}</p>
              <p className="mt-0.5 text-xs text-ink-500">{n.channel} · {new Date(n.at).toLocaleTimeString()}</p>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
