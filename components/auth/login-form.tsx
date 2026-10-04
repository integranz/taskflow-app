"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";
import { FormError } from "@/components/form-error";
import { SubmitButton } from "@/components/submit-button";
import { inputClass, labelClass } from "@/components/ui";

export function LoginForm() {
  const [state, action] = useActionState(login, undefined);
  return (
    <form action={action} className="mt-6 flex flex-col gap-4">
      <label className={labelClass}>
        Email
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state?.values?.email ?? ""}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Password
        <input name="password" type="password" autoComplete="current-password" required className={inputClass} />
      </label>
      <FormError message={state?.error} />
      <SubmitButton pendingText="Logging in…">Log in</SubmitButton>
    </form>
  );
}
