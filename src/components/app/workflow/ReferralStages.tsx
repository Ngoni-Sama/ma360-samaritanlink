import { REFERRAL_FLOW, REFERRAL_STAGE_LABEL, type ReferralStatus } from "@/lib/workflow-types";

// Five-stage closed-loop progress. `status` is the last confirmed stage; when the
// referral is stalled, the next stage is where the journey broke.
export function ReferralStages({ status, stalled }: { status: ReferralStatus; stalled: boolean }) {
  const idx = REFERRAL_FLOW.indexOf(status);
  const nextIdx = idx + 1 < REFERRAL_FLOW.length ? idx + 1 : -1;

  return (
    <div className="mt-3">
      <ol className="grid grid-cols-5 gap-1" aria-label="Referral progress">
        {REFERRAL_FLOW.map((s, i) => {
          const state = i <= idx ? "done" : i === nextIdx ? (stalled ? "stuck" : "next") : "todo";
          const bar = { done: "bg-brand-500", stuck: "bg-rose-500", next: "bg-brand-200", todo: "bg-ink-100" }[state];
          const text = { done: "text-ink-700", stuck: "font-semibold text-rose-700", next: "text-ink-500", todo: "text-ink-500" }[state];
          const sr = { done: "done", stuck: "journey stalled here", next: "next step", todo: "not yet" }[state];
          return (
            <li key={s} className="min-w-0">
              <span className={`block h-1.5 rounded-full ${bar}`} aria-hidden />
              <span className={`mt-1.5 hidden text-xs leading-tight sm:block ${text}`} aria-hidden>{REFERRAL_STAGE_LABEL[s]}</span>
              <span className="sr-only">{REFERRAL_STAGE_LABEL[s]}: {sr}</span>
            </li>
          );
        })}
      </ol>
      <p className="mt-1.5 text-xs text-ink-500 sm:hidden" aria-hidden>
        Step {idx + 1} of {REFERRAL_FLOW.length}: {REFERRAL_STAGE_LABEL[status]}
        {stalled && nextIdx >= 0 && <span className="font-semibold text-rose-700"> · stuck before {REFERRAL_STAGE_LABEL[REFERRAL_FLOW[nextIdx]].toLowerCase()}</span>}
      </p>
    </div>
  );
}
