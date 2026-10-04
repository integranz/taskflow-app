"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/action-state";
import { api } from "@/lib/api";
import { verifySession } from "@/lib/dal";
import { attempt } from "@/lib/errors";
import { isUuid, requiredText } from "@/lib/validation";

export async function createList(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const token = await verifySession();
  const name = requiredText(formData.get("name"), "List name");
  if ("error" in name) return { error: name.error };

  const result = await attempt(() => api.createList(token, name.value));
  if (!result.ok) return result.state;

  revalidatePath("/lists");
  return { ok: true };
}

export async function renameList(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const token = await verifySession();
  const listId = formData.get("listId");
  if (!isUuid(listId)) return { error: "Unknown list." };
  const name = requiredText(formData.get("name"), "List name");
  if ("error" in name) return { error: name.error };

  const result = await attempt(() => api.renameList(token, listId, name.value));
  if (!result.ok) return result.state;

  revalidatePath("/lists");
  revalidatePath(`/lists/${listId}`);
  return { ok: true };
}

export async function deleteList(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const token = await verifySession();
  const listId = formData.get("listId");
  if (!isUuid(listId)) return { error: "Unknown list." };

  const result = await attempt(() => api.deleteList(token, listId));
  // 404 means it is already gone, which is the outcome we wanted.
  if (!result.ok && result.status !== 404) return result.state;

  revalidatePath("/lists");
  redirect("/lists");
}
