import { api, ApiError } from "@/lib/api";
import type { Health } from "@/lib/types";

type HealthResult = { ok: true; health: Health } | { ok: false; detail: string };

async function loadHealth(): Promise<HealthResult> {
  try {
    return { ok: true, health: await api.health() };
  } catch (error) {
    return { ok: false, detail: error instanceof ApiError ? error.message : "unknown error" };
  }
}

/** Covers GET /health: shows the backend's reported status and version. */
export async function BackendStatus() {
  const result = await loadHealth();

  if (!result.ok) {
    return <p className="text-sm text-red-600 dark:text-red-400">API unreachable ({result.detail}).</p>;
  }

  return (
    <p className="text-sm text-zinc-600 dark:text-zinc-400">
      API status <span className="font-medium text-zinc-900 dark:text-zinc-100">{result.health.status}</span>, version{" "}
      <span className="font-mono">{result.health.version}</span>
    </p>
  );
}
