import { todayIso } from "@/lib/dates";
import type { Task } from "@/lib/types";
import { TaskItem } from "./task-item";

const listClass = "divide-y divide-zinc-200 rounded-md border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800";

export function TaskList({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return <p className="mt-8 text-zinc-500">No tasks yet. Add your first one above.</p>;
  }

  const today = todayIso();
  const open = tasks.filter((task) => !task.done);
  const done = tasks.filter((task) => task.done);

  return (
    <div className="mt-6 flex flex-col gap-8">
      <section>
        <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
          To do ({open.length})
        </h2>
        {open.length === 0 ? (
          <p className="text-sm text-zinc-500">Everything is done.</p>
        ) : (
          <ul className={listClass}>
            {open.map((task) => (
              <TaskItem key={task.id} task={task} today={today} />
            ))}
          </ul>
        )}
      </section>
      {done.length > 0 ? (
        <section>
          <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">Done ({done.length})</h2>
          <ul className={listClass}>
            {done.map((task) => (
              <TaskItem key={task.id} task={task} today={today} />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
