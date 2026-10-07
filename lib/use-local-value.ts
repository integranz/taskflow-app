"use client";

import { useSyncExternalStore } from "react";

/** Re-reads the value every minute and whenever the tab becomes visible again (so "today" rolls over at midnight). */
function subscribe(onChange: () => void): () => void {
  const interval = window.setInterval(onChange, 60_000);
  document.addEventListener("visibilitychange", onChange);
  return () => {
    window.clearInterval(interval);
    document.removeEventListener("visibilitychange", onChange);
  };
}

/**
 * A value that depends on the browser's clock or time zone.
 * The server-rendered value is used for SSR and hydration (so they always match),
 * then React re-renders with `readLocal()` computed in the browser.
 * `readLocal` must return a primitive so React can compare snapshots.
 */
export function useLocalValue<T extends string | number | boolean>(serverValue: T, readLocal: () => T): T {
  return useSyncExternalStore(subscribe, readLocal, () => serverValue);
}
