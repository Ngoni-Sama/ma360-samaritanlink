import { Icon } from "@/components/ui/Icon";
import { GlassCard } from "@/components/ui/primitives";
import { PageHeader } from "@/components/app/PageHeader";
import { REFERRAL_TIMELINE } from "@/lib/data/demo";
import { getCurrentUser } from "@/lib/session";
import { ReferralTracker } from "@/components/app/workflow/ReferralTracker";

export default async function ReferralsPage() {
  const user = await getCurrentUser();
  const canCreate = user?.role === "professional" || user?.role === "health_worker" || user?.role === "admin";
  const from = user?.providerId || "SL-DR-000245";

  return (
    <>
      <PageHeader title="Referral Tracker" subtitle="Follow every referral from creation to completion and follow-up." />

      <div className="mb-4">
        <ReferralTracker canCreate={canCreate} from={from} />
      </div>

      <h2 className="mb-3 text-sm font-bold text-ink-900">Example — connected referral timeline</h2>
      <GlassCard>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-ink-900">Hypertension — specialist review</h2>
            <p className="text-xs text-ink-500">Chitungwiza Clinic → Harare Central Hospital</p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600/10 text-brand-700">
            <Icon name="Route" className="h-5 w-5" />
          </span>
        </div>

        <ol className="mt-6 space-y-0">
          {REFERRAL_TIMELINE.map((step, i) => {
            const isLast = i === REFERRAL_TIMELINE.length - 1;
            return (
              <li key={step.key} className="relative flex gap-4 pb-6 last:pb-0">
                {!isLast && (
                  <span
                    className={`absolute left-[15px] top-8 h-full w-0.5 ${
                      step.state === "done" ? "bg-brand-500" : "bg-ink-200"
                    }`}
                  />
                )}
                <span
                  className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                    step.state === "done"
                      ? "border-brand-500 bg-brand-500 text-white"
                      : step.state === "current"
                      ? "border-brand-500 bg-white text-brand-600"
                      : "border-ink-200 bg-white text-ink-300"
                  }`}
                >
                  <Icon
                    name={step.state === "done" ? "CheckCircle2" : step.state === "current" ? "HeartPulse" : "ClipboardList"}
                    className="h-4 w-4"
                  />
                </span>
                <div className="pt-1">
                  <p className={`text-sm font-semibold ${step.state === "upcoming" ? "text-ink-400" : "text-ink-900"}`}>
                    {step.label}
                  </p>
                  {step.at && <p className="text-xs text-ink-500">{step.at}</p>}
                  {step.state === "current" && (
                    <p className="mt-0.5 text-xs font-medium text-brand-600">Current stage</p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </GlassCard>
    </>
  );
}
