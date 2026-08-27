// Lightweight signed-cookie session for the MVP demo.
//
// This is intentionally minimal: an HMAC-signed cookie carrying the demo user id.
// It demonstrates protected routes + RBAC without a database. The production
// system should replace this with a hardened session/JWT + hashed credentials
// (see SECURITY.md).

import crypto from "crypto";
import { cookies } from "next/headers";
import { DEMO_USERS } from "./data/demo";
import type { DemoUser } from "./data/types";

const COOKIE = "sl_session";
const SECRET = process.env.SESSION_SECRET || "dev-insecure-secret-change-me";

function sign(value: string): string {
  const mac = crypto.createHmac("sha256", SECRET).update(value).digest("base64url");
  return `${value}.${mac}`;
}

function verify(signed: string | undefined): string | null {
  if (!signed) return null;
  const idx = signed.lastIndexOf(".");
  if (idx < 0) return null;
  const value = signed.slice(0, idx);
  const mac = signed.slice(idx + 1);
  const expected = crypto.createHmac("sha256", SECRET).update(value).digest("base64url");
  // constant-time comparison
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return value;
}

export function sessionCookieName() {
  return COOKIE;
}

export function makeSessionValue(userId: string): string {
  return sign(userId);
}

export function getCurrentUser(): DemoUser | null {
  const raw = cookies().get(COOKIE)?.value;
  const userId = verify(raw);
  if (!userId) return null;
  return DEMO_USERS.find((u) => u.id === userId) ?? null;
}
