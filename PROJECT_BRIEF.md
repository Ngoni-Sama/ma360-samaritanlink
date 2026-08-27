# MA360 SamaritanLink — Project Brief

## Objective

Develop an initial working MVP / prototype of **MA360 SamaritanLink**, a connected digital-health extension platform that will eventually become an integrated digital-health service of the MedAccess360 Foundation.

The MVP must demonstrate the connected patient journey convincingly enough for MA360 to present the concept to leadership, partners, government, technology partners, healthcare providers and funders, and to support investment/grant conversations.

MA360 does **not** currently have dedicated funding for the full platform. This phase is therefore a **lean MVP / proof-of-concept**, not a production-grade national healthcare system. The goal is the *smallest credible system* that demonstrates the core value proposition while keeping the architecture extensible.

## Positioning

SamaritanLink is **not** a replacement for government health systems, hospitals, clinics, pharmacies, doctors, nurses, laboratories, or existing national digital-health infrastructure. It is a **connection and health-extension layer** that helps patients navigate and remain connected to appropriate healthcare services.

The central product question:

> How can MA360 help a patient move from identifying a health need to accessing appropriate care, medicines, referrals and follow-up?

## The connected journey

```
Community → Navigation → Screening → Diagnostics → Clinical Care
          → Pharmacy → Referral → Home Follow-up → Continuous Care
```

## Brand & design direction

The interface presents as a serious, professional digital-health platform communicating trust, healthcare, accessibility, professionalism, human-centred technology, African relevance and institutional credibility. It deliberately avoids the look of a generic startup landing page, crypto dashboard, gaming interface, generic chatbot or children's app.

Design system: a **restrained Glassmorphism** approach — glass cards, subtle transparency, soft borders, layered surfaces, restrained shadows, pill-shaped elements, clean spacing, modern typography and strong information hierarchy. Readability and accessibility come first. **Professional icons only (Lucide) — no emojis anywhere.**

## Scope in this MVP

**Included**
- Public SamaritanLink landing page (extension of medaccess360.com, served at `/`).
- Role-based application: Patient, Community Health Worker, Healthcare Professional, Pharmacy, Administrator.
- Modules: Health Navigator (AI navigation assistant), Community Screening, Diagnostics, Pharmacy Connect, Referral Tracker; dashboard panels for Home Follow-up and ChronicCare.
- Demo authentication with role-based access control.
- Full relational schema (PostgreSQL-ready) with seed/reset.

**Deliberately deferred (architected for, not built)**
- Real video/telehealth infrastructure (placeholder consultation flow).
- Live pharmacy/lab inventory integrations (mock inventory).
- Live Claude API calls (single server-side integration point, mock content today).
- Production identity verification (phone/OTP/OAuth), real prescribing, production clinical decisioning.

## AI boundaries

The system is architected so Claude/Anthropic can eventually support selected **non-clinical** functions (navigation, information gathering, appointment assistance, health education, multilingual communication, summarising for professionals, follow-up reminders). AI is **never** presented as an autonomous doctor. It must not diagnose, prescribe, make emergency decisions, or replace clinicians. A clear architectural separation is maintained between **AI assistance** and **clinical decision-making**.

## Website integration

The existing **medaccess360.com** remains the primary organisational website. SamaritanLink is the digital-health platform within the MA360 ecosystem. For the MVP it runs as a standalone Next.js app (landing at `/`, application under `/app`), designed to move later to `medaccess360.com/samaritanlink` or `samaritanlink.medaccess360.com`.
