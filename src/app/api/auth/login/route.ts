import { NextResponse } from "next/server";
import { DEMO_USERS } from "@/lib/data/demo";
import { makeSessionValue, sessionCookieName } from "@/lib/session";

export async function POST(request: Request) {
  const { email, password } = await request.json().catch(() => ({ email: "", password: "" }));

  const user = DEMO_USERS.find(
    (u) => u.email.toLowerCase() === String(email).toLowerCase() && u.password === password,
  );

  if (!user) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true, role: user.role });
  res.cookies.set(sessionCookieName(), makeSessionValue(user.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });
  return res;
}
