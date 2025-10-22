import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TimerMode = "focus" | "short" | "long";

const TIMER_DURATIONS = {
  focus: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
};

interface PomodoroTimerProps {
  currentTask?: string;
  onComplete?: (durationMinutes: number) => void;
}

export function PomodoroTimer({ currentTask = "Fundamentos Matemáticos - Vetores", onComplete }: PomodoroTimerProps) {
  const [mode, setMode] = useState<TimerMode>("focus");
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATIONS.focus);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setTimeLeft(TIMER_DURATIONS[mode]);
    setIsRunning(false);
  }, [mode]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            onComplete?.(Math.floor(TIMER_DURATIONS[mode] / 60));
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, onComplete, mode]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((TIMER_DURATIONS[mode] - timeLeft) / TIMER_DURATIONS[mode]) * 100;

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(TIMER_DURATIONS[mode]);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold">
            {isRunning ? `Foco: ${currentTask}` : "Sessão de Foco Atual"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">{currentTask}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={mode === "focus" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("focus")}
            className={mode === "focus" ? "bg-quantum hover:bg-quantum/90" : ""}
          >
            Foco (25m)
          </Button>
          <Button
            variant={mode === "short" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("short")}
            className={mode === "short" ? "bg-cyber hover:bg-cyber/90" : ""}
          >
            Pausa (5m)
          </Button>
          <Button
            variant={mode === "long" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("long")}
            className={mode === "long" ? "bg-software hover:bg-software/90" : ""}
          >
            Longa (15m)
          </Button>
        </div>
      </div>

      {/* Timer Display */}
      <div className="relative mb-6">
        <div className="flex items-center justify-center h-40">
          <div className="text-6xl font-bold tabular-nums">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </div>
        </div>
        
        {/* Progress Ring */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="hsl(var(--secondary))"
              strokeWidth="2"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="hsl(var(--quantum))"
              strokeWidth="2"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              className="transition-all duration-1000"
            />
          </svg>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <Button
          size="lg"
          onClick={() => setIsRunning(!isRunning)}
          className={cn(
            "gap-2",
            mode === "focus" && "bg-quantum hover:bg-quantum/90",
            mode === "short" && "bg-cyber hover:bg-cyber/90",
            mode === "long" && "bg-software hover:bg-software/90"
          )}
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isRunning ? "Pausar" : "Iniciar"}
        </Button>
        <Button size="lg" variant="outline" onClick={handleReset}>
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
