// Signed-cookie session, now backed by the database.
// The cookie carries the DB user id (HMAC-signed); getCurrentUser resolves it
// against the users table. Credentials are verified with bcrypt at login.

import crypto from "crypto";
import { cookies } from "next/headers";
import { db } from "./db";

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

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  providerId: string | null;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const raw = cookies().get(COOKIE)?.value;
  const userId = verify(raw);
  if (!userId) return null;
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, providerId: true },
  });
  return user ?? null;
}
