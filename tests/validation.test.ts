import { describe, expect, it } from "vitest";
import { isUuid, normalizeDueDate, normalizeEmail, requiredText, validatePassword } from "@/lib/validation";

describe("normalizeEmail", () => {
  it("trims and lowercases", () => {
    expect(normalizeEmail("  Ada@Example.COM ")).toBe("ada@example.com");
  });

  it("rejects non-emails and non-strings", () => {
    expect(normalizeEmail("ada")).toBeNull();
    expect(normalizeEmail("ada@")).toBeNull();
    expect(normalizeEmail("")).toBeNull();
    expect(normalizeEmail(null)).toBeNull();
    expect(normalizeEmail(`${"a".repeat(250)}@example.com`)).toBeNull();
  });
});

describe("validatePassword", () => {
  it("requires at least 8 characters", () => {
    expect(validatePassword("")).toBe("Password is required.");
    expect(validatePassword("short")).toBe("Password must be at least 8 characters.");
    expect(validatePassword("long enough")).toBeNull();
    expect(validatePassword(42)).toBe("Password is required.");
  });
});

describe("isUuid", () => {
  it("accepts canonical UUIDs only", () => {
    expect(isUuid("11111111-2222-3333-4444-555555555555")).toBe(true);
    expect(isUuid("ABCDEF01-2345-6789-ABCD-EF0123456789")).toBe(true);
    expect(isUuid("abc")).toBe(false);
    expect(isUuid(null)).toBe(false);
  });
});

describe("requiredText", () => {
  it("trims and reports missing values", () => {
    expect(requiredText("  Inbox ", "List name")).toEqual({ value: "Inbox" });
    expect(requiredText("   ", "List name")).toEqual({ error: "List name is required." });
    expect(requiredText(null, "Task title")).toEqual({ error: "Task title is required." });
  });
});

describe("normalizeDueDate", () => {
  it("treats empty input as no date", () => {
    expect(normalizeDueDate("")).toEqual({ value: null });
    expect(normalizeDueDate("   ")).toEqual({ value: null });
    expect(normalizeDueDate(null)).toEqual({ value: null });
    expect(normalizeDueDate(undefined)).toEqual({ value: null });
  });

  it("accepts YYYY-MM-DD and rejects anything else", () => {
    expect(normalizeDueDate("2026-10-04")).toEqual({ value: "2026-10-04" });
    expect(normalizeDueDate("tomorrow")).toEqual({ error: "Due date must be YYYY-MM-DD." });
    expect(normalizeDueDate(123)).toEqual({ error: "Due date must be a date." });
  });
});
