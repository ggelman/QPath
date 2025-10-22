import { useState } from "react";
import { PomodoroTimer } from "@/components/Dashboard/PomodoroTimer";
import { WeekProgress } from "@/components/Dashboard/WeekProgress";
import { NextTasks } from "@/components/Dashboard/NextTasks";
import { TrackSummary } from "@/components/Dashboard/TrackSummary";

const initialTasks = [
  { id: "1", title: "Estudar Cambridge C1 - Writing Module", date: "15 Dez 2025", completed: false },
  { id: "2", title: "Completar módulo de Vetores - Quantum", date: "18 Dez 2025", completed: false },
  { id: "3", title: "Revisar conceitos de RSA - Cybersecurity", date: "20 Dez 2025", completed: false },
];

const weekData = [
  { day: "Seg", hours: 2.5 },
  { day: "Ter", hours: 3 },
  { day: "Qua", hours: 1.5 },
  { day: "Qui", hours: 3.5 },
  { day: "Sex", hours: 0 },
  { day: "Sáb", hours: 0 },
  { day: "Dom", hours: 0 },
];

export default function Dashboard() {
  const [tasks, setTasks] = useState(initialTasks);

  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handlePomodoroComplete = () => {
    // Could trigger XP gain here
    console.log("Pomodoro completed! +10 XP");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Sua central de controle</p>
      </div>

      {/* Pomodoro - Full Width */}
      <PomodoroTimer onComplete={handlePomodoroComplete} />

      {/* Two Column Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <WeekProgress weekData={weekData} streak={4} />
        <NextTasks tasks={tasks} onToggleTask={handleToggleTask} />
      </div>

      {/* Track Summary */}
      <TrackSummary />
    </div>
  );
}
