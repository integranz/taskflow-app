"use client";

import { useActionState, useEffect, useRef } from "react";
import { createTask } from "@/app/actions/tasks";
import { FormError } from "@/components/form-error";
import { SubmitButton } from "@/components/submit-button";
import { inputClass } from "@/components/ui";

export function CreateTaskForm({ listId }: { listId: string }) {
  const [state, action] = useActionState(createTask, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="mt-6 flex flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input type="hidden" name="listId" value={listId} />
        <input
          name="title"
          placeholder="New task"
          aria-label="New task title"
          required
          className={`${inputClass} flex-1`}
        />
        <input name="dueDate" type="date" aria-label="Due date" className={inputClass} />
        <SubmitButton pendingText="Adding…">Add task</SubmitButton>
      </div>
      <FormError message={state?.error} />
    </form>
  );
}
