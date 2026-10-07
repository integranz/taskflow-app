"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { buttonVariants, type ButtonVariant } from "./ui";

type Props = {
  children: ReactNode;
  pendingText?: string;
  variant?: ButtonVariant;
  className?: string;
};

/** Submit button that disables itself and shows `pendingText` while the parent form's action runs. */
export function SubmitButton({ children, pendingText, variant = "primary", className = "" }: Props) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`${buttonVariants[variant]} ${className}`}>
      {pending ? (pendingText ?? "Working…") : children}
    </button>
  );
}
