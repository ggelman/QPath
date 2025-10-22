import { vi } from "vitest";

const mockGetProfileDetails = vi.fn();
const mockCreateReward = vi.fn();

vi.mock("@/services/api", () => ({
  __esModule: true,
  default: {
    getProfileDetails: (...args: unknown[]) => mockGetProfileDetails(...args),
    createReward: (...args: unknown[]) => mockCreateReward(...args),
  },
}));

import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Perfil from "@/pages/Perfil";
import type { ProfileDetails, UserReward } from "@/services/api";

describe("Perfil page", () => {
  const baseRewards: UserReward[] = [
    {
      id: 1,
      user_id: 99,
      condition: "Completar 5 sessões",
      reward: "Assistir a um filme",
      achieved: false,
      achieved_at: null,
      created_at: "2025-02-01T10:00:00Z",
      updated_at: "2025-02-01T10:00:00Z",
    },
  ];

  const profileDetails: ProfileDetails = {
    profile: {
      id: 1,
      user_id: 99,
      total_xp: 200,
      current_level: "explorador",
      current_streak: 3,
      longest_streak: 5,
      completed_trilhas: 0,
      completed_projects: 0,
      pomodoro_sessions: 5,
      last_activity_date: null,
      created_at: "2025-02-01T10:00:00Z",
      updated_at: "2025-02-01T10:00:00Z",
    },
    achievements: [
      {
        id: "first_pomodoro",
        name: "Primeiro Circuito",
        description: "Complete uma sessão",
        unlocked: true,
      },
    ],
    rewards: baseRewards,
    stats: {
      total_xp: 200,
      current_level: "explorador",
      total_hours: 12,
      completed_lessons: 3,
      total_lessons: 10,
      pomodoro_sessions: 5,
    },
    week_progress: {
      streak: 3,
      total_hours: 12,
      week: [
        { day: "Mon", hours: 2 },
        { day: "Tue", hours: 2 },
        { day: "Wed", hours: 2 },
        { day: "Thu", hours: 2 },
        { day: "Fri", hours: 2 },
        { day: "Sat", hours: 2 },
        { day: "Sun", hours: 0 },
      ],
    },
    tracks: [
      {
        id: 1,
        slug: "quantum",
        name: "Trilha Quantum",
        description: "",
        color: "quantum",
        progress: 50,
        modules: [
          {
            id: 10,
            slug: "mod-intro",
            title: "Módulo Intro",
            description: "",
            order: 1,
            progress: 50,
            lessons: [
              { id: 100, slug: "lesson-1", title: "Primeira lição", order: 1, completed: true },
            ],
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockGetProfileDetails.mockResolvedValue(profileDetails);
    mockCreateReward.mockResolvedValue({
      id: 999,
      user_id: 99,
      condition: "Meta nova",
      reward: "Recompensa nova",
      achieved: false,
      achieved_at: null,
      created_at: "2025-02-01T10:00:00Z",
      updated_at: "2025-02-01T10:00:00Z",
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("migrates legacy rewards before loading profile", async () => {
    vi.useFakeTimers();
    const migratedReward = {
      condition: "Terminar trilha",
      reward: "Ganhar chocolate",
    };

    mockCreateReward.mockResolvedValueOnce({
      id: 2,
      user_id: 99,
      achieved: false,
      achieved_at: null,
      created_at: "2025-02-01T10:00:00Z",
      updated_at: "2025-02-01T10:00:00Z",
      ...migratedReward,
    });

    localStorage.setItem("qpath_profile_rewards", JSON.stringify([migratedReward]));

    render(<Perfil />);

    await act(async () => {
      vi.runAllTimers();
      await Promise.resolve();
    });

    expect(mockCreateReward).toHaveBeenCalledWith(migratedReward);
    await waitFor(() => expect(mockGetProfileDetails).toHaveBeenCalled());
    expect(localStorage.getItem("qpath_profile_rewards")).toBeNull();
    expect(await screen.findByText("Assistir a um filme")).toBeInTheDocument();
  });

  it("allows creating a new reward from the form", async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(<Perfil />);

    await waitFor(() => expect(mockGetProfileDetails).toHaveBeenCalled());

    const conditionInput = await screen.findByPlaceholderText("Se eu alcançar...");
    const rewardInput = screen.getByPlaceholderText("Então eu vou...");

    await user.type(conditionInput, "Completar módulo avançado");
    await user.type(rewardInput, "Tirar um dia de folga");

    mockCreateReward.mockResolvedValueOnce({
      id: 5,
      user_id: 99,
      condition: "Completar módulo avançado",
      reward: "Tirar um dia de folga",
      achieved: false,
      achieved_at: null,
      created_at: "2025-02-01T10:00:00Z",
      updated_at: "2025-02-01T10:00:00Z",
    });

    await user.click(screen.getByRole("button", { name: /Adicionar Recompensa/ }));

    expect(mockCreateReward).toHaveBeenCalledWith({
      condition: "Completar módulo avançado",
      reward: "Tirar um dia de folga",
    });

    await screen.findByText("Tirar um dia de folga");
  });
});
