import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { getOptionalUser } from "@/lib/dal";
import { buttonVariants } from "./ui";

/** Null when signed out, or when the backend is down (the shell must still render). */
async function currentEmail(): Promise<string | null> {
  try {
    return (await getOptionalUser())?.email ?? null;
  } catch {
    return null;
  }
}

/** Header navigation. Rendered inside <Suspense> in the root layout so the shell streams before the session lookup finishes. */
export async function UserNav() {
  const email = await currentEmail();

  if (!email) {
    return (
      <nav className="flex items-center gap-4 text-sm">
        <Link href="/login" className="hover:underline">
          Log in
        </Link>
        <Link href="/register" className="hover:underline">
          Register
        </Link>
      </nav>
    );
  }

  return (
    <nav className="flex items-center gap-4 text-sm">
      <Link href="/lists" className="hover:underline">
        Lists
      </Link>
      <Link href="/account" className="hover:underline" title={email}>
        Account
      </Link>
      <form action={logout}>
        <button type="submit" className={buttonVariants.ghost}>
          Log out
        </button>
      </form>
    </nav>
  );
}
