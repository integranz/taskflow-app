"use server";

import { revalidatePath } from "next/cache";
import type { ActionState } from "@/lib/action-state";
import { api } from "@/lib/api";
import { verifySession } from "@/lib/dal";
import { attempt } from "@/lib/errors";
import { isUuid, normalizeDueDate, requiredText } from "@/lib/validation";

export async function createTask(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const token = await verifySession();
  const listId = formData.get("listId");
  if (!isUuid(listId)) return { error: "Unknown list." };
  const title = requiredText(formData.get("title"), "Task title");
  if ("error" in title) return { error: title.error };
  const dueDate = normalizeDueDate(formData.get("dueDate"));
  if ("error" in dueDate) return { error: dueDate.error };

  const result = await attempt(() => api.createTask(token, listId, { title: title.value, dueDate: dueDate.value }));
  if (!result.ok) return result.state;

  revalidatePath(`/lists/${listId}`);
  return { ok: true };
}

/** Called from the checkbox inside `startTransition`; returns an error message instead of throwing. */
export async function toggleTask(taskId: string, listId: string, done: boolean): Promise<ActionState> {
  const token = await verifySession();
  if (!isUuid(taskId) || !isUuid(listId)) return { error: "Unknown task." };

  const result = await attempt(() => api.updateTask(token, taskId, { done: done === true }));
  revalidatePath(`/lists/${listId}`);
  if (!result.ok) return result.state;
  return { ok: true };
}

export async function updateTask(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const token = await verifySession();
  const taskId = formData.get("taskId");
  const listId = formData.get("listId");
  if (!isUuid(taskId) || !isUuid(listId)) return { error: "Unknown task." };
  const title = requiredText(formData.get("title"), "Task title");
  if ("error" in title) return { error: title.error };
  const dueDate = normalizeDueDate(formData.get("dueDate"));
  if ("error" in dueDate) return { error: dueDate.error };

  const result = await attempt(() => api.updateTask(token, taskId, { title: title.value, dueDate: dueDate.value }));
  if (!result.ok) return result.state;

  revalidatePath(`/lists/${listId}`);
  return { ok: true };
}

export async function deleteTask(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const token = await verifySession();
  const taskId = formData.get("taskId");
  const listId = formData.get("listId");
  if (!isUuid(taskId) || !isUuid(listId)) return { error: "Unknown task." };

  const result = await attempt(() => api.deleteTask(token, taskId));
  // 404 means it is already gone, which is the outcome we wanted.
  if (!result.ok && result.status !== 404) return result.state;

  revalidatePath(`/lists/${listId}`);
  return { ok: true };
}
