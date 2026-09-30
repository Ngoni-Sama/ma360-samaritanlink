import type { Metadata } from "next";
import { LandingNav } from "@/components/landing/LandingNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Icon } from "@/components/ui/Icon";
import { GlassCard, SectionTitle } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "For Organisations — MA360 SamaritanLink" };

const GROUPS = [
  { icon: "UserRound", title: "Patients & communities", body: "Seek guidance, find verified services, request navigation, and receive referral & follow-up — free to the individual." },
  { icon: "Stethoscope", title: "Healthcare providers", body: "Verified profiles, patient/service requests, appointments, referrals and care hand-offs across the connected network." },
  { icon: "Building2", title: "Organisations & programmes", body: "Enrol employee or beneficiary cohorts, coordinate care, and track closed-loop referrals with impact dashboards." },
];

const REVENUE = [
  { icon: "Stethoscope", title: "Healthcare provider network", body: "Providers subscribe to access patient requests, digital profiles and coordination tools.", who: "Pharmacies, clinics, doctors, labs, hospitals, home-care" },
  { icon: "Users", title: "Navigation & care coordination", body: "Navigation and coordination for organisations managing large populations.", who: "Employers, health orgs, medical aid, universities, NGOs" },
  { icon: "Building2", title: "Corporate & organisational health", body: "Structured employee/beneficiary interventions: screenings, chronic care, workplace wellness.", who: "Corporates, industry, commercial enterprises" },
  { icon: "HeartHandshake", title: "Sponsored & development programmes", body: "Mobilisation → registration → screening → navigation → referral → follow-up → reporting.", who: "NGOs, donors, development partners, CSR/ESG" },
  { icon: "LayoutDashboard", title: "Digital platform & technology", body: "Provider management, referral tracking, appointment coordination, patient comms, M&E dashboards.", who: "Hospitals, health systems, clinic networks, public health" },
];

export default function ForOrganisationsPage() {
  return (
    <main className="min-h-screen pb-16">
      <LandingNav />
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "For Organisations" }]} />

        <SectionTitle
          eyebrow="Commercial model"
          title="Sustainable by design"
          subtitle="SamaritanLink is not a patient-pay app. Revenue is built around the organisations that benefit from better healthcare access — never the vulnerable person seeking help."
        />

        <div className="mt-6 rounded-3xl border border-brand-100 bg-brand-600/5 px-6 py-4 text-center text-sm font-semibold text-brand-800">
          PATIENT NEED → SAMARITANLINK → CONNECTION → CARE → FOLLOW-UP
        </div>

        <h2 className="mb-3 mt-10 text-sm font-bold uppercase tracking-wide text-brand-700">Who SamaritanLink serves</h2>
        <div className="grid gap-3 lg:grid-cols-3">
          {GROUPS.map((g) => (
            <GlassCard key={g.title}>
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600/10 text-brand-700"><Icon name={g.icon} className="h-5 w-5" /></span>
              <h3 className="mt-3 text-sm font-bold text-ink-900">{g.title}</h3>
              <p className="mt-1 text-sm text-ink-600">{g.body}</p>
            </GlassCard>
          ))}
        </div>

        <h2 className="mb-3 mt-10 text-sm font-bold uppercase tracking-wide text-brand-700">Revenue categories</h2>
        <div className="space-y-3">
          {REVENUE.map((r) => (
            <GlassCard key={r.title} className="flex flex-wrap items-start gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600/10 text-brand-700"><Icon name={r.icon} className="h-5 w-5" /></span>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-ink-900">{r.title}</h3>
                <p className="mt-1 text-sm text-ink-600">{r.body}</p>
                <p className="mt-1 text-xs text-ink-400">Stakeholders: {r.who}</p>
              </div>
            </GlassCard>
          ))}
        </div>

        <blockquote className="mt-8 border-l-4 border-brand-500 pl-4 text-base font-medium italic text-ink-700">
          “Don’t charge the vulnerable person for finding help. Build sustainable revenue around the infrastructure that makes healthcare access possible.”
        </blockquote>
      </div>
    </main>
  );
}
