import { describe, expect, it } from "vitest";
import { formatCalendarDate, isOverdue, todayIso } from "@/lib/dates";

describe("dates", () => {
  it("formats calendar dates without time-zone drift", () => {
    expect(formatCalendarDate("2026-10-04")).toBe("Oct 4, 2026");
    expect(formatCalendarDate("2026-01-01")).toBe("Jan 1, 2026");
    expect(formatCalendarDate("not-a-date")).toBe("not-a-date");
  });

  it("builds today's date from local time", () => {
    expect(todayIso(new Date(2026, 9, 4, 23, 59))).toBe("2026-10-04");
    expect(todayIso(new Date(2026, 0, 9))).toBe("2026-01-09");
  });

  it("flags only undone tasks with a past due date", () => {
    expect(isOverdue("2026-10-03", false, "2026-10-04")).toBe(true);
    expect(isOverdue("2026-10-04", false, "2026-10-04")).toBe(false);
    expect(isOverdue("2026-10-03", true, "2026-10-04")).toBe(false);
    expect(isOverdue(null, false, "2026-10-04")).toBe(false);
  });
});
