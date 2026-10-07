import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/constants";

/**
 * Clears a stale session cookie and sends the visitor to /login.
 * Server Components cannot delete cookies, so the DAL redirects here when the backend rejects the token.
 * Without this, "has cookie -> /lists" in proxy.ts and "401 -> /login" in the DAL would loop forever.
 */
export function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
