import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QMentorChat } from "../ChatButton";

type UseQMentorReturn = ReturnType<typeof import("@/hooks/useQMentor")["useQMentor"]>;

const mockUseAuth = vi.fn();
const mockUseQMentor = vi.fn();

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("@/hooks/useQMentor", () => ({
  useQMentor: () => mockUseQMentor(),
}));

describe("QMentorChat", () => {
  const askQuestionMock = vi.fn();
  const checkHealthMock = vi.fn();

  const buildQMentorReturn = (
    overrides: Partial<UseQMentorReturn> = {}
  ): UseQMentorReturn => ({
    isLoading: false,
    error: null,
    isAvailable: true,
    lastResponse: null,
    askQuestion: askQuestionMock,
    getQuickTips: vi.fn(),
    getQuantumRecommendations: vi.fn(),
    analyzeLearningPath: vi.fn(),
    checkHealth: checkHealthMock,
    clearError: vi.fn(),
    ...overrides,
  } as unknown as UseQMentorReturn);

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { full_name: "Test User" } });
    askQuestionMock.mockResolvedValue({
      response: "Aqui está a resposta",
      guidance: "Aqui está a resposta",
      status: "success",
      query: "Como avançar na trilha?",
    });
    checkHealthMock.mockResolvedValue({
      available: true,
      message: "ok",
      service: "qmentor",
      status: "online",
    });
    mockUseQMentor.mockReturnValue(buildQMentorReturn());
  });

  it("abre o chat e mostra a saudação personalizada", async () => {
    render(<QMentorChat />);

    expect(screen.queryByPlaceholderText("Digite sua dúvida...")).not.toBeInTheDocument();

    const openButton = screen.getAllByRole("button")[0];
    await userEvent.click(openButton);

    await waitFor(() => expect(checkHealthMock).toHaveBeenCalledTimes(1));
    expect(screen.getByText(/Olá, Test User/)).toBeInTheDocument();
  });

  it("envia perguntas e mostra a resposta do mentor", async () => {
    render(<QMentorChat />);

    const openButton = screen.getAllByRole("button")[0];
    await userEvent.click(openButton);

    const input = screen.getByPlaceholderText("Digite sua dúvida...");
    await userEvent.type(input, "Como avançar na trilha?{enter}");

    await waitFor(() =>
      expect(askQuestionMock).toHaveBeenCalledWith("Como avançar na trilha?")
    );
    await waitFor(() => expect(screen.getByText("Como avançar na trilha?")).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText("Aqui está a resposta")).toBeInTheDocument());
    expect((input as HTMLInputElement).value).toBe("");
  });

  it("mostra mensagens de erro quando o serviço está indisponível", async () => {
    mockUseQMentor.mockReturnValue(
      buildQMentorReturn({ error: "Serviço indisponível", isAvailable: false })
    );

    render(<QMentorChat />);

    const openButton = screen.getAllByRole("button")[0];
    await userEvent.click(openButton);

    expect(await screen.findByText("Serviço indisponível")).toBeInTheDocument();
  });
});
