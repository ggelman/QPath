import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import Dashboard from "../Dashboard";

describe("Dashboard", () => {
  it("renderiza os principais widgets e permite concluir tarefas", async () => {
    render(<Dashboard />);

    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByText("Sessão de Foco Atual")).toBeInTheDocument();
    expect(screen.getByText("Progresso da Semana")).toBeInTheDocument();
    expect(screen.getByText("Próximas Tarefas")).toBeInTheDocument();
    expect(screen.getByText("Resumo das Trilhas")).toBeInTheDocument();

    const taskTitle = screen.getByText("Estudar Cambridge C1 - Writing Module");
    const taskRow = taskTitle.closest("div")?.parentElement as HTMLElement | null;
    if (!taskRow) {
      throw new Error("Não foi possível localizar o container da tarefa");
    }

    const toggleButton = taskRow.querySelector("button") as HTMLButtonElement | null;
    if (!toggleButton) {
      throw new Error("Não foi possível localizar o botão de conclusão da tarefa");
    }

    expect(taskTitle).not.toHaveClass("line-through");

    await userEvent.click(toggleButton);

    await waitFor(() =>
      expect(screen.getByText("Estudar Cambridge C1 - Writing Module")).toHaveClass("line-through")
    );
  });

  it("permite alternar os modos do pomodoro", async () => {
    render(<Dashboard />);

    const pauseButton = screen.getByRole("button", { name: "Pausa (5m)" });
    await userEvent.click(pauseButton);

    expect(pauseButton.className).toContain("bg-cyber");
  });
});
