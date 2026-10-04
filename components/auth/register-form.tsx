"use client";

import { useActionState } from "react";
import { register } from "@/app/actions/auth";
import { FormError } from "@/components/form-error";
import { SubmitButton } from "@/components/submit-button";
import { inputClass, labelClass } from "@/components/ui";
import { MIN_PASSWORD_LENGTH } from "@/lib/validation";

export function RegisterForm() {
  const [state, action] = useActionState(register, undefined);
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
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          className={inputClass}
        />
        <span className="text-xs font-normal text-zinc-500">At least {MIN_PASSWORD_LENGTH} characters.</span>
      </label>
      <label className={labelClass}>
        Confirm password
        <input name="confirmPassword" type="password" autoComplete="new-password" required className={inputClass} />
      </label>
      <FormError message={state?.error} />
      <SubmitButton pendingText="Creating account…">Create account</SubmitButton>
    </form>
  );
}
