import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/constants";

const PUBLIC_PATHS = new Set(["/login", "/register"]);

/**
 * Optimistic routing only: it looks at cookie presence, never at the backend.
 * Real authorization happens in lib/dal.ts and inside every Server Action.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);

  // /auth/expire must stay reachable with a (stale) cookie, or the loop breaker cannot run.
  if (pathname.startsWith("/auth/")) return NextResponse.next();

  if (PUBLIC_PATHS.has(pathname)) {
    return hasSession ? NextResponse.redirect(new URL("/lists", request.url)) : NextResponse.next();
  }

  if (!hasSession) return NextResponse.redirect(new URL("/login", request.url));

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg$).*)"],
};
