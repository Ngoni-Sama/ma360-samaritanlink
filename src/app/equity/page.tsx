import type { Metadata } from "next";
import { LandingNav } from "@/components/landing/LandingNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Icon } from "@/components/ui/Icon";
import { GlassCard, SectionTitle } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "Health Access Equity — MA360 SamaritanLink" };

const FACTORS = [
  { f: "Gender", e: "Care-seeking norms, decision-making power, safety, stigma" },
  { f: "Age", e: "Adolescents, elderly, paediatric dependents" },
  { f: "Disability", e: "Physical, sensory, cognitive, mobility limitations" },
  { f: "Geography / Distance", e: "Rural, peri-urban, remoteness, transport corridors" },
  { f: "Affordability", e: "Transport, consultation fees, medication costs" },
  { f: "Mobility", e: "Ability to travel, availability of transport" },
  { f: "Work", e: "Inability to leave work, lost income, informal employment" },
  { f: "Caregiving", e: "Caring for children, elderly or sick relatives" },
  { f: "Privacy", e: "Stigma, fear of disclosure, community judgement" },
  { f: "Digital access", e: "Phone ownership, data, literacy, network coverage" },
];

const POPULATIONS = [
  { icon: "HeartHandshake", label: "Pregnant & postnatal women", need: "Mobility, caregiving, privacy, distance" },
  { icon: "UserRound", label: "New mothers", need: "Caregiving, transport, time" },
  { icon: "Users", label: "Elderly patients", need: "Mobility, distance, digital access" },
  { icon: "Activity", label: "Persons with disabilities", need: "Mobility, accessibility, transport" },
  { icon: "HeartPulse", label: "Chronic disease patients", need: "Continuity, medication access, follow-up" },
  { icon: "Home", label: "Recovering at home & caregivers", need: "Mobility, transport, work, time" },
];

export default function EquityPage() {
  return (
    <main className="min-h-screen pb-16">
      <LandingNav />
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Health Access Equity" }]} />

        <SectionTitle
          eyebrow="Cross-cutting layer"
          title="Health Access Equity"
          subtitle="A layer across every stage of care — not a separate programme. It shapes whether a patient can enter care, navigate care, complete care and remain connected to care."
        />

        <blockquote className="mt-6 border-l-4 border-brand-500 pl-4 text-base font-medium italic text-ink-700">
          “Healthcare access is not only about reaching a health facility. It is about being able to enter care,
          navigate care, complete care and remain connected to care.”
        </blockquote>

        <h2 className="mb-3 mt-10 text-sm font-bold uppercase tracking-wide text-brand-700">Factors that shape access</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {FACTORS.map((x) => (
            <GlassCard key={x.f}>
              <p className="text-sm font-bold text-ink-900">{x.f}</p>
              <p className="mt-1 text-sm text-ink-600">{x.e}</p>
            </GlassCard>
          ))}
        </div>

        <GlassCard className="mt-8">
          <h2 className="text-sm font-bold text-ink-900">Barrier response workflow</h2>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {["Identify the barrier", "Select the response", "Reconnect the patient", "Monitor continuity"].map((s, i) => (
              <span key={s} className="flex items-center gap-2">
                <span className="pill border border-brand-200 bg-brand-50 text-brand-800">{s}</span>
                {i < 3 && <Icon name="ArrowRight" className="h-3.5 w-3.5 text-brand-300" />}
              </span>
            ))}
          </div>
        </GlassCard>

        <h2 className="mb-3 mt-10 text-sm font-bold uppercase tracking-wide text-brand-700">Home follow-up — priority populations</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {POPULATIONS.map((p) => (
            <GlassCard key={p.label}>
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600/10 text-brand-700">
                <Icon name={p.icon} className="h-5 w-5" />
              </span>
              <p className="mt-3 text-sm font-bold text-ink-900">{p.label}</p>
              <p className="mt-1 text-xs text-ink-500">Barriers addressed: {p.need}</p>
            </GlassCard>
          ))}
        </div>

        <p className="mt-8 text-lg font-semibold text-brand-700">“Diagnosis is not the endpoint. Continuity is the intervention.”</p>
      </div>
    </main>
  );
}
