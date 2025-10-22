import { vi } from "vitest";

const mockGetTracks = vi.fn();
const mockUpdateLessonCompletion = vi.fn();

vi.mock("@/services/api", () => ({
  __esModule: true,
  default: {
    getTracks: (...args: unknown[]) => mockGetTracks(...args),
    updateLessonCompletion: (...args: unknown[]) => mockUpdateLessonCompletion(...args),
  },
}));

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Trilhas from "@/pages/Trilhas";
import type { Track } from "@/services/api";

describe("Trilhas page", () => {
  const baseTrack: Track = {
    id: 1,
    slug: "quantum",
    name: "Trilha Quantum",
    description: "Aprenda fundamentos quânticos",
    color: "quantum",
    progress: 0,
    modules: [
      {
        id: 10,
        slug: "mod-intro",
        title: "Módulo Intro",
        description: "Módulo inicial",
        order: 1,
        progress: 0,
        lessons: [
          { id: 100, slug: "lesson-1", title: "Primeira lição", order: 1, completed: false },
          { id: 101, slug: "lesson-2", title: "Segunda lição", order: 2, completed: false },
        ],
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockUpdateLessonCompletion.mockResolvedValue(true);
  });

  it("migrates legacy progress and refreshes tracks", async () => {
    const migratedTrack: Track = {
      ...baseTrack,
      progress: 50,
      modules: [
        {
          ...baseTrack.modules[0],
          progress: 50,
          lessons: [
            { ...baseTrack.modules[0].lessons[0], completed: true },
            baseTrack.modules[0].lessons[1],
          ],
        },
      ],
    };

    mockGetTracks
      .mockResolvedValueOnce([baseTrack])
      .mockResolvedValueOnce([migratedTrack]);

    localStorage.setItem(
      "qpath_track_progress",
      JSON.stringify([{ lesson: "lesson-1", completed: true }]),
    );

    render(<Trilhas />);

    await waitFor(() => expect(mockGetTracks).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(mockUpdateLessonCompletion).toHaveBeenCalledWith(100, true));

    await waitFor(() => expect(mockGetTracks).toHaveBeenCalledTimes(2));
    expect(localStorage.getItem("qpath_track_progress")).toBeNull();
    expect(await screen.findByText("Trilha Quantum")).toBeInTheDocument();
  });

  it("toggles lesson completion from the UI", async () => {
    mockGetTracks.mockResolvedValue([baseTrack]);

    const user = userEvent.setup();

    render(<Trilhas />);

    await screen.findByText("Trilha Quantum");
    await user.click(screen.getByRole("button", { name: /Módulo Intro/ }));

    await user.click(screen.getByRole("button", { name: /Concluir/ }));

    expect(mockUpdateLessonCompletion).toHaveBeenCalledWith(100, true);
    await screen.findByText(/Revisar/);
  });
});
