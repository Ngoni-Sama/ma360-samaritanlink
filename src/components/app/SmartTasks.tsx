import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { GlassCard } from "@/components/ui/primitives";
import { SMART_TASKS, type SmartTask } from "@/lib/data/connected";

const URGENCY: Record<SmartTask["urgency"], { cls: string; icon: string }> = {
  urgent: { cls: "border-rose-200 bg-rose-50 text-rose-700", icon: "AlertTriangle" },
  action: { cls: "border-amber-200 bg-amber-50 text-amber-800", icon: "Bell" },
  info: { cls: "border-brand-100 bg-brand-50 text-brand-800", icon: "CheckCircle2" },
};

// Active care-coordination panel — turns records into next actions, per role.
export function SmartTasks({ role }: { role: string }) {
  const tasks = SMART_TASKS[role] ?? [];
  if (tasks.length === 0) return null;
  return (
    <GlassCard>
      <div className="flex items-center gap-2">
        <Icon name="Bell" className="h-5 w-5 text-brand-600" />
        <h2 className="text-sm font-bold text-ink-900">Smart tasks &amp; alerts</h2>
      </div>
      <div className="mt-3 space-y-2">
        {tasks.map((t) => {
          const u = URGENCY[t.urgency];
          const body = (
            <div className={`flex items-start gap-2.5 rounded-2xl border px-4 py-2.5 ${u.cls}`}>
              <Icon name={u.icon} className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="text-sm font-medium">{t.text}</span>
              {t.patientId && <Icon name="ArrowRight" className="ml-auto mt-0.5 h-4 w-4 shrink-0 opacity-70" />}
            </div>
          );
          return t.patientId ? (
            <Link key={t.id} href={`/app/patients/${t.patientId}`} className="block transition hover:opacity-90">
              {body}
            </Link>
          ) : (
            <div key={t.id}>{body}</div>
          );
        })}
      </div>
    </GlassCard>
  );
}
