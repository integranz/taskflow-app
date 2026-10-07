// Calendar-date helpers. Dates from the backend are plain YYYY-MM-DD strings, never timestamps.

const DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

// Fixed locale so server and client render the same text.
const formatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

export function todayIso(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** "2026-10-04" -> "Oct 4, 2026". Builds a local date from the parts so time zones cannot shift the day. */
export function formatCalendarDate(value: string): string {
  const match = DATE.exec(value);
  if (!match) return value;
  const [, year, month, day] = match;
  return formatter.format(new Date(Number(year), Number(month) - 1, Number(day)));
}

export function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : formatter.format(date);
}

export function isOverdue(dueDate: string | null, done: boolean, today: string): boolean {
  return dueDate !== null && !done && dueDate < today;
}
