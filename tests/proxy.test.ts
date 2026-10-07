// @vitest-environment node
import { getRedirectUrl, unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { config, proxy } from "@/proxy";

const ORIGIN = "http://localhost:3001";
const SESSION = "tf_session=abc";

function request(path: string, cookie?: string): NextRequest {
  return new NextRequest(`${ORIGIN}${path}`, { headers: cookie ? { cookie } : {} });
}

describe("proxy matcher", () => {
  it("skips static assets and runs on pages", () => {
    expect(unstable_doesMiddlewareMatch({ config, url: "/_next/static/chunk.js" })).toBe(false);
    expect(unstable_doesMiddlewareMatch({ config, url: "/_next/image?url=x" })).toBe(false);
    expect(unstable_doesMiddlewareMatch({ config, url: "/favicon.ico" })).toBe(false);
    expect(unstable_doesMiddlewareMatch({ config, url: "/lists" })).toBe(true);
    expect(unstable_doesMiddlewareMatch({ config, url: "/" })).toBe(true);
  });
});

describe("proxy", () => {
  it("sends anonymous visitors to /login", () => {
    expect(getRedirectUrl(proxy(request("/lists")))).toBe(`${ORIGIN}/login`);
    expect(getRedirectUrl(proxy(request("/account")))).toBe(`${ORIGIN}/login`);
    expect(getRedirectUrl(proxy(request("/")))).toBe(`${ORIGIN}/login`);
  });

  it("lets visitors with a session cookie through", () => {
    expect(getRedirectUrl(proxy(request("/lists", SESSION)))).toBeNull();
    expect(getRedirectUrl(proxy(request("/lists/abc", SESSION)))).toBeNull();
  });

  it("keeps the auth pages open to anonymous visitors", () => {
    expect(getRedirectUrl(proxy(request("/login")))).toBeNull();
    expect(getRedirectUrl(proxy(request("/register")))).toBeNull();
  });

  it("sends signed-in visitors away from the auth pages", () => {
    expect(getRedirectUrl(proxy(request("/login", SESSION)))).toBe(`${ORIGIN}/lists`);
    expect(getRedirectUrl(proxy(request("/register", SESSION)))).toBe(`${ORIGIN}/lists`);
  });

  it("never blocks the cookie-clearing route", () => {
    expect(getRedirectUrl(proxy(request("/auth/expire")))).toBeNull();
    expect(getRedirectUrl(proxy(request("/auth/expire", SESSION)))).toBeNull();
  });
});
