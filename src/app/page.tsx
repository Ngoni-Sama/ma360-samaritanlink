import Link from "next/link";
import { LandingNav } from "@/components/landing/LandingNav";
import { Icon } from "@/components/ui/Icon";
import { Brand } from "@/components/ui/Brand";
import { GlassCard, SectionTitle } from "@/components/ui/primitives";

const JOURNEY = [
  "Community", "Navigation", "Screening", "Clinical Care",
  "Diagnostics", "Pharmacy", "Referral", "Home Follow-up", "Continuity of Care",
];

const FRAGMENTED = ["Patient", "Clinic", "Diagnostics", "Pharmacy", "Referral", "Home"];

const CONNECTS = [
  { icon: "Compass", title: "Health Navigation", body: "Guide people from a health need to the right service, step by step." },
  { icon: "Activity", title: "Community Screening", body: "Blood pressure, glucose, BMI and more captured in the community." },
  { icon: "Stethoscope", title: "Telehealth", body: "Connect patients to professionals for assessment and advice." },
  { icon: "FlaskConical", title: "Diagnostics", body: "Coordinate laboratory tests and return results into the journey." },
  { icon: "Pill", title: "Pharmacy Connect", body: "Locate medicines and reserve them at participating pharmacies." },
  { icon: "Route", title: "Referral Tracking", body: "Follow every referral from creation to completion and follow-up." },
  { icon: "Home", title: "Home Follow-up", body: "Community health workers close the loop with home visits." },
  { icon: "HeartPulse", title: "ChronicCare", body: "Ongoing support for hypertension, diabetes and other conditions." },
  { icon: "Users", title: "Community Health Workers", body: "Equip frontline workers with tools that fit real communities." },
  { icon: "LineChart", title: "Health Intelligence", body: "Aggregate, de-identified insight to strengthen the whole system." },
];

const ZW = [
  "Mobile-first", "Low-bandwidth", "Community-oriented", "Multi-channel",
  "Interoperable", "Human-supported", "Clinically governed",
];

const PARTNERS = [
  { icon: "Landmark", label: "Government" }, { icon: "Pill", label: "Pharmacies" },
  { icon: "TestTube", label: "Laboratories" }, { icon: "Stethoscope", label: "Healthcare professionals" },
  { icon: "Building2", label: "Hospitals" }, { icon: "LayoutDashboard", label: "Technology companies" },
  { icon: "GraduationCap", label: "Universities" }, { icon: "HeartHandshake", label: "NGOs" },
  { icon: "Truck", label: "Development partners" }, { icon: "BadgeCheck", label: "Funders" },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <LandingNav />

      {/* Hero — full-bleed, matching medaccess360.com */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/ma360-hero.png')" }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-950/90 via-brand-800/80 to-brand-600/55" aria-hidden />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="animate-fade-up text-white">
            <span className="pill border border-white/25 bg-white/10 text-white">
              <Icon name="ShieldCheck" className="h-3.5 w-3.5" />
              A digital-health service of MedAccess360 Foundation
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] sm:text-5xl">MA360 SamaritanLink</h1>
            <p className="mt-3 text-xl font-semibold text-brand-100 sm:text-2xl">Care That Crosses the Distance.</p>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
              A connected digital-health extension platform linking people to health navigation,
              screening, clinical care, diagnostics, medicines, referrals and continuous follow-up —
              extending MedAccess360 care beyond clinic and pharmacy walls across Zimbabwe.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/login" className="btn-primary">
                Access SamaritanLink
                <Icon name="ArrowRight" className="h-4 w-4" />
              </Link>
              <a href="#solution" className="btn-secondary border-white/40 bg-white/10 text-white hover:bg-white/20">
                How It Works
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {["Established 2025", "Pharmacy-led", "Community-based", "Zimbabwe"].map((t) => (
                <span key={t} className="pill border border-white/20 bg-white/10 text-white/90">
                  <Icon name="CheckCircle2" className="h-3.5 w-3.5" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="animate-fade-up">
            <div className="rounded-3xl border border-white/60 bg-white/90 p-5 shadow-glass-lg backdrop-blur sm:p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-ink-800">The connected patient journey</p>
                <Icon name="HeartPulse" className="h-5 w-5 text-brand-600" />
              </div>
              <div className="mt-4 space-y-2.5">
                {["Need identified", "Community screening", "Clinical assessment", "Diagnostics & medicines", "Referral & home follow-up"].map(
                  (step, i) => (
                    <div key={step} className="flex items-center gap-3 rounded-2xl border border-brand-100 bg-brand-50/60 px-4 py-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                        {i + 1}
                      </span>
                      <span className="text-sm font-medium text-ink-800">{step}</span>
                      {i < 4 && <Icon name="ArrowRight" className="ml-auto h-4 w-4 text-brand-400" />}
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section id="problem" className="mx-auto mt-24 max-w-6xl px-4">
        <SectionTitle
          eyebrow="The Problem"
          title="Healthcare is often fragmented"
          subtitle="People fall through the gaps between each point of care. Every disconnect is a missed screening, an undelivered medicine, or a referral that never completes."
        />
        <div className="mt-8 flex flex-wrap items-center gap-3">
          {FRAGMENTED.map((node, i) => (
            <div key={node} className="flex items-center gap-3">
              <div className="rounded-2xl border border-dashed border-ink-300 bg-white/50 px-4 py-3 text-sm font-medium text-ink-600">
                {node}
              </div>
              {i < FRAGMENTED.length - 1 && (
                <span className="text-ink-300">
                  <Icon name="ArrowRight" className="h-4 w-4" />
                </span>
              )}
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-ink-500">Disconnected points, with the patient left to navigate alone.</p>
      </section>

      {/* The Solution */}
      <section id="solution" className="mx-auto mt-24 max-w-6xl px-4">
        <SectionTitle
          eyebrow="The SamaritanLink Solution"
          title="One connected journey"
          subtitle="SamaritanLink is a connection and health-extension layer. It does not replace hospitals, clinics, pharmacies or clinicians — it keeps patients linked to them."
        />
        <div className="mt-8 flex flex-wrap items-center gap-2.5">
          {JOURNEY.map((node, i) => (
            <div key={node} className="flex items-center gap-2.5">
              <div className="rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-800">
                {node}
              </div>
              {i < JOURNEY.length - 1 && <Icon name="ArrowRight" className="h-4 w-4 text-brand-400" />}
            </div>
          ))}
        </div>
      </section>

      {/* Health Access Equity — cross-cutting layer */}
      <section id="equity" className="mx-auto mt-16 max-w-6xl px-4">
        <div className="glass-panel overflow-hidden">
          <div className="border-b border-brand-100 bg-brand-600/5 px-6 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Health Access Equity Layer</p>
            <p className="mt-1 text-sm font-medium text-ink-700">
              A cross-cutting layer across every stage of care — not a separate programme.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {["Gender", "Age", "Disability", "Geography", "Affordability", "Mobility", "Caregiving", "Privacy", "Digital access"].map((f) => (
                <span key={f} className="pill border border-brand-200 bg-white/70 text-brand-800">{f}</span>
              ))}
            </div>
          </div>
          <div className="grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <h2 className="text-2xl font-bold text-ink-900 sm:text-3xl">Reaching a facility is not the same as completing care</h2>
              <p className="mt-3 text-base leading-relaxed text-ink-600">
                Healthcare access is not experienced equally. SamaritanLink asks not only <span className="font-medium text-ink-800">where</span> a
                patient needs to go, but <span className="font-medium text-ink-800">what might prevent them</span> from getting there or staying in care.
              </p>
              <blockquote className="mt-4 border-l-4 border-brand-500 pl-4 text-sm font-medium italic text-ink-700">
                “Healthcare access is not only about reaching a health facility. It is about being able to enter care,
                navigate care, complete care and remain connected to care.”
              </blockquote>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                {["Identify the barrier", "Select the response", "Reconnect the patient", "Monitor continuity"].map((s, i) => (
                  <span key={s} className="flex items-center gap-2">
                    <span className="pill border border-brand-200 bg-brand-50 text-brand-800">{s}</span>
                    {i < 3 && <Icon name="ArrowRight" className="h-3.5 w-3.5 text-brand-300" />}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Home follow-up — priority populations</p>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {[
                  { icon: "HeartHandshake", label: "Pregnant & postnatal women" },
                  { icon: "UserRound", label: "New mothers" },
                  { icon: "Users", label: "Elderly patients" },
                  { icon: "Activity", label: "Persons with disabilities" },
                  { icon: "HeartPulse", label: "Chronic disease patients" },
                  { icon: "Home", label: "Recovering at home & caregivers" },
                ].map((p) => (
                  <div key={p.label} className="flex items-center gap-2.5 rounded-2xl border border-white/60 bg-white/60 px-3 py-2.5">
                    <Icon name={p.icon} className="h-4.5 w-4.5 text-brand-600" />
                    <span className="text-xs font-medium text-ink-700">{p.label}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-sm font-semibold text-brand-700">“Diagnosis is not the endpoint. Continuity is the intervention.”</p>
            </div>
          </div>
        </div>
      </section>

      {/* What SamaritanLink Connects */}
      <section id="connects" className="mx-auto mt-24 max-w-6xl px-4">
        <SectionTitle eyebrow="What SamaritanLink Connects" title="Ten services, one patient journey" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CONNECTS.map((c) => (
            <GlassCard key={c.title} className="transition hover:-translate-y-0.5 hover:shadow-glass-lg">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600/10 text-brand-700">
                <Icon name={c.icon} className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-bold text-ink-900">{c.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{c.body}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Why + Built for Zimbabwe */}
      <section className="mx-auto mt-24 max-w-6xl px-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <GlassCard className="bg-brand-900/90 text-white">
            <span className="pill bg-white/15 text-white">Why SamaritanLink</span>
            <h3 className="mt-4 text-2xl font-bold">One patient journey, not disconnected services.</h3>
            <p className="mt-3 text-brand-50/90">
              Instead of asking patients to stitch together clinics, labs, pharmacies and referrals
              on their own, SamaritanLink holds the thread across every step of care.
            </p>
          </GlassCard>
          <GlassCard>
            <span className="pill border border-brand-200 bg-brand-50 text-brand-700">
              <Icon name="MapPin" className="h-3.5 w-3.5" />
              Built for Zimbabwe
            </span>
            <h3 className="mt-4 text-xl font-bold text-ink-900">Designed for real communities</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {ZW.map((t) => (
                <span key={t} className="pill border border-ink-200 bg-white/70 text-ink-700">
                  <Icon name="CheckCircle2" className="h-3.5 w-3.5 text-brand-600" />
                  {t}
                </span>
              ))}
            </div>
            <Link href="/ussd" className="btn-secondary mt-4 text-sm">
              <Icon name="Phone" className="h-4 w-4" /> Try USSD / SMS (no smartphone needed)
            </Link>
          </GlassCard>
        </div>
      </section>

      {/* Gender-responsive use cases */}
      <section id="usecases" className="mx-auto mt-24 max-w-6xl px-4">
        <SectionTitle
          eyebrow="Equity in practice"
          title="Gender-responsive care, integrated — not a separate service"
          subtitle="The same connected journey, applied where gender and social realities affect whether a person can enter and remain in care."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: "HeartHandshake", title: "Maternal & postnatal continuity", body: "Facility → Home → Follow-up for pregnant and postnatal women when facility return is difficult." },
            { icon: "ShieldCheck", title: "Men's preventive health", body: "Screening → Risk → Referral → Treatment → Follow-up, addressing barriers to early care-seeking." },
            { icon: "UserRound", title: "Adolescent & confidential care", body: "Supporting access where privacy and confidentiality affect whether young people seek care at all." },
            { icon: "HeartPulse", title: "Gender & chronic-disease continuity", body: "Understanding why patients discontinue medication or follow-up, and reconnecting them." },
            { icon: "Users", title: "Caregiver support", body: "Helping households manage medication, appointments and referrals — recognising the caregiving burden." },
          ].map((u) => (
            <GlassCard key={u.title} className="transition hover:-translate-y-0.5 hover:shadow-glass-lg">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600/10 text-brand-700">
                <Icon name={u.icon} className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-bold text-ink-900">{u.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{u.body}</p>
            </GlassCard>
          ))}
          <GlassCard className="flex flex-col justify-center bg-brand-900/90 text-white">
            <p className="text-sm font-semibold">PATIENT REACHED → CONNECTED → CONTINUED → OUTCOME</p>
            <p className="mt-2 text-xs text-brand-50/80">Equity is one of the lenses used to understand access and continuity — alongside age, disability, geography and affordability.</p>
          </GlassCard>
        </div>
      </section>

      {/* Commercial — For Organisations */}
      <section id="organisations" className="mx-auto mt-24 max-w-6xl px-4">
        <SectionTitle
          eyebrow="For Organisations"
          title="Sustainable by design"
          subtitle="SamaritanLink is not a patient-pay app. Revenue is built around the organisations that benefit from better healthcare access — never the vulnerable person seeking help."
        />
        <div className="mt-6 grid gap-3 lg:grid-cols-3">
          {[
            { icon: "UserRound", title: "Patients & communities", body: "Seek guidance, find verified services, request navigation, receive referral & follow-up — free to the individual." },
            { icon: "Stethoscope", title: "Healthcare providers", body: "Verified profiles, patient/service requests, appointments, referrals and care hand-offs across the network." },
            { icon: "Building2", title: "Organisations & programmes", body: "Enrol employee or beneficiary cohorts, coordinate care, and track closed-loop referrals with impact dashboards." },
          ].map((g) => (
            <GlassCard key={g.title}>
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600/10 text-brand-700">
                <Icon name={g.icon} className="h-5 w-5" />
              </span>
              <h3 className="mt-3 text-sm font-bold text-ink-900">{g.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-ink-600">{g.body}</p>
            </GlassCard>
          ))}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { icon: "Stethoscope", label: "Provider network subscriptions" },
            { icon: "Users", label: "Navigation & care coordination" },
            { icon: "Building2", label: "Corporate health programmes" },
            { icon: "HeartHandshake", label: "Sponsored & development programmes" },
            { icon: "LayoutDashboard", label: "Digital platform & technology services" },
          ].map((r) => (
            <div key={r.label} className="glass-panel flex flex-col items-start gap-2 p-4">
              <Icon name={r.icon} className="h-5 w-5 text-brand-700" />
              <span className="text-xs font-semibold text-ink-800">{r.label}</span>
            </div>
          ))}
        </div>
        <blockquote className="mt-5 border-l-4 border-brand-500 pl-4 text-sm font-medium italic text-ink-700">
          “Don’t charge the vulnerable person for finding help. Build sustainable revenue around the infrastructure that makes healthcare access possible.”
        </blockquote>
      </section>

      {/* Partners */}
      <section id="partners" className="mx-auto mt-24 max-w-6xl px-4">
        <SectionTitle
          eyebrow="Partnership"
          title="Build the connected health system with MA360"
          subtitle="SamaritanLink is designed to work alongside existing institutions and national digital-health infrastructure."
        />
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {PARTNERS.map((p) => (
            <div key={p.label} className="glass-panel flex flex-col items-center gap-2 px-3 py-5 text-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600/10 text-brand-700">
                <Icon name={p.icon} className="h-5 w-5" />
              </span>
              <span className="text-xs font-medium text-ink-700">{p.label}</span>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <Link href="/login" className="btn-primary">
            Partner With MA360
            <Icon name="ArrowRight" className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer — dark teal band, matching medaccess360.com */}
      <footer className="mt-24 bg-brand-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
            <div className="max-w-sm">
              <Brand variant="full" onDark />
              <p className="mt-4 text-sm leading-relaxed text-white/70">
                MedAccess360 Foundation is a pharmacy-led health-extension organisation bridging the
                gap between patients and existing healthcare providers across Zimbabwe. SamaritanLink
                is its connected digital-health service.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-200">MedAccess360</p>
                <ul className="mt-3 space-y-2 text-sm text-white/80">
                  <li><a href="https://medaccess360.com/about" className="hover:text-white">About</a></li>
                  <li><a href="https://medaccess360.com/our-work" className="hover:text-white">Our Work</a></li>
                  <li><a href="https://medaccess360.com/get-involved" className="hover:text-white">Get Involved</a></li>
                  <li><a href="https://medaccess360.com" className="inline-flex items-center gap-1 hover:text-white">medaccess360.com <Icon name="ExternalLink" className="h-3 w-3" /></a></li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-200">Contact</p>
                <ul className="mt-3 space-y-2 text-sm text-white/80">
                  <li><a href="mailto:contact@medaccess360.com" className="inline-flex items-center gap-1.5 hover:text-white"><Icon name="Mail" className="h-3.5 w-3.5" /> contact@medaccess360.com</a></li>
                  <li><Link href="/login" className="hover:text-white">Access SamaritanLink</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} MedAccess360 Foundation. Established 2025.</p>
            <p>SamaritanLink is a prototype / proof-of-concept. All data shown is synthetic demo data.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
