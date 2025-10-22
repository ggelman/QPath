import type { ComponentType } from "react";
import { Atom, Shield, Code2, Languages, BookOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { TrackSummaryItem } from "@/services/api";

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  quantum: Atom,
  security: Shield,
  software: Code2,
  english: Languages,
};

interface TrackSummaryProps {
  tracks: TrackSummaryItem[];
}

export function TrackSummary({ tracks }: TrackSummaryProps) {
  if (!tracks.length) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-2">Resumo das Trilhas</h2>
        <p className="text-sm text-muted-foreground">
          Nenhuma trilha disponível no momento.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-6">Resumo das Trilhas</h2>

      <div className="grid grid-cols-2 gap-4">
        {tracks.map((track) => {
          const Icon = iconMap[track.slug] ?? BookOpen;

          return (
            <div
              key={track.track_id}
              className="bg-background/50 border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg bg-${track.color}/10`}>
                  <Icon className={`w-5 h-5 text-${track.color}`} />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{track.name}</p>
                  <p className="text-sm text-muted-foreground">{Math.round(track.progress)}%</p>
                </div>
              </div>

              <Progress value={track.progress} className="h-2" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
