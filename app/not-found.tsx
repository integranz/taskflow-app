import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex flex-col items-start gap-4">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <Link href="/lists" className="text-sm underline underline-offset-4">
        Back to your lists
      </Link>
    </section>
  );
}
