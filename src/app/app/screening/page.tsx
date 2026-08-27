import { Icon } from "@/components/ui/Icon";
import { GlassCard, StatusPill } from "@/components/ui/primitives";
import { PageHeader } from "@/components/app/PageHeader";
import { SCREENING_RECORDS } from "@/lib/data/demo";

export default function ScreeningPage() {
  return (
    <>
      <PageHeader
        title="Community Screening"
        subtitle="Capture vitals in the community. Thresholds are demo values, not clinically validated."
        action={<button className="btn-primary"><Icon name="Activity" className="h-4 w-4" /> New screening</button>}
      />

      <div className="space-y-4">
        {SCREENING_RECORDS.map((r) => (
          <GlassCard key={r.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600/10 text-brand-700">
                  <Icon name="UserRound" className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-bold text-ink-900">{r.patientName}</p>
                  <p className="text-xs text-ink-500">{r.age} · {r.sex} · {r.location}</p>
                </div>
              </div>
              <StatusPill status={r.status} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {r.measurements.map((m) => (
                <div key={m.label} className="rounded-2xl border border-white/60 bg-white/60 px-3 py-2.5">
                  <p className="text-[11px] font-medium text-ink-500">{m.label}</p>
                  <p className="text-sm font-bold text-ink-900">
                    {m.value} <span className="text-xs font-normal text-ink-400">{m.unit}</span>
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-3 text-xs text-ink-400">Recorded by {r.recordedBy} · {r.date}</p>
          </GlassCard>
        ))}
      </div>
    </>
  );
}
