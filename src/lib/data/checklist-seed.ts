// Verification checklist for the /site QA page. Derived from the three MA360 docs
// (Gap Analysis & Implementation Strategy, Commercial Overview, Equity/Gender
// addendum). Status reflects the doc assessment; the user ticks `checked` once
// they have verified each item exists in the live app.

export interface SeedItem {
  category: string;
  label: string;
  detail?: string;
  link?: string;
  status: "done" | "partial" | "missing" | "todo";
  source: string;
}

export const CHECKLIST_SEED: SeedItem[] = [
  // A. Strategy & Brand
  { category: "A. Strategy & Brand", label: "Connected health-extension positioning + tagline", detail: "Homepage frames the platform as a connected digital-health extension, not telemedicine.", link: "/", status: "done", source: "Impl §2.1" },
  { category: "A. Strategy & Brand", label: "Continuous patient journey mapped", detail: "Need → Screening → Clinical → Diagnostics/Medicines → Referral → Home follow-up.", link: "/", status: "done", source: "Impl §2.2" },
  { category: "A. Strategy & Brand", label: "Brand identity, logo, multi-audience messaging", detail: "MA360 logo, palette, Open Sans; extension of medaccess360.com.", link: "/", status: "done", source: "Impl A" },

  // B. Digital Product (prototype)
  { category: "B. Digital Product", label: "Role-based login + portal", detail: "Patient, CHW, Clinician, Pharmacy, Laboratory, Administrator.", link: "/login", status: "done", source: "Impl §2.6" },
  { category: "B. Digital Product", label: "Ten-service architecture represented", detail: "Navigation, Screening, Telehealth, Diagnostics, Pharmacy, Referral, Home follow-up, ChronicCare, CHW, Health Intelligence.", link: "/", status: "done", source: "Impl §2.3" },
  { category: "B. Digital Product", label: "Real database + production workflows", detail: "Neon Postgres; DB-backed auth (bcrypt); server-persisted workflows.", link: "/app", status: "done", source: "Impl B" },
  { category: "B. Digital Product", label: "SamaritanLink Patient ID + longitudinal profile", detail: "SL-P-YYYY-NNNNNN, searchable; role-based profile.", link: "/app/patients", status: "done", source: "Actor: Patient" },
  { category: "B. Digital Product", label: "Provider IDs + role dashboards", detail: "SL-DR/PH/LAB/CHW/NUR; per-role dashboards.", link: "/app", status: "done", source: "Actor workflows" },
  { category: "B. Digital Product", label: "My Care Journey timeline", detail: "Signature connected-care timeline, patient + clinical views.", link: "/app/journey", status: "done", source: "Actor: Patient" },
  { category: "B. Digital Product", label: "Prescription → Pharmacy workflow", detail: "Issue → Received → Preparing → Ready → Collected + notifications.", link: "/app/pharmacy", status: "done", source: "Actor: Pharmacy" },
  { category: "B. Digital Product", label: "Lab request → results workflow", detail: "Requested → Sample → Processing → Results → Sent to doctor.", link: "/app", status: "done", source: "Actor: Laboratory" },
  { category: "B. Digital Product", label: "Appointments + follow-up reminders", detail: "Schedule review; missed → follow-up task.", link: "/app", status: "done", source: "Actor: Clinician" },
  { category: "B. Digital Product", label: "AI Health Navigator (LLM brain)", detail: "Cloudflare Workers AI Llama; safety-scoped, not a doctor.", link: "/app/navigator", status: "done", source: "Prototype demos" },
  { category: "B. Digital Product", label: "Healthcare Services & Provider Directory", detail: "Categories, search, provider IDs, care pathways.", link: "/app/directory", status: "done", source: "Provider network" },

  // C. Mobile & multi-channel
  { category: "C. Mobile & Multi-channel", label: "Mobile-first responsive UI", detail: "Verified on mobile widths.", link: "/", status: "done", source: "Impl C" },
  { category: "C. Mobile & Multi-channel", label: "USSD / SMS / WhatsApp / Voice gateway", detail: "Not yet integrated (needs telecom/provider credentials).", status: "missing", source: "Impl C" },
  { category: "C. Mobile & Multi-channel", label: "Offline-first CHW application", detail: "Not demonstrated publicly.", status: "missing", source: "Impl gap" },
  { category: "C. Mobile & Multi-channel", label: "Zero-rated data + mobile auth", detail: "Pending telecom partnership.", status: "missing", source: "Impl C" },

  // D. Telecom
  { category: "D. Telecom Integration", label: "USSD/SMS user journeys + business case", detail: "Not started.", status: "missing", source: "Impl D" },
  { category: "D. Telecom Integration", label: "Econet / NetOne / Telecel pilot MOUs", detail: "Engagement not initiated.", status: "missing", source: "Impl D" },

  // E. Provider network
  { category: "E. Provider Network", label: "Pharmacy module (e-prescriptions, refills)", detail: "Interactive prescription workflow live.", link: "/app/pharmacy", status: "done", source: "Impl E" },
  { category: "E. Provider Network", label: "Laboratory module (orders, digital results)", detail: "Interactive lab workflow live.", link: "/app", status: "done", source: "Impl E" },
  { category: "E. Provider Network", label: "Clinician module (consults, notes, referrals)", detail: "Prototype clinical actions from patient profile.", link: "/app/patients", status: "partial", source: "Impl E" },
  { category: "E. Provider Network", label: "Provider onboarding SOPs + agreement templates", detail: "Not built (operational documents).", status: "missing", source: "Impl E" },

  // F. Community & CHW
  { category: "F. Community & CHW", label: "CHW dashboard + prioritised tasks", detail: "Smart tasks, home visits, referrals.", link: "/app", status: "done", source: "Impl F" },
  { category: "F. Community & CHW", label: "Home follow-up + escalation", detail: "Record outcome, escalate to clinician.", link: "/app", status: "done", source: "Impl F" },
  { category: "F. Community & CHW", label: "Offline risk-assessment app + supervisor remuneration", detail: "Not built.", status: "missing", source: "Impl F" },

  // G. Clinical governance / data / security
  { category: "G. Governance & Security", label: "Security headers + edge auth guard", detail: "CSP-style headers; /app protected at the edge.", link: "/app", status: "done", source: "Impl G" },
  { category: "G. Governance & Security", label: "Audit logs + consent + encryption framework", detail: "Audit model exists; consent/encryption policy not operationalised.", status: "partial", source: "Impl G" },
  { category: "G. Governance & Security", label: "Clinical Governance Committee + Medical Director", detail: "Organisational, not built in app.", status: "missing", source: "Impl G" },
  { category: "G. Governance & Security", label: "Zimbabwe data-protection compliance", detail: "Needs formal DPIA + legal review.", status: "missing", source: "Impl G" },

  // H. Government
  { category: "H. Government Alignment", label: "MoHCC briefing + concept submission", detail: "Not prepared.", status: "missing", source: "Impl H" },
  { category: "H. Government Alignment", label: "Impilo interoperability roadmap (FHIR)", detail: "Not demonstrated.", status: "missing", source: "Impl H" },

  // I. Commercial
  { category: "I. Commercial Model", label: "For-Organisations commercial layer on site", detail: "3 user groups + 5 revenue categories + philosophy.", link: "/#organisations", status: "done", source: "Commercial Overview" },
  { category: "I. Commercial Model", label: "Provider subscription engine", detail: "Presented; billing not implemented.", status: "partial", source: "Commercial Overview" },
  { category: "I. Commercial Model", label: "Corporate / medical-aid / sponsored programme flows", detail: "Presented conceptually; enrolment not built.", status: "partial", source: "Commercial Overview" },
  { category: "I. Commercial Model", label: "Financial model (unit economics, CAC, 3-yr P&L)", detail: "Not built.", status: "missing", source: "Impl I" },

  // J. Pilot
  { category: "J. Pilot & Evaluation", label: "Pilot geography, cohort, baseline metrics", detail: "Not selected.", status: "missing", source: "Impl J" },
  { category: "J. Pilot & Evaluation", label: "Impact / M&E dashboard", detail: "Live M&E: care-continuum funnel, completion rates, equity breakdown (admin).", link: "/app/intelligence", status: "done", source: "Impl J" },

  // K. Health Access Equity (equity addendum)
  { category: "K. Health Access Equity", label: "Equity cross-cutting layer on landing", detail: "Band across the journey + retained phrase.", link: "/#equity", status: "done", source: "Equity §8" },
  { category: "K. Health Access Equity", label: "Patient Access Barrier Assessment", detail: "In Health Navigator: identify barrier → response → reconnect → monitor.", link: "/app/navigator", status: "done", source: "Equity §3" },
  { category: "K. Health Access Equity", label: "Referral continuity chain + dropout analysis", detail: "Created → Received → Attended → Treatment → Follow-up; dropout barriers.", link: "/app/referrals", status: "done", source: "Equity §4" },
  { category: "K. Health Access Equity", label: "Home follow-up priority populations + barrier framing", detail: "Priority population cards; barrier-reduction framing.", link: "/#equity", status: "done", source: "Equity §5" },
  { category: "K. Health Access Equity", label: "Health Intelligence equity lens (who enters/completes)", detail: "Equity questions + gender as an analytical dimension.", link: "/app", status: "done", source: "Equity §6" },

  // L. Gender-responsive use cases
  { category: "L. Gender-Responsive Use Cases", label: "Five gender-responsive use cases on site", detail: "Maternal/postnatal, men's preventive, adolescent/confidential, chronic continuity, caregiver support.", link: "/#usecases", status: "done", source: "Equity §7" },
];
