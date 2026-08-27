import { Icon } from "@/components/ui/Icon";
import { GlassCard, Tag } from "@/components/ui/primitives";
import { PageHeader } from "@/components/app/PageHeader";
import { DIAGNOSTIC_ITEMS } from "@/lib/data/demo";

const STATUS: Record<string, { label: string; tone: "green" | "amber" | "neutral" }> = {
  result_available: { label: "Result available", tone: "green" },
  in_progress: { label: "In progress", tone: "amber" },
  requested: { label: "Requested", tone: "neutral" },
};

export default function DiagnosticsPage() {
  return (
    <>
      <PageHeader title="Diagnostics" subtitle="Coordinate laboratory tests and return results into the care journey." />

      <div className="space-y-3">
        {DIAGNOSTIC_ITEMS.map((d) => {
          const s = STATUS[d.status];
          return (
            <GlassCard key={d.id} className="flex flex-wrap items-center gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600/10 text-brand-700">
                <Icon name="FlaskConical" className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-ink-900">{d.test}</p>
                <p className="text-xs text-ink-500">{d.facility} · {d.date}</p>
                {d.result && <p className="mt-1 text-xs font-medium text-brand-700">{d.result}</p>}
              </div>
              <Tag tone={s.tone}>{s.label}</Tag>
            </GlassCard>
          );
        })}
      </div>
    </>
  );
}
