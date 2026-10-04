"use client";

import { useActionState, useState } from "react";
import { deleteList, renameList } from "@/app/actions/lists";
import { FormError } from "@/components/form-error";
import { SubmitButton } from "@/components/submit-button";
import { buttonVariants, inputClass } from "@/components/ui";
import type { ActionState } from "@/lib/action-state";
import type { List } from "@/lib/types";

export function ListHeader({ list }: { list: List }) {
  const [editing, setEditing] = useState(false);
  const [renameState, renameAction] = useActionState(
    async (prev: ActionState, formData: FormData): Promise<ActionState> => {
      const result = await renameList(prev, formData);
      if (result?.ok) setEditing(false);
      return result;
    },
    undefined,
  );
  const [deleteState, deleteAction] = useActionState(deleteList, undefined);

  if (editing) {
    return (
      <form action={renameAction} className="mt-4 flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <input type="hidden" name="listId" value={list.id} />
          <input
            name="name"
            defaultValue={list.name}
            aria-label="List name"
            required
            autoFocus
            className={`${inputClass} flex-1`}
          />
          <SubmitButton pendingText="Saving…">Save</SubmitButton>
          <button type="button" onClick={() => setEditing(false)} className={buttonVariants.secondary}>
            Cancel
          </button>
        </div>
        <FormError message={renameState?.error} />
      </form>
    );
  }

  return (
    <div className="mt-4 flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{list.name}</h1>
        <div className="flex gap-2">
          <button type="button" onClick={() => setEditing(true)} className={buttonVariants.secondary}>
            Rename
          </button>
          <form
            action={deleteAction}
            onSubmit={(event) => {
              if (!window.confirm(`Delete "${list.name}" and all of its tasks?`)) event.preventDefault();
            }}
          >
            <input type="hidden" name="listId" value={list.id} />
            <SubmitButton variant="danger" pendingText="Deleting…">
              Delete list
            </SubmitButton>
          </form>
        </div>
      </div>
      <FormError message={deleteState?.error} />
    </div>
  );
}
