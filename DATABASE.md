# Database

The full relational schema lives in [`prisma/schema.prisma`](prisma/schema.prisma). It is designed for **PostgreSQL in production** and runs on **SQLite for local development**. Core healthcare entities are modelled relationally; JSON is used only where genuinely appropriate (e.g. screening `measurements`).

## Entity overview

| Model | Purpose |
| --- | --- |
| `User` | Identity + role (patient, health_worker, professional, pharmacy, admin) |
| `Patient` / `HealthWorker` / `Professional` | Role profiles linked 1:1 to `User` |
| `Screening` | Community screening records with measurements + status |
| `Consultation` | Telehealth / clinical consultations |
| `Prescription` / `Medication` | Prescriptions and their line items |
| `Pharmacy` / `MedicineInventory` | Participating pharmacies and stock |
| `Referral` | Referral lifecycle across facilities |
| `DiagnosticRequest` | Lab test requests and results |
| `HomeVisit` | Community health worker home follow-up |
| `Followup` | Scheduled follow-ups (appointment, refill, diagnostic, home visit) |
| `AuditLog` | Action audit trail |

## Local development (SQLite)

```bash
# .env
DATABASE_URL="file:./dev.db"

npm run db:generate     # prisma generate
npm run db:migrate      # create + apply migration
npm run db:seed         # load synthetic demo data
npm run db:reset        # wipe + re-migrate + reseed
```

Seeded accounts all use the password **`demo1234`** (see `prisma/seed.ts`).

## Production migration (PostgreSQL)

1. In `prisma/schema.prisma`, set the datasource provider:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Point `DATABASE_URL` at your Postgres instance (Vercel Postgres, Neon, Supabase, RDS…):
   ```
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require"
   ```
3. Create and apply the migration:
   ```bash
   npx prisma migrate deploy      # in CI/production
   # or, during development:
   npx prisma migrate dev --name init
   ```

### Enums

For SQLite portability the schema stores enum-like fields (`role`, `status`, …) as `String`. On PostgreSQL you may promote these to native Prisma `enum` types for stricter integrity. The allowed values are documented inline in `schema.prisma`.

## Data-layer note

The MVP UI reads synthetic data from `src/lib/data/demo.ts` so it can be demonstrated without a database. `prisma/seed.ts` mirrors the same records into the database for teams running against live Postgres/SQLite. When you connect the UI to the database, keep both in sync (or delete `demo.ts` once the Prisma-backed data access is in place).
