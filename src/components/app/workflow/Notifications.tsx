"use client";

import { Icon } from "@/components/ui/Icon";
import { GlassCard } from "@/components/ui/primitives";
import { useWorkflow, type Notification } from "@/lib/store/workflow";

const CHANNEL_ICON: Record<Notification["channel"], string> = {
  SMS: "MessageSquareText", WhatsApp: "MessageSquareText", "In-app": "Bell",
};

export function Notifications({ to, title = "Notifications" }: { to: Notification["to"]; title?: string }) {
  const { notifications } = useWorkflow();
  const items = notifications.filter((n) => n.to === to);

  return (
    <GlassCard>
      <div className="flex items-center gap-2">
        <Icon name="Bell" className="h-5 w-5 text-brand-600" />
        <h2 className="text-sm font-bold text-ink-900">{title}</h2>
      </div>
      <div className="mt-3 space-y-2">
        {items.length === 0 && <p className="text-sm text-ink-500">No messages yet.</p>}
        {items.map((n) => (
          <div key={n.id} className="flex items-start gap-2.5 rounded-2xl border border-white/60 bg-white/60 px-4 py-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600/10 text-brand-700">
              <Icon name={CHANNEL_ICON[n.channel]} className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-ink-800">{n.text}</p>
              <p className="mt-0.5 text-[11px] text-ink-400">{n.channel} · {new Date(n.at).toLocaleTimeString()}</p>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
