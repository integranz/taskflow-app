"use client";

import { useActionState, useEffect, useRef } from "react";
import { changePassword } from "@/app/actions/auth";
import { FormError } from "@/components/form-error";
import { SubmitButton } from "@/components/submit-button";
import { inputClass, labelClass } from "@/components/ui";
import { MIN_PASSWORD_LENGTH } from "@/lib/validation";

export function ChangePasswordForm() {
  const [state, action] = useActionState(changePassword, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="mt-4 flex max-w-sm flex-col gap-4">
      <label className={labelClass}>
        Current password
        <input name="currentPassword" type="password" autoComplete="current-password" required className={inputClass} />
      </label>
      <label className={labelClass}>
        New password
        <input
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Confirm new password
        <input name="confirmPassword" type="password" autoComplete="new-password" required className={inputClass} />
      </label>
      <FormError message={state?.error} />
      {state?.ok ? (
        <p aria-live="polite" className="text-sm text-green-700 dark:text-green-400">
          Password changed. Other devices have been signed out.
        </p>
      ) : null}
      <SubmitButton pendingText="Saving…">Change password</SubmitButton>
    </form>
  );
}
