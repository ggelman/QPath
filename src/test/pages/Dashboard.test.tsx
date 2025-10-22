import { vi } from "vitest";

const mockGetDashboardData = vi.fn();
const mockSyncDashboardTasks = vi.fn();
const mockToggleTaskCompletion = vi.fn();
const mockLogPomodoroSession = vi.fn();

vi.mock("@/services/api", () => ({
  __esModule: true,
  default: {
    getDashboardData: (...args: unknown[]) => mockGetDashboardData(...args),
    syncDashboardTasks: (...args: unknown[]) => mockSyncDashboardTasks(...args),
    toggleTaskCompletion: (...args: unknown[]) => mockToggleTaskCompletion(...args),
    logPomodoroSession: (...args: unknown[]) => mockLogPomodoroSession(...args),
  },
}));

vi.mock("@/components/Dashboard/PomodoroTimer", () => ({
  PomodoroTimer: ({ onComplete }: { onComplete?: (durationMinutes: number) => void }) => (
    <button onClick={() => onComplete?.(25)}>Completar Pomodoro</button>
  ),
}));

vi.mock("@/components/Dashboard/WeekProgress", () => ({
  WeekProgress: ({ streak }: { streak: number }) => <div>MockWeekProgress: {streak}</div>,
}));

vi.mock("@/components/Dashboard/TrackSummary", () => ({
  TrackSummary: ({ tracks }: { tracks: Array<{ name: string }> }) => (
    <div>MockTrackSummary: {tracks.map((track) => track.name).join(", ")}</div>
  ),
}));

vi.mock("@/components/Dashboard/NextTasks", () => ({
  NextTasks: ({
    tasks,
    onToggleTask,
  }: {
    tasks: Array<{ id: number; title: string; completed: boolean }>;
    onToggleTask: (id: number) => void;
  }) => (
    <div>
      {tasks.map((task) => (
        <button key={task.id} onClick={() => onToggleTask(task.id)}>
          {task.title} - {task.completed ? "feito" : "pendente"}
        </button>
      ))}
    </div>
  ),
}));

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Dashboard from "@/pages/Dashboard";
import type { DashboardData, GamificationProfile, StudyTask } from "@/services/api";

describe("Dashboard page", () => {
  const mockTasks: StudyTask[] = [
    {
      id: 1,
      user_id: 99,
      title: "Estudar Algoritmos",
      due_date: null,
      completed: false,
      created_at: "2025-02-01T10:00:00Z",
      updated_at: "2025-02-01T10:00:00Z",
    },
  ];

  const mockDashboard: DashboardData = {
    tasks: mockTasks,
    week_progress: {
      streak: 3,
      total_hours: 12,
      week: [
        { day: "Mon", hours: 2 },
        { day: "Tue", hours: 2 },
        { day: "Wed", hours: 2 },
        { day: "Thu", hours: 2 },
        { day: "Fri", hours: 2 },
        { day: "Sat", hours: 1 },
        { day: "Sun", hours: 1 },
      ],
    },
    track_summary: [
      { track_id: 1, slug: "quantum", name: "Trilha Quantum", color: "quantum", progress: 42 },
    ],
  };

  const mockProfile: GamificationProfile = {
    id: 1,
    user_id: 99,
    total_xp: 200,
    current_level: "explorador",
    current_streak: 3,
    longest_streak: 5,
    completed_trilhas: 0,
    completed_projects: 0,
    pomodoro_sessions: 0,
    last_activity_date: null,
    created_at: "2025-02-01T10:00:00Z",
    updated_at: "2025-02-01T10:00:00Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockGetDashboardData.mockResolvedValue(mockDashboard);
    mockSyncDashboardTasks.mockResolvedValue(mockTasks);
    mockToggleTaskCompletion.mockResolvedValue({ ...mockTasks[0], completed: true });
    mockLogPomodoroSession.mockResolvedValue(mockProfile);
  });

  it("migrates legacy tasks and renders dashboard data", async () => {
    localStorage.setItem(
      "qpath_dashboard_tasks",
      JSON.stringify([
        { title: "Migrar tarefa", due_date: null, completed: false },
      ]),
    );

    render(<Dashboard />);

    await waitFor(() => expect(mockSyncDashboardTasks).toHaveBeenCalledTimes(1));
    expect(mockSyncDashboardTasks).toHaveBeenCalledWith([
      { title: "Migrar tarefa", due_date: null, completed: false },
    ]);

    await waitFor(() => expect(mockGetDashboardData).toHaveBeenCalledTimes(1));
    await screen.findByText("MockWeekProgress: 3");
    await screen.findByText("MockTrackSummary: Trilha Quantum");
    expect(screen.getByText(/Estudar Algoritmos/)).toBeInTheDocument();
    expect(localStorage.getItem("qpath_dashboard_tasks")).toBeNull();
  });

  it("toggles tasks and logs pomodoro sessions", async () => {
    const user = userEvent.setup();

    render(<Dashboard />);

    await screen.findByText(/Estudar Algoritmos/);

    await user.click(screen.getByText(/Estudar Algoritmos/));
    expect(mockToggleTaskCompletion).toHaveBeenCalledWith(1, true);

    await user.click(screen.getByText("Completar Pomodoro"));

    expect(mockLogPomodoroSession).toHaveBeenCalledWith(25);
    await waitFor(() => expect(mockGetDashboardData).toHaveBeenCalledTimes(2));
  });
});
