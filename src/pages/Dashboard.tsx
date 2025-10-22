import { useCallback, useEffect, useMemo, useState } from "react";
import { PomodoroTimer } from "@/components/Dashboard/PomodoroTimer";
import { WeekProgress } from "@/components/Dashboard/WeekProgress";
import { NextTasks } from "@/components/Dashboard/NextTasks";
import { TrackSummary } from "@/components/Dashboard/TrackSummary";
import apiService, {
  DashboardData,
  StudyTask,
  StudyTaskPayload,
  TrackSummaryItem,
  WeekProgress as WeekProgressType,
} from "@/services/api";

interface DisplayTask {
  id: number;
  title: string;
  dueDate?: string | null;
  completed: boolean;
}

function formatDueDate(date: string | null | undefined): string | null {
  if (!date) {
    return null;
  }

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function mapTasksForDisplay(tasks: StudyTask[]): DisplayTask[] {
  return tasks.map((task) => ({
    id: task.id,
    title: task.title,
    dueDate: formatDueDate(task.due_date),
    completed: task.completed,
  }));
}

function mapWeekData(weekProgress: WeekProgressType | null) {
  return weekProgress?.week.map((day) => ({ day: day.day, hours: day.hours })) ?? [];
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [weekProgress, setWeekProgress] = useState<WeekProgressType | null>(null);
  const [trackSummary, setTrackSummary] = useState<TrackSummaryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data: DashboardData = await apiService.getDashboardData();
      setTasks(data.tasks);
      setWeekProgress(data.week_progress);
      setTrackSummary(data.track_summary);
    } catch (err) {
      console.error("Failed to load dashboard data", err);
      setError("Não foi possível carregar os dados do dashboard.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const migrateLegacyTasks = async () => {
      const legacy = localStorage.getItem("qpath_dashboard_tasks");
      if (!legacy) {
        return;
      }

      try {
        const parsed = JSON.parse(legacy) as unknown;
        if (Array.isArray(parsed) && parsed.length > 0) {
          const payload = parsed.reduce<StudyTaskPayload[]>((acc, item) => {
            if (typeof item !== "object" || item === null) {
              return acc;
            }

            const record = item as Record<string, unknown>;
            const title = record.title;
            if (typeof title !== "string") {
              return acc;
            }

            const dueValue = record.due_date ?? record.date;
            const dueDate = typeof dueValue === "string" ? dueValue : null;

            acc.push({
              title,
              due_date: dueDate,
              completed: Boolean(record.completed),
            });
            return acc;
          }, []);

          if (payload.length) {
            await apiService.syncDashboardTasks(payload);
          }
        }
      } catch (migrationError) {
        console.warn("Failed to migrate legacy dashboard tasks", migrationError);
      } finally {
        localStorage.removeItem("qpath_dashboard_tasks");
      }
    };

    migrateLegacyTasks().finally(loadDashboard);
  }, [loadDashboard]);

  const handleToggleTask = async (taskId: number) => {
    const currentTask = tasks.find((task) => task.id === taskId);
    if (!currentTask) {
      return;
    }

    try {
      const updated = await apiService.toggleTaskCompletion(taskId, !currentTask.completed);
      setTasks((prev) => prev.map((task) => (task.id === updated.id ? updated : task)));
    } catch (err) {
      console.error("Failed to update task", err);
      setError("Não foi possível atualizar a tarefa. Tente novamente.");
    }
  };

  const handlePomodoroComplete = async (durationMinutes: number) => {
    try {
      await apiService.logPomodoroSession(durationMinutes);
      await loadDashboard();
    } catch (err) {
      console.error("Failed to registrar sessão pomodoro", err);
      setError("Não foi possível registrar a sessão Pomodoro.");
    }
  };

  const displayTasks = useMemo(() => mapTasksForDisplay(tasks), [tasks]);
  const weekData = useMemo(() => mapWeekData(weekProgress), [weekProgress]);
  const streak = weekProgress?.streak ?? 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Carregando seus dados...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Sua central de controle</p>
        {error && <p className="text-sm text-destructive mt-2">{error}</p>}
      </div>

      <PomodoroTimer onComplete={handlePomodoroComplete} />

      <div className="grid md:grid-cols-2 gap-6">
        <WeekProgress weekData={weekData} streak={streak} />
        <NextTasks tasks={displayTasks} onToggleTask={handleToggleTask} />
      </div>

      <TrackSummary tracks={trackSummary} />
    </div>
  );
}
