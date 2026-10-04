export function FormError({ message }: { message?: string }) {
  return (
    <p aria-live="polite" className="text-sm text-red-600 empty:hidden dark:text-red-400">
      {message}
    </p>
  );
}
