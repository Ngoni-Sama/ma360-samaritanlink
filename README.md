# MA360 SamaritanLink

**Care That Crosses the Distance.**

A connected digital-health **extension platform** for the **MedAccess360 Foundation (MA360)**. SamaritanLink links people to health navigation, screening, clinical care, diagnostics, medicines, referrals and continuous follow-up — connecting the patient journey:

> Community → Navigation → Screening → Diagnostics → Clinical Care → Pharmacy → Referral → Home Follow-up → Continuous Care

This repository is a **lean MVP / proof-of-concept**, built to demonstrate the concept to leadership, partners, government, technology partners, healthcare providers and funders. It is **not** a production national health system, and it is **not** a generic telemedicine app. SamaritanLink is a *connection and health-extension layer* that works alongside existing hospitals, clinics, pharmacies, laboratories, clinicians and national digital-health infrastructure — not a replacement for them.

> **All data in this prototype is synthetic demo data. No real patient information is used.**

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 14 (App Router) + TypeScript |
| UI | React 18, Tailwind CSS, restrained Glassmorphism design system |
| Icons | Lucide React (professional line icons — **no emojis anywhere**) |
| Data (MVP) | Typed mock-data layer (`src/lib/data`) — runs with zero DB setup |
| Data (production) | Prisma ORM → PostgreSQL (schema + seed included) |
| Auth | Signed-cookie demo session with role-based access control |
| AI | Server-side Anthropic/Claude integration point (mock content in MVP) |

## Quick start

```bash
npm install
cp .env.example .env      # then edit values
npm run dev               # http://localhost:3000
```

The app runs immediately on the mock-data layer — **no database or API key required** to demo it.

### Demo accounts

Every account uses the password **`demo1234`**.

| Role | Email |
| --- | --- |
| Patient | `patient@demo.samaritanlink` |
| Community Health Worker | `chw@demo.samaritanlink` |
| Healthcare Professional | `clinician@demo.samaritanlink` |
| Pharmacy | `pharmacy@demo.samaritanlink` |
| Administrator | `admin@demo.samaritanlink` |

## What's included

- **Public landing page** — hero, the problem, the connected solution, ten connected services, why SamaritanLink, Built for Zimbabwe, partnership section.
- **Role-based app** — Patient, Community Health Worker, Healthcare Professional, Pharmacy and Administrator dashboards.
- **Modules** — Health Navigator (AI navigation assistant), Community Screening, Diagnostics, Pharmacy Connect, Referral Tracker.
- **Database** — full Prisma schema (`prisma/schema.prisma`) and reset-able seed (`prisma/seed.ts`), PostgreSQL-ready.

## Optional: run against a database

```bash
# .env → DATABASE_URL="file:./dev.db"   (local SQLite)
npm run db:generate
npm run db:migrate
npm run db:seed          # npm run db:reset to wipe + reseed
```

See [DATABASE.md](DATABASE.md) for the PostgreSQL migration path.

## Documentation

- [PROJECT_BRIEF.md](PROJECT_BRIEF.md) — objective, positioning, scope
- [ARCHITECTURE.md](ARCHITECTURE.md) — structure and extension points
- [DATABASE.md](DATABASE.md) — schema and SQLite → PostgreSQL migration
- [DEPLOYMENT.md](DEPLOYMENT.md) — local + Vercel deployment
- [SECURITY.md](SECURITY.md) — data handling, auth, and hardening roadmap

## Safety & scope

The **AI Health Navigation Assistant** provides general information and navigation only. It does **not** diagnose, prescribe, make emergency decisions, or replace doctors and nurses. Clinical workflows in this MVP are clearly labelled prototypes and do not perform real prescribing or clinical decision-making.

---

*A digital-health service of MedAccess360 Foundation · [medaccess360.com](https://medaccess360.com)*
