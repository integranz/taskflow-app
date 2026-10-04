// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api, ApiError } from "@/lib/api";

const fetchMock = vi.fn<typeof fetch>();

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

function lastCall(): { url: string; init: RequestInit } {
  const call = fetchMock.mock.calls.at(-1);
  if (!call) throw new Error("fetch was not called");
  return { url: String(call[0]), init: call[1] ?? {} };
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubEnv("TASKFLOW_API_URL", "http://api.test/");
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("api client", () => {
  it("posts credentials to /auth/login as JSON", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ user: { id: "u1", email: "a@example.com", createdAt: "2026-10-04T00:00:00.000Z" }, token: "tok", expiresAt: "2026-11-03T00:00:00.000Z" }),
    );

    const result = await api.login("a@example.com", "password123");

    expect(result.token).toBe("tok");
    const { url, init } = lastCall();
    expect(url).toBe("http://api.test/auth/login");
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({ "content-type": "application/json" });
    expect(init.body).toBe(JSON.stringify({ email: "a@example.com", password: "password123" }));
    expect(init.cache).toBe("no-store");
  });

  it("sends the bearer token on authenticated calls", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ lists: [] }));

    await expect(api.listLists("secret")).resolves.toEqual({ lists: [] });

    const { url, init } = lastCall();
    expect(url).toBe("http://api.test/lists");
    expect(init.method).toBe("GET");
    expect(init.headers).toMatchObject({ authorization: "Bearer secret" });
    expect(init.headers).not.toHaveProperty("content-type");
  });

  it("encodes path parameters", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ list: { id: "x", name: "y" }, tasks: [] }));

    await api.getList("tok", "a b/../c");

    expect(lastCall().url).toBe("http://api.test/lists/a%20b%2F..%2Fc");
  });

  it("resolves to undefined for 204 responses", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));

    await expect(api.deleteTask("tok", "t1")).resolves.toBeUndefined();
    expect(lastCall().init.method).toBe("DELETE");
  });

  it.each([400, 401, 404, 409])("maps a %i error body to ApiError", async (status) => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: `boom ${status}` }, status));

    const promise = api.createList("tok", "Inbox");

    await expect(promise).rejects.toBeInstanceOf(ApiError);
    await expect(promise).rejects.toMatchObject({ status, message: `boom ${status}` });
  });

  it("falls back to the status text when the error body is not JSON", async () => {
    fetchMock.mockResolvedValueOnce(new Response("<html>bad gateway</html>", { status: 502, statusText: "Bad Gateway" }));

    await expect(api.health()).rejects.toMatchObject({ status: 502, message: "Bad Gateway" });
  });

  it("maps a failed connection to a 503 ApiError", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("fetch failed"));

    await expect(api.me("tok")).rejects.toMatchObject({ status: 503, message: "backend unreachable" });
  });

  it("sends a PATCH with the password change payload", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));

    await api.changePassword("tok", "old-password", "new-password");

    const { url, init } = lastCall();
    expect(url).toBe("http://api.test/auth/password");
    expect(init.method).toBe("PATCH");
    expect(init.body).toBe(JSON.stringify({ currentPassword: "old-password", newPassword: "new-password" }));
  });
});
