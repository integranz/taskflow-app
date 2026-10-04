"use client";

import { useActionState, useEffect, useRef } from "react";
import { createList } from "@/app/actions/lists";
import { FormError } from "@/components/form-error";
import { SubmitButton } from "@/components/submit-button";
import { inputClass } from "@/components/ui";

export function CreateListForm() {
  const [state, action] = useActionState(createList, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="mt-6 flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          name="name"
          placeholder="New list name"
          aria-label="New list name"
          required
          className={`${inputClass} flex-1`}
        />
        <SubmitButton pendingText="Adding…">Add list</SubmitButton>
      </div>
      <FormError message={state?.error} />
    </form>
  );
}
