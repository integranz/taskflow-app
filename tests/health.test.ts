// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

// connection() needs a Next.js request scope; outside one, a no-op stands in for it.
vi.mock("next/server", () => ({ connection: vi.fn(async () => {}) }));

import { GET } from "@/app/health/route";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("GET /health", () => {
  it("returns ok with the running version and is never cached", async () => {
    vi.stubEnv("VERSION", "1.2.3");
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({ status: "ok", version: "1.2.3" });
  });

  it("falls back to a local version when VERSION is unset", async () => {
    vi.stubEnv("VERSION", undefined);
    const response = await GET();
    await expect(response.json()).resolves.toEqual({ status: "ok", version: "0.0.0-local" });
  });
});
