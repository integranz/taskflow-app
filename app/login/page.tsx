import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <section className="mx-auto w-full max-w-sm">
      <h1 className="text-2xl font-semibold tracking-tight">Log in</h1>
      <LoginForm />
      <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
        No account yet?{" "}
        <Link href="/register" className="underline underline-offset-4">
          Register
        </Link>
      </p>
    </section>
  );
}
