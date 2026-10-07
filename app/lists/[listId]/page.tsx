import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ListHeader } from "@/components/lists/list-header";
import { CreateTaskForm } from "@/components/tasks/create-task-form";
import { TaskList } from "@/components/tasks/task-list";
import { api } from "@/lib/api";
import { apiCall } from "@/lib/dal";
import { isUuid } from "@/lib/validation";

export async function generateMetadata({ params }: PageProps<"/lists/[listId]">): Promise<Metadata> {
  const { listId } = await params;
  if (!isUuid(listId)) return { title: "List" };
  const { list } = await apiCall((token) => api.getList(token, listId));
  return { title: list.name };
}

export default async function ListPage({ params }: PageProps<"/lists/[listId]">) {
  const { listId } = await params;
  if (!isUuid(listId)) notFound();

  const { list, tasks } = await apiCall((token) => api.getList(token, listId));

  return (
    <section>
      <Link href="/lists" className="text-sm text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400">
        ← All lists
      </Link>
      <ListHeader list={list} />
      <CreateTaskForm listId={list.id} />
      <TaskList tasks={tasks} />
    </section>
  );
}
