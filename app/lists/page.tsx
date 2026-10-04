import type { Metadata } from "next";
import Link from "next/link";
import { CreateListForm } from "@/components/lists/create-list-form";
import { api } from "@/lib/api";
import { apiCall } from "@/lib/dal";

export const metadata: Metadata = { title: "Lists" };

export default async function ListsPage() {
  const { lists } = await apiCall((token) => api.listLists(token));

  return (
    <section>
      <h1 className="text-2xl font-semibold tracking-tight">Your lists</h1>
      <CreateListForm />
      {lists.length === 0 ? (
        <p className="mt-8 text-zinc-500">No lists yet. Create your first one above.</p>
      ) : (
        <ul className="mt-6 divide-y divide-zinc-200 rounded-md border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {lists.map((list) => (
            <li key={list.id}>
              <Link
                href={`/lists/${list.id}`}
                className="block px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              >
                {list.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
