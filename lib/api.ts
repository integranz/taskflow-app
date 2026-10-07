import "server-only";
import type { AuthResponse, Health, List, Task, User } from "./types";

/** Error raised for any non-2xx backend response or a failed connection. `message` is the backend's `error` field when present. */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function baseUrl(): string {
  return (process.env.TASKFLOW_API_URL ?? "http://localhost:3000").replace(/\/+$/, "");
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  token?: string;
  body?: unknown;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { accept: "application/json" };
  if (options.body !== undefined) headers["content-type"] = "application/json";
  if (options.token) headers.authorization = `Bearer ${options.token}`;

  let response: Response;
  try {
    response = await fetch(`${baseUrl()}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      cache: "no-store",
    });
  } catch {
    throw new ApiError(503, "backend unreachable");
  }

  if (response.status === 204) return undefined as T;

  if (!response.ok) {
    let message = response.statusText || `request failed with status ${response.status}`;
    try {
      const data = (await response.json()) as { error?: unknown };
      if (typeof data.error === "string" && data.error) message = data.error;
    } catch {
      // Not a JSON body; keep the status text.
    }
    throw new ApiError(response.status, message);
  }

  return (await response.json()) as T;
}

const id = (value: string) => encodeURIComponent(value);

/** One function per backend endpoint. All calls run on the Next.js server; the browser never sees the token or the API URL. */
export const api = {
  health: () => request<Health>("/health"),

  register: (email: string, password: string) =>
    request<AuthResponse>("/auth/register", { method: "POST", body: { email, password } }),
  login: (email: string, password: string) =>
    request<AuthResponse>("/auth/login", { method: "POST", body: { email, password } }),
  logout: (token: string) => request<void>("/auth/logout", { method: "POST", token }),
  me: (token: string) => request<{ user: User }>("/auth/me", { token }),
  changePassword: (token: string, currentPassword: string, newPassword: string) =>
    request<void>("/auth/password", { method: "PATCH", token, body: { currentPassword, newPassword } }),

  listLists: (token: string) => request<{ lists: List[] }>("/lists", { token }),
  createList: (token: string, name: string) => request<{ list: List }>("/lists", { method: "POST", token, body: { name } }),
  getList: (token: string, listId: string) => request<{ list: List; tasks: Task[] }>(`/lists/${id(listId)}`, { token }),
  renameList: (token: string, listId: string, name: string) =>
    request<{ list: List }>(`/lists/${id(listId)}`, { method: "PATCH", token, body: { name } }),
  deleteList: (token: string, listId: string) => request<void>(`/lists/${id(listId)}`, { method: "DELETE", token }),

  createTask: (token: string, listId: string, input: { title: string; dueDate: string | null }) =>
    request<{ task: Task }>(`/lists/${id(listId)}/tasks`, { method: "POST", token, body: input }),
  updateTask: (token: string, taskId: string, patch: { title?: string; dueDate?: string | null; done?: boolean }) =>
    request<{ task: Task }>(`/tasks/${id(taskId)}`, { method: "PATCH", token, body: patch }),
  deleteTask: (token: string, taskId: string) => request<void>(`/tasks/${id(taskId)}`, { method: "DELETE", token }),
};
