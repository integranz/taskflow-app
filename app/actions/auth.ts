"use server";

import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/action-state";
import { api } from "@/lib/api";
import { verifySession } from "@/lib/dal";
import { attempt } from "@/lib/errors";
import { clearSessionCookie, getSessionToken, setSessionCookie } from "@/lib/session";
import { normalizeEmail, validatePassword } from "@/lib/validation";

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const rawEmail = formData.get("email");
  const values = { email: typeof rawEmail === "string" ? rawEmail : "" };
  const email = normalizeEmail(rawEmail);
  if (!email) return { error: "Enter a valid email address.", values };
  const password = formData.get("password");
  if (typeof password !== "string" || password.length === 0) return { error: "Password is required.", values };

  const result = await attempt(() => api.login(email, password), { expiredOnUnauthorized: false });
  if (!result.ok) {
    if (result.status === 401) return { error: "Email or password is incorrect.", values };
    return { ...result.state, values };
  }

  await setSessionCookie(result.value.token, new Date(result.value.expiresAt));
  redirect("/lists");
}

export async function register(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const rawEmail = formData.get("email");
  const values = { email: typeof rawEmail === "string" ? rawEmail : "" };
  const email = normalizeEmail(rawEmail);
  if (!email) return { error: "Enter a valid email address.", values };
  const password = formData.get("password");
  if (typeof password !== "string") return { error: "Password is required.", values };
  const problem = validatePassword(password);
  if (problem) return { error: problem, values };
  if (formData.get("confirmPassword") !== password) return { error: "Passwords do not match.", values };

  const result = await attempt(() => api.register(email, password), { expiredOnUnauthorized: false });
  if (!result.ok) return { ...result.state, values };

  await setSessionCookie(result.value.token, new Date(result.value.expiresAt));
  redirect("/lists");
}

export async function logout(): Promise<void> {
  const token = await getSessionToken();
  if (token) {
    try {
      await api.logout(token);
    } catch {
      // The cookie is cleared regardless; a stale backend session expires on its own.
    }
  }
  await clearSessionCookie();
  redirect("/login");
}

export async function changePassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const token = await verifySession();
  const currentPassword = formData.get("currentPassword");
  if (typeof currentPassword !== "string" || currentPassword.length === 0) {
    return { error: "Current password is required." };
  }
  const newPassword = formData.get("newPassword");
  if (typeof newPassword !== "string") return { error: "New password is required." };
  const problem = validatePassword(newPassword);
  if (problem) return { error: problem.replace("Password", "New password") };
  if (formData.get("confirmPassword") !== newPassword) return { error: "New passwords do not match." };

  const result = await attempt(() => api.changePassword(token, currentPassword, newPassword));
  if (!result.ok) return result.state;
  return { ok: true };
}
