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
