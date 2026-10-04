import "server-only";
import { redirect } from "next/navigation";
import type { ActionState } from "./action-state";
import { ApiError } from "./api";

function sentence(message: string): string {
  const trimmed = message.trim();
  if (!trimmed) return "Something went wrong.";
  const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  return /[.!?]$/.test(capitalized) ? capitalized : `${capitalized}.`;
}

export function toActionError(error: unknown): ActionState {
  if (error instanceof ApiError) {
    if (error.status === 503) return { error: "The backend is unreachable. Try again in a moment." };
    return { error: sentence(error.message) };
  }
  return { error: "Something went wrong. Please try again." };
}

export type Attempt<T> = { ok: true; value: T } | { ok: false; status: number | null; state: ActionState };

type AttemptOptions = {
  /** When true (default), a 401 means the stored session is stale and the visitor is sent to /auth/expire. */
  expiredOnUnauthorized?: boolean;
};

/** Runs a backend call inside a Server Action and turns failures into `ActionState` instead of throwing. */
export async function attempt<T>(fn: () => Promise<T>, options: AttemptOptions = {}): Promise<Attempt<T>> {
  try {
    return { ok: true, value: await fn() };
  } catch (error) {
    const status = error instanceof ApiError ? error.status : null;
    if (status === 401 && options.expiredOnUnauthorized !== false) redirect("/auth/expire");
    return { ok: false, status, state: toActionError(error) };
  }
}
