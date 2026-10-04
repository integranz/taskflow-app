"use client";

import { buttonVariants } from "@/components/ui";

export default function RootError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <section className="flex flex-col items-start gap-4">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{error.message || "Unexpected error."}</p>
      <button type="button" onClick={() => retry()} className={buttonVariants.primary}>
        Try again
      </button>
    </section>
  );
}
