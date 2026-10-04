import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/app/actions/tasks", () => ({
  toggleTask: vi.fn(async () => ({ ok: true })),
  updateTask: vi.fn(async () => ({ ok: true })),
  deleteTask: vi.fn(async () => ({ ok: true })),
}));

import { toggleTask } from "@/app/actions/tasks";
import { TaskItem } from "@/components/tasks/task-item";
import type { Task } from "@/lib/types";

const task: Task = {
  id: "11111111-1111-4111-8111-111111111111",
  listId: "22222222-2222-4222-8222-222222222222",
  title: "Write tests",
  dueDate: "2026-10-10",
  done: false,
};

function renderItem(overrides: Partial<Task> = {}, today = "2026-10-04") {
  return render(
    <ul>
      <TaskItem task={{ ...task, ...overrides }} today={today} />
    </ul>,
  );
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("TaskItem", () => {
  it("renders the title and a formatted due date", () => {
    renderItem();
    expect(screen.getByText("Write tests")).toBeDefined();
    expect(screen.getByText("Due Oct 10, 2026")).toBeDefined();
  });

  it("toggles done through the server action and shows the optimistic state", async () => {
    renderItem();
    const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
    expect(checkbox.checked).toBe(false);

    fireEvent.click(checkbox);

    await waitFor(() => expect(toggleTask).toHaveBeenCalledWith(task.id, task.listId, true));
  });

  it("opens the inline editor with the current values", () => {
    renderItem();
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));

    expect((screen.getByLabelText("Task title") as HTMLInputElement).value).toBe("Write tests");
    expect((screen.getByLabelText("Due date") as HTMLInputElement).value).toBe("2026-10-10");

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByLabelText("Task title")).toBeNull();
  });

  it("marks undone tasks with a past due date as overdue", () => {
    renderItem({}, "2026-10-11");
    expect(screen.getByText(/overdue/)).toBeDefined();
  });

  it("does not mark done tasks as overdue", () => {
    renderItem({ done: true }, "2026-10-11");
    expect(screen.queryByText(/overdue/)).toBeNull();
  });
});
