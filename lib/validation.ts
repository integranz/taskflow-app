// Pure input helpers shared by Server Actions. No Next.js imports so they are unit-testable.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_EMAIL_LENGTH = 254;

export const MIN_PASSWORD_LENGTH = 8;

export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (email.length === 0 || email.length > MAX_EMAIL_LENGTH || !EMAIL.test(email)) return null;
  return email;
}

/** Returns an error message, or null when the password is acceptable. */
export function validatePassword(value: unknown): string | null {
  if (typeof value !== "string" || value.length === 0) return "Password is required.";
  if (value.length < MIN_PASSWORD_LENGTH) return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  return null;
}

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID.test(value);
}

export function requiredText(value: unknown, label: string): { value: string } | { error: string } {
  const text = typeof value === "string" ? value.trim() : "";
  return text ? { value: text } : { error: `${label} is required.` };
}

/** Empty input clears the date (null). Anything else must be YYYY-MM-DD. */
export function normalizeDueDate(value: unknown): { value: string | null } | { error: string } {
  if (value === null || value === undefined) return { value: null };
  if (typeof value !== "string") return { error: "Due date must be a date." };
  const text = value.trim();
  if (text === "") return { value: null };
  if (!DATE.test(text)) return { error: "Due date must be YYYY-MM-DD." };
  return { value: text };
}
