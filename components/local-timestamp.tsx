"use client";

import { formatTimestamp } from "@/lib/dates";
import { useLocalValue } from "@/lib/use-local-value";

/** Formats an ISO timestamp as a date in the viewer's time zone (the server's formatting is only the first paint). */
export function LocalTimestamp({ iso, serverText }: { iso: string; serverText: string }) {
  const text = useLocalValue(serverText, () => formatTimestamp(iso));
  return <time dateTime={iso}>{text}</time>;
}
