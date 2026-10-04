"use client";

import { useActionState, useOptimistic, useState, useTransition } from "react";
import { deleteTask, toggleTask, updateTask } from "@/app/actions/tasks";
import { FormError } from "@/components/form-error";
import { SubmitButton } from "@/components/submit-button";
import { buttonVariants, inputClass } from "@/components/ui";
import type { ActionState } from "@/lib/action-state";
import { formatCalendarDate, isOverdue } from "@/lib/dates";
import type { Task } from "@/lib/types";

type Props = {
  task: Task;
  /** Today's date as YYYY-MM-DD, computed once on the server so SSR and hydration agree. */
  today: string;
};

export function TaskItem({ task, today }: Props) {
  const [optimisticDone, setOptimisticDone] = useOptimistic(task.done);
  const [isToggling, startToggle] = useTransition();
  const [toggleError, setToggleError] = useState<string | undefined>();
  const [editing, setEditing] = useState(false);
  const [updateState, updateAction] = useActionState(
    async (prev: ActionState, formData: FormData): Promise<ActionState> => {
      const result = await updateTask(prev, formData);
      if (result?.ok) setEditing(false);
      return result;
    },
    undefined,
  );
  const [deleteState, deleteAction] = useActionState(deleteTask, undefined);

  function onToggle(next: boolean) {
    setToggleError(undefined);
    startToggle(async () => {
      setOptimisticDone(next);
      const result = await toggleTask(task.id, task.listId, next);
      if (result?.error) setToggleError(result.error);
    });
  }

  if (editing) {
    return (
      <li className="flex flex-col gap-2 px-4 py-3">
        <form action={updateAction} className="flex flex-col gap-2">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input type="hidden" name="taskId" value={task.id} />
            <input type="hidden" name="listId" value={task.listId} />
            <input
              name="title"
              defaultValue={task.title}
              aria-label="Task title"
              required
              autoFocus
              className={`${inputClass} flex-1`}
            />
            <input
              name="dueDate"
              type="date"
              defaultValue={task.dueDate ?? ""}
              aria-label="Due date"
              className={inputClass}
            />
            <SubmitButton pendingText="Saving…">Save</SubmitButton>
            <button type="button" onClick={() => setEditing(false)} className={buttonVariants.secondary}>
              Cancel
            </button>
          </div>
          <FormError message={updateState?.error} />
        </form>
      </li>
    );
  }

  const overdue = isOverdue(task.dueDate, optimisticDone, today);

  return (
    <li className="flex flex-col gap-1 px-4 py-3">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={optimisticDone}
          disabled={isToggling}
          onChange={(event) => onToggle(event.target.checked)}
          aria-label={`Mark "${task.title}" as ${optimisticDone ? "not done" : "done"}`}
          className="mt-1 size-4 accent-zinc-900 dark:accent-zinc-100"
        />
        <div className="min-w-0 flex-1">
          <p className={optimisticDone ? "text-zinc-500 line-through" : ""}>{task.title}</p>
          {task.dueDate ? (
            <p className={`text-xs ${overdue ? "font-medium text-red-600 dark:text-red-400" : "text-zinc-500"}`}>
              Due {formatCalendarDate(task.dueDate)}
              {overdue ? " (overdue)" : ""}
            </p>
          ) : null}
        </div>
        <button type="button" onClick={() => setEditing(true)} className={buttonVariants.ghost}>
          Edit
        </button>
        <form
          action={deleteAction}
          onSubmit={(event) => {
            if (!window.confirm(`Delete "${task.title}"?`)) event.preventDefault();
          }}
        >
          <input type="hidden" name="taskId" value={task.id} />
          <input type="hidden" name="listId" value={task.listId} />
          <SubmitButton variant="ghostDanger" pendingText="Deleting…">
            Delete
          </SubmitButton>
        </form>
      </div>
      <FormError message={toggleError ?? deleteState?.error} />
    </li>
  );
}
