import { Atom, Shield, Code2, Languages } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const tracks = [
  { name: "Quantum", icon: Atom, progress: 15, color: "quantum" },
  { name: "Security", icon: Shield, progress: 8, color: "cyber" },
  { name: "Software", icon: Code2, progress: 42, color: "software" },
  { name: "Inglês C1", icon: Languages, progress: 67, color: "gold" },
];

export function TrackSummary() {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-6">Resumo das Trilhas</h2>
      
      <div className="grid grid-cols-2 gap-4">
        {tracks.map((track) => {
          const Icon = track.icon;
          
          return (
            <div
              key={track.name}
              className="bg-background/50 border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg bg-${track.color}/10`}>
                  <Icon className={`w-5 h-5 text-${track.color}`} />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{track.name}</p>
                  <p className="text-sm text-muted-foreground">{track.progress}%</p>
                </div>
              </div>
              
              <Progress 
                value={track.progress} 
                className="h-2"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
