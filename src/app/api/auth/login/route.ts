import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { makeSessionValue, sessionCookieName } from "@/lib/session";

export async function POST(request: Request) {
  const { email, password } = await request.json().catch(() => ({ email: "", password: "" }));

  const user = await db.user.findUnique({ where: { email: String(email).toLowerCase() } });
  const ok = user && (await bcrypt.compare(String(password), user.passwordHash));

  if (!user || !ok) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true, role: user.role });
  res.cookies.set(sessionCookieName(), makeSessionValue(user.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return res;
}
