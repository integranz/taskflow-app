// Mirrors the JSON shapes of the taskflow backend (architecture/design.md in that repo).

export type User = { id: string; email: string; createdAt: string };

export type List = { id: string; name: string };

export type Task = {
  id: string;
  listId: string;
  title: string;
  dueDate: string | null;
  done: boolean;
};

export type AuthResponse = { user: User; token: string; expiresAt: string };

export type Health = { status: string; version: string };
