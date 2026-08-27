# Security

Even as an MVP, SamaritanLink treats health data as sensitive. This document records what the prototype implements and what must be hardened before any real-world pilot.

## Golden rule

> **Only synthetic / demo data is used. No real patient information is stored in this repository or its development database.**

## Implemented in the MVP

- **Environment variables** for all secrets; `.env` is git-ignored and never committed. `.env.example` documents required variables with placeholders only.
- **Server-side secrets** — the Anthropic key and session secret are read only on the server; no secret is exposed to client code.
- **Protected routes** — the entire `/app` area is guarded by `getCurrentUser()`; unauthenticated users are redirected to `/login`.
- **Role-based access control** — navigation and dashboards are scoped per role.
- **Session integrity** — the session cookie is `httpOnly`, `sameSite=lax`, `secure` in production, and **HMAC-signed** with `SESSION_SECRET`; signatures are verified in constant time.
- **AI containment** — the AI Health Navigator runs server-side and is scoped to navigation/information; it cannot diagnose, prescribe, or make clinical decisions.
- **No emojis / professional UI** — reduces spoofing-style ambiguity and keeps the clinical presentation consistent.

## Required before a real pilot

| Area | MVP state | Production requirement |
| --- | --- | --- |
| Credentials | Demo password check; seed uses a simple HMAC hash | Vetted hashing (argon2/bcrypt), password policy, lockout |
| Sessions | Signed cookie carrying user id | Rotating JWT/opaque sessions, revocation, short TTLs |
| Identity | Email/password | Phone/OTP, OAuth, stronger identity verification |
| Authorization | Route + role checks | Per-record authorization, least privilege, field-level control |
| Audit | `AuditLog` model present | Wire every mutation to the audit trail; tamper-evident storage |
| Input validation | Basic parsing | Schema validation (e.g. Zod) on every API boundary |
| Rate limiting | Not enforced | Rate limit auth + AI endpoints (edge middleware / gateway) |
| Data protection | Demo data only | Encryption at rest/in transit, data residency, retention policy |
| Compliance | Out of scope for MVP | Align with applicable health-data regulation before real data |

## Reporting

This is a prototype repository. Do not load real patient data. For security questions about the concept, contact the MA360 team via [medaccess360.com](https://medaccess360.com).
