# Deployment

## Local

```bash
npm install
cp .env.example .env
npm run dev            # http://localhost:3000
```

The app runs on the mock-data layer with no database or API key. To run against a database, follow [DATABASE.md](DATABASE.md).

## Production build

```bash
npm run build
npm run start
```

## Deploying to Vercel

SamaritanLink is a standard Next.js app and deploys to Vercel with no custom configuration.

### Via the dashboard

1. Push this repository to GitHub.
2. In Vercel → **Add New… → Project**, import the repository.
3. Framework preset is auto-detected as **Next.js**. Build command `next build`, output handled automatically.
4. Add environment variables (below) and deploy.

### Via the CLI

```bash
npm i -g vercel        # or use: npx vercel
vercel                 # first run links/creates the project (preview)
vercel --prod          # production deployment
```

### Environment variables

Set these in **Vercel → Project → Settings → Environment Variables** (never commit them):

| Variable | Required | Notes |
| --- | --- | --- |
| `SESSION_SECRET` | Yes | Long random string used to sign the session cookie |
| `NEXT_PUBLIC_APP_NAME` | No | Defaults to "MA360 SamaritanLink" |
| `DATABASE_URL` | Only if using a DB | PostgreSQL connection string in production |
| `ANTHROPIC_API_KEY` | No | Enables live Claude navigation; mock content is used when unset |
| `ANTHROPIC_MODEL` | No | e.g. `claude-sonnet-5` |

> The MVP is fully demo-able on Vercel with only `SESSION_SECRET` set — the mock-data layer needs no database.

### Adding a database later

Provision **Vercel Postgres** (or Neon/Supabase), set `DATABASE_URL`, switch the Prisma provider to `postgresql` (see [DATABASE.md](DATABASE.md)), and add a build step:

```jsonc
// package.json — when running against a live DB on Vercel
"scripts": { "build": "prisma generate && prisma migrate deploy && next build" }
```

## Website integration

For the MVP the app is standalone (landing at `/`, application at `/app`). To place it within the MA360 ecosystem later, deploy to a subdomain (`samaritanlink.medaccess360.com`) or reverse-proxy `medaccess360.com/samaritanlink` to this app. The existing medaccess360.com remains the primary organisational site.
