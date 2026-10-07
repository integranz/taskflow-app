/** Result of a form Server Action, consumed by `useActionState`. Import-free so Client Components can use the type. */
export type ActionState =
  | {
      error?: string;
      ok?: true;
      /** Submitted values to re-populate inputs after a validation error. */
      values?: Record<string, string>;
    }
  | undefined;
