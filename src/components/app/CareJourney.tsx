import { Icon } from "@/components/ui/Icon";
import { STAGE_META, type JourneyEvent } from "@/lib/data/connected";

const STATUS_RING: Record<JourneyEvent["status"], string> = {
  completed: "border-brand-500 bg-brand-500 text-white",
  active: "border-brand-500 bg-white text-brand-600",
  scheduled: "border-ink-200 bg-white text-ink-400",
  missed: "border-rose-300 bg-white text-rose-500",
};

// "My Care Journey" — the signature SamaritanLink timeline. `simple` renders the
// patient-facing subset; the full version is for authorised professionals.
export function CareJourney({ events, simple = false }: { events: JourneyEvent[]; simple?: boolean }) {
  const list = simple ? events.filter((e) => e.patientVisible) : events;
  return (
    <ol className="space-y-0">
      {list.map((e, i) => {
        const meta = STAGE_META[e.stage];
        const isLast = i === list.length - 1;
        return (
          <li key={e.id} className="relative flex gap-4 pb-6 last:pb-0">
            {!isLast && (
              <span className={`absolute left-[17px] top-9 h-full w-0.5 ${e.status === "completed" ? "bg-brand-400" : "bg-ink-200"}`} />
            )}
            <span className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 ${STATUS_RING[e.status]}`}>
              <Icon name={meta.icon} className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-brand-600">{e.date}</span>
                {e.status === "active" && <span className="pill bg-brand-50 text-brand-700">In progress</span>}
                {e.status === "scheduled" && <span className="pill bg-ink-50 text-ink-500">Scheduled</span>}
                {e.status === "missed" && <span className="pill bg-rose-50 text-rose-600">Missed</span>}
              </div>
              <p className="mt-0.5 text-sm font-semibold text-ink-900">{e.title}</p>
              <p className="text-sm text-ink-600">{e.detail}</p>
              {!simple && <p className="mt-0.5 text-xs text-ink-400">{e.by}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
