import { NextResponse } from "next/server";
import { sessionCookieName } from "@/lib/session";

// Clear the session and send the browser to /login. Must use 303 (See Other):
// a default redirect (307) preserves the POST method, so the browser would
// re-POST to /login — a GET-only page — and get HTTP 405.
function logout(request: Request) {
  const res = NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  res.cookies.set(sessionCookieName(), "", { path: "/", maxAge: 0 });
  return res;
}

export async function POST(request: Request) {
  return logout(request);
}

// Allow GET too, so a plain link/navigation to /api/auth/logout also works.
export async function GET(request: Request) {
  return logout(request);
}
