import Link from "next/link";

export default function ListNotFound() {
  return (
    <section className="flex flex-col items-start gap-4">
      <h1 className="text-2xl font-semibold">List not found</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        It may have been deleted, or it belongs to another account.
      </p>
      <Link href="/lists" className="text-sm underline underline-offset-4">
        Back to your lists
      </Link>
    </section>
  );
}
