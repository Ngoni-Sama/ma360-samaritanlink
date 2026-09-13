import { Icon } from "@/components/ui/Icon";
import { GlassCard } from "@/components/ui/primitives";

// Equity addendum §6: Health Intelligence with an equity lens — not just numbers,
// but who enters/refers/completes/continues, and where groups drop out.
const QUESTIONS = [
  "Who is entering care?",
  "Who is being referred?",
  "Who completes the referral?",
  "Who starts treatment?",
  "Who remains in care?",
  "Where are groups dropping out — and why?",
];

const LENSES = ["Gender", "Age", "Disability", "Geography", "Affordability", "Digital access"];

export function EquityIntelligence() {
  return (
    <GlassCard>
      <div className="flex items-center gap-2">
        <Icon name="LineChart" className="h-5 w-5 text-brand-600" />
        <h2 className="text-sm font-bold text-ink-900">Health Intelligence — equity lens</h2>
        <span className="pill ml-auto border border-ink-200 bg-white/70 text-ink-500">Demo</span>
      </div>
      <p className="mt-1 text-xs text-ink-500">
        Beyond counting activity — understanding equitable access and continuity across the population.
      </p>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {QUESTIONS.map((q) => (
          <div key={q} className="flex items-center gap-2.5 rounded-2xl border border-white/60 bg-white/60 px-3 py-2.5">
            <Icon name="ArrowRight" className="h-4 w-4 shrink-0 text-brand-500" />
            <span className="text-sm text-ink-800">{q}</span>
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-ink-400">Analytical lenses</p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {LENSES.map((l) => (
          <span key={l} className="pill border border-brand-200 bg-brand-50 text-brand-800">{l}</span>
        ))}
      </div>
    </GlassCard>
  );
}
