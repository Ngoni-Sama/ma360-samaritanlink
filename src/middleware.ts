import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Edge guard: if there is no session cookie, bounce /app/* to /login before the
// page renders. The signed-cookie is fully verified server-side in the app
// layout (getCurrentUser); this is defense-in-depth, not the sole check.
const COOKIE = "sl_session";

export function middleware(request: NextRequest) {
  const hasSession = Boolean(request.cookies.get(COOKIE)?.value);
  if (!hasSession) {
    const url = new URL("/login", request.url);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*"],
};
