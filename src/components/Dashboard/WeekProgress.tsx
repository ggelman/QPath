import { BarChart3, Flame } from "lucide-react";

interface WeekProgressProps {
  weekData: { day: string; hours: number }[];
  streak: number;
}

export function WeekProgress({ weekData, streak }: WeekProgressProps) {
  const maxHours = Math.max(...weekData.map((d) => d.hours), 4);

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-software" />
          <h2 className="text-lg font-semibold">Progresso da Semana</h2>
        </div>
        <div className="flex items-center gap-2 bg-gold/10 text-gold px-3 py-1.5 rounded-lg">
          <Flame className="w-4 h-4" />
          <span className="font-semibold">{streak} dias</span>
        </div>
      </div>

      <div className="flex items-end justify-between gap-3 h-48">
        {weekData.map((data, index) => {
          const heightPercentage = (data.hours / maxHours) * 100;
          const isToday = index === 3; // Assuming Thursday is today

          return (
            <div key={data.day} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex items-end h-40">
                <div
                  className={`w-full rounded-t-lg transition-all duration-500 ${
                    isToday
                      ? "bg-gradient-to-t from-quantum to-cyber"
                      : data.hours > 0
                      ? "bg-gradient-to-t from-software/50 to-software"
                      : "bg-muted"
                  }`}
                  style={{ height: `${heightPercentage}%` }}
                />
              </div>
              <div className="text-center">
                <p className="text-xs font-medium">{data.day}</p>
                <p className="text-xs text-muted-foreground">{data.hours}h</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
