import type { Metadata } from "next";
import { Suspense } from "react";
import { logout } from "@/app/actions/auth";
import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { BackendStatus } from "@/components/backend-status";
import { SubmitButton } from "@/components/submit-button";
import { getCurrentUser } from "@/lib/dal";
import { formatTimestamp } from "@/lib/dates";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  const user = await getCurrentUser();

  return (
    <section className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
        <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
          <dt className="text-zinc-500">Email</dt>
          <dd>{user.email}</dd>
          <dt className="text-zinc-500">Member since</dt>
          <dd>{formatTimestamp(user.createdAt)}</dd>
        </dl>
      </div>

      <div>
        <h2 className="text-lg font-medium">Change password</h2>
        <ChangePasswordForm />
      </div>

      <div>
        <h2 className="text-lg font-medium">Session</h2>
        <form action={logout} className="mt-4">
          <SubmitButton variant="secondary" pendingText="Logging out…">
            Log out
          </SubmitButton>
        </form>
      </div>

      <div>
        <h2 className="text-lg font-medium">Backend</h2>
        <div className="mt-2">
          <Suspense fallback={<p className="text-sm text-zinc-500">Checking…</p>}>
            <BackendStatus />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
