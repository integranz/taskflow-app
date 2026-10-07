import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
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

/** Pins the browser clock to local noon on the given YYYY-MM-DD. */
function setBrowserDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(y ?? 0, (m ?? 1) - 1, d ?? 1, 12));
}

function renderItem(overrides: Partial<Task> = {}, today = "2026-10-04") {
  setBrowserDate(today);
  return render(
    <ul>
      <TaskItem task={{ ...task, ...overrides }} today={today} />
    </ul>,
  );
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.useRealTimers();
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

  it("uses the browser's date, not the server's, to decide overdue", () => {
    // Server thinks it is Oct 4 (not overdue for a task due Oct 10); the browser is already on Oct 11.
    setBrowserDate("2026-10-11");
    render(
      <ul>
        <TaskItem task={task} today="2026-10-04" />
      </ul>,
    );
    expect(screen.getByText(/overdue/)).toBeDefined();
  });

  it("hydrates the server HTML without a mismatch, then switches to the browser's date", async () => {
    const tree = (
      <ul>
        <TaskItem task={task} today="2026-10-04" />
      </ul>
    );
    const container = document.createElement("div");
    container.innerHTML = renderToString(tree);
    document.body.appendChild(container);
    expect(container.textContent).not.toMatch(/overdue/);

    setBrowserDate("2026-10-11");
    const recoverable = vi.fn();
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    await act(async () => {
      hydrateRoot(container, tree, { onRecoverableError: recoverable });
    });

    expect(recoverable).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
    expect(container.textContent).toMatch(/overdue/);
    consoleError.mockRestore();
    container.remove();
  });
});
