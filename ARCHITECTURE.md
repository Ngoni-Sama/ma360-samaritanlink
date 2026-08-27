# Architecture

## Overview

MA360 SamaritanLink is a Next.js 14 (App Router) application in TypeScript. It is intentionally structured so the **presentation layer is decoupled from the data source**: the MVP reads from a typed mock-data layer, and the same shapes are backed by Prisma/PostgreSQL for production.

```
Browser
  │
  ├─ Public site        src/app/page.tsx            (landing)
  ├─ Auth               src/app/login + /api/auth/* (signed-cookie session)
  └─ Application        src/app/app/**              (role-based, guarded)
        │
        ├─ UI system     src/components/ui          (glass primitives, Icon)
        ├─ App shell     src/components/app         (nav, dashboards, headers)
        ├─ Data layer    src/lib/data               (types + demo data)   ← swap point
        └─ API routes    src/app/api/**             (auth, navigator)
```

## Directory map

| Path | Responsibility |
| --- | --- |
| `src/app/page.tsx` | Public landing page (all marketing sections) |
| `src/app/login/` | Demo login screen |
| `src/app/app/` | Authenticated, role-based application + module pages |
| `src/app/api/auth/` | Login / logout route handlers |
| `src/app/api/navigator/` | AI Health Navigator endpoint (mock today, Claude-ready) |
| `src/components/ui/` | Glass design primitives + `Icon` (Lucide wrapper) |
| `src/components/app/` | `AppShell`, `PageHeader`, role dashboards |
| `src/components/landing/` | Landing navigation |
| `src/lib/session.ts` | Signed-cookie session + `getCurrentUser()` |
| `src/lib/data/` | Domain `types.ts` + synthetic `demo.ts` (the swap point) |
| `prisma/` | `schema.prisma` + `seed.ts` |

## Key decisions

**Data abstraction (the swap point).** Every dashboard imports typed data from `src/lib/data`. The MVP serves synthetic data so it deploys and demos with zero infrastructure. To go live, replace the imports in `src/lib/data` with Prisma queries returning the same types — no UI changes required.

**Role-based access.** A single application serves five roles via `getCurrentUser()` and per-role navigation/dashboards (`src/components/app/AppShell.tsx`, `dashboards.tsx`). Roles are extensible without splitting the app.

**AI isolation.** All AI runs server-side behind `src/app/api/navigator`. This is the single place to introduce a real Claude call (guarded by `ANTHROPIC_API_KEY`). The assistant is scoped to navigation/information — clinical decision-making is never delegated to it.

**Design system.** Glassmorphism is expressed through a small set of CSS component classes (`.glass`, `.glass-panel`, `.btn-*`, `.pill`) in `globals.css` plus a Tailwind theme (`brand`/`ink` palettes). Icons are centralised in one `Icon` component so the "no emoji" rule is enforced in one place.

## Extension points

| Future capability | Where it plugs in |
| --- | --- |
| Live database | `src/lib/data` → Prisma client; set `provider = "postgresql"` |
| Real Claude AI | `src/app/api/navigator/route.ts` (add SDK call when key present) |
| Telehealth video | Consultation flow → approved video provider SDK |
| Pharmacy/lab integrations | `MedicineInventory` / `DiagnosticRequest` data access |
| Stronger auth | `src/lib/session.ts` → JWT/OAuth/OTP; hashed credentials |
| Audit trail | `AuditLog` model (schema present) wired into mutations |

## Rendering

Server Components read the session and render role dashboards; interactive pieces (login, navigator, nav toggles) are Client Components. This keeps secrets and session logic on the server and ships minimal client JavaScript.
