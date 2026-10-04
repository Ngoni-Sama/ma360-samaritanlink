import type { Metadata } from "next";
import Link from "next/link";
import { LandingNav } from "@/components/landing/LandingNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Icon } from "@/components/ui/Icon";
import { GlassCard, SectionTitle } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "How It Works — MA360 SamaritanLink" };

const JOURNEY = ["Community", "Navigation", "Screening", "Clinical Care", "Diagnostics", "Pharmacy", "Referral", "Home Follow-up", "Continuity of Care"];

const SERVICES = [
  { icon: "Compass", title: "Health Navigation" },
  { icon: "Activity", title: "Community Screening" },
  { icon: "Stethoscope", title: "Telehealth" },
  { icon: "FlaskConical", title: "Diagnostics" },
  { icon: "Pill", title: "Pharmacy Connect" },
  { icon: "Route", title: "Referral Tracking" },
  { icon: "Home", title: "Home Follow-up" },
  { icon: "HeartPulse", title: "ChronicCare" },
  { icon: "Users", title: "Community Health Workers" },
  { icon: "LineChart", title: "Health Intelligence" },
];

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen pb-16">
      <LandingNav />
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "How It Works" }]} />
        <SectionTitle
          eyebrow="The connected journey"
          title="One patient. One journey. Connected care."
          subtitle="SamaritanLink is a connection and health-extension layer. It does not replace hospitals, clinics, pharmacies or clinicians — it keeps patients linked to them across every step."
        />

        <div className="mt-8 flex flex-wrap items-center gap-2.5">
          {JOURNEY.map((node, i) => (
            <div key={node} className="flex items-center gap-2.5">
              <div className="rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-800">{node}</div>
              {i < JOURNEY.length - 1 && <Icon name="ArrowRight" className="h-4 w-4 text-brand-400" />}
            </div>
          ))}
        </div>

        <GlassCard className="mt-10">
          <h2 className="text-lg font-bold text-ink-900">How SamaritanLink keeps care connected</h2>
          <p className="mt-1 max-w-prose text-sm text-ink-600">
            We don&apos;t only ask whether a patient was connected to a service. We ask whether they completed the care
            journey, and if not, why.
          </p>
          <ol className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {[
              "Patient need", "Navigate", "Identify access barriers", "Connect to care", "Referral / treatment",
              "Track progress", "Identify drop-offs", "Respond to barriers", "Follow-up", "Continuity of care",
            ].map((step, i) => (
              <li key={step} className={`flex items-center gap-2.5 rounded-2xl border px-3 py-2.5 ${[2, 6, 7].includes(i) ? "border-brand-300 bg-brand-50" : "border-white/60 bg-white/60"}`}>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">{i + 1}</span>
                <span className="text-sm font-medium text-ink-800">{step}</span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-sm text-ink-500">
            Highlighted steps are where Health Access Equity works: barriers are identified, drop-offs are tracked to the
            stage where they happen, and the care team responds.
          </p>
        </GlassCard>

        <h2 className="mb-3 mt-10 text-sm font-bold uppercase tracking-wide text-brand-700">Ten connected services</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <GlassCard key={s.title} className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600/10 text-brand-700"><Icon name={s.icon} className="h-5 w-5" /></span>
              <span className="text-sm font-semibold text-ink-900">{s.title}</span>
            </GlassCard>
          ))}
        </div>

        <div className="mt-8">
          <Link href="/login" className="btn-primary">Access SamaritanLink <Icon name="ArrowRight" className="h-4 w-4" /></Link>
        </div>
      </div>
    </main>
  );
}
