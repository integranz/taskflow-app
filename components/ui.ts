// Shared Tailwind class strings so forms and buttons look the same everywhere.

export const inputClass =
  "rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 " +
  "focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-300 " +
  "dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:ring-zinc-600";

export const labelClass = "flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300";

const buttonBase =
  "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors " +
  "disabled:cursor-not-allowed disabled:opacity-60";

export const buttonVariants = {
  primary: `${buttonBase} bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300`,
  secondary: `${buttonBase} border border-zinc-300 text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800`,
  danger: `${buttonBase} border border-red-300 text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950`,
  ghost: "text-sm text-zinc-600 underline-offset-4 hover:underline disabled:opacity-60 dark:text-zinc-400",
  ghostDanger: "text-sm text-red-600 underline-offset-4 hover:underline disabled:opacity-60 dark:text-red-400",
} as const;

export type ButtonVariant = keyof typeof buttonVariants;
