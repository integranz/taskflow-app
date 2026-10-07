import { redirect } from "next/navigation";
import { getSessionToken } from "@/lib/session";

/** Server-side fallback for the same decision proxy.ts makes optimistically. */
export default async function Home() {
  const token = await getSessionToken();
  redirect(token ? "/lists" : "/login");
}
