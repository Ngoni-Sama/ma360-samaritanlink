import type { Metadata } from "next";
import { LandingNav } from "@/components/landing/LandingNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Icon } from "@/components/ui/Icon";
import { GlassCard, SectionTitle } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "Use Cases — MA360 SamaritanLink" };

const CASES = [
  { icon: "HeartHandshake", title: "Maternal & postnatal continuity", flow: "Facility → Home → Follow-up", body: "Supporting pregnant and postnatal women through the full continuum, including home-based follow-up where facility return is difficult." },
  { icon: "ShieldCheck", title: "Men's preventive health", flow: "Screening → Risk → Referral → Treatment → Follow-up", body: "Addressing the specific barriers that prevent men from seeking preventive care early." },
  { icon: "UserRound", title: "Adolescent & confidential care", flow: "Access where privacy matters", body: "Recognising that adolescents may avoid care entirely if confidentiality is not assured." },
  { icon: "HeartPulse", title: "Gender & chronic-disease continuity", flow: "Understanding discontinuation", body: "Exploring the gendered dimensions of chronic disease management and treatment adherence." },
  { icon: "Users", title: "Caregiver support", flow: "Households & dependents", body: "Helping households manage medication, appointments, referrals and ongoing care — recognising the caregiving burden." },
];

export default function UseCasesPage() {
  return (
    <main className="min-h-screen pb-16">
      <LandingNav />
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Use Cases" }]} />
        <SectionTitle
          eyebrow="Equity in practice"
          title="Gender-responsive care, integrated"
          subtitle="The same connected journey, applied where gender and social realities affect whether a person can enter and remain in care — not a separate service."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CASES.map((c) => (
            <GlassCard key={c.title}>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600/10 text-brand-700"><Icon name={c.icon} className="h-5 w-5" /></span>
              <h3 className="mt-4 text-base font-bold text-ink-900">{c.title}</h3>
              <p className="mt-1 text-xs font-semibold text-brand-600">{c.flow}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{c.body}</p>
            </GlassCard>
          ))}
          <GlassCard className="flex flex-col justify-center bg-brand-900/90 text-white">
            <p className="text-sm font-semibold">PATIENT REACHED → CONNECTED → CONTINUED → OUTCOME</p>
            <p className="mt-2 text-xs text-brand-50/80">Equity is one lens for understanding access and continuity — alongside age, disability, geography and affordability.</p>
          </GlassCard>
        </div>
      </div>
    </main>
  );
}
