import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Register" };

export default function RegisterPage() {
  return (
    <section className="mx-auto w-full max-w-sm">
      <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
      <RegisterForm />
      <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
        Already registered?{" "}
        <Link href="/login" className="underline underline-offset-4">
          Log in
        </Link>
      </p>
    </section>
  );
}
