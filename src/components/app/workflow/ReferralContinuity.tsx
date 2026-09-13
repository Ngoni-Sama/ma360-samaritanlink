import { Icon } from "@/components/ui/Icon";
import { GlassCard } from "@/components/ui/primitives";

// Equity addendum §4: a referral being created does not mean care was completed.
// Show the full continuity chain and the barriers behind drop-out.
const CHAIN = ["Referral Created", "Referral Received", "Appointment Attended", "Treatment Started", "Follow-up Completed"];

const DROPOUT = [
  "Transport not available",
  "Appointment time conflicts with work",
  "Could not afford medication",
  "Privacy concerns",
  "No one to care for dependents",
  "Mobility limitation",
  "Distance too great",
];

export function ReferralContinuity() {
  return (
    <GlassCard>
      <div className="flex items-center gap-2">
        <Icon name="Route" className="h-5 w-5 text-brand-600" />
        <h2 className="text-sm font-bold text-ink-900">Referral continuity — creation is not completion</h2>
      </div>
      <p className="mt-1 text-xs text-ink-500">A referral being created does not mean care was completed. SamaritanLink follows the full chain.</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {CHAIN.map((step, i) => (
          <span key={step} className="flex items-center gap-2">
            <span className="pill border border-brand-200 bg-brand-50 text-brand-800">{step}</span>
            {i < CHAIN.length - 1 && <Icon name="ArrowRight" className="h-3.5 w-3.5 text-brand-300" />}
          </span>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Drop-out analysis — likely access barriers</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {DROPOUT.map((d) => (
            <span key={d} className="pill border border-amber-200 bg-white/70 text-amber-800">
              <Icon name="AlertTriangle" className="h-3.5 w-3.5" /> {d}
            </span>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
