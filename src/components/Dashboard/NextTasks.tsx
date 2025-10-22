import { Calendar, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Task {
  id: string;
  title: string;
  date: string;
  completed: boolean;
}

interface NextTasksProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
}

export function NextTasks({ tasks, onToggleTask }: NextTasksProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-5 h-5 text-cyber" />
        <h2 className="text-lg font-semibold">Próximas Tarefas</h2>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-3 p-3 bg-background/50 rounded-lg hover:bg-background transition-colors"
          >
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-auto"
              onClick={() => onToggleTask(task.id)}
            >
              <CheckCircle2
                className={`w-5 h-5 ${
                  task.completed ? "text-cyber fill-cyber" : "text-muted-foreground"
                }`}
              />
            </Button>
            <div className="flex-1">
              <p className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                {task.title}
              </p>
              <p className="text-sm text-muted-foreground">{task.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
