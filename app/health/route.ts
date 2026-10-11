import { connection } from "next/server";

/**
 * Liveness check for container probes: GET /health -> 200 { status: "ok", version }.
 * It checks only this Next.js process, never the backend, so a backend outage does not restart the web container.
 * Public on purpose: proxy.ts lets it through without a session cookie.
 */
export async function GET() {
  // Opt into request time so VERSION is read from the running container, not baked in at build.
  await connection();
  return Response.json(
    { status: "ok", version: process.env.VERSION ?? "0.0.0-local" },
    { headers: { "cache-control": "no-store" } },
  );
}
