import "server-only";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { api, ApiError } from "./api";
import { getSessionToken } from "./session";
import type { User } from "./types";

/** Returns the session token or sends the visitor to /login. Memoized per request. */
export const verifySession = cache(async (): Promise<string> => {
  const token = await getSessionToken();
  if (!token) redirect("/login");
  return token;
});

/** The signed-in user, or null when there is no cookie or the backend rejects it. */
export const getOptionalUser = cache(async (): Promise<User | null> => {
  const token = await getSessionToken();
  if (!token) return null;
  try {
    return (await api.me(token)).user;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
});

/** The signed-in user. A missing cookie goes to /login; a stale cookie is cleared via /auth/expire first. */
export const getCurrentUser = cache(async (): Promise<User> => {
  const token = await getSessionToken();
  if (!token) redirect("/login");
  const user = await getOptionalUser();
  if (!user) redirect("/auth/expire");
  return user;
});

/** Runs an authenticated backend call during render. 401 clears the stale cookie, 404 renders not-found, anything else reaches error.tsx. */
export async function apiCall<T>(fn: (token: string) => Promise<T>): Promise<T> {
  const token = await verifySession();
  try {
    return await fn(token);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) redirect("/auth/expire");
      if (error.status === 404) notFound();
    }
    throw error;
  }
}
