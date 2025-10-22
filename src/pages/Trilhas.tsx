import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, CheckCircle2, Circle, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import apiService, { Track } from "@/services/api";

export default function Trilhas() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [expandedTrack, setExpandedTrack] = useState<string | null>(null);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const migrateLegacyProgress = useCallback(async (fetchedTracks: Track[]) => {
    const legacy = localStorage.getItem("qpath_track_progress");
    if (!legacy) {
      return false;
    }

    const slugToId = fetchedTracks.reduce<Record<string, number>>((acc, track) => {
      track.modules.forEach((module) => {
        module.lessons.forEach((lesson) => {
          acc[lesson.slug] = lesson.id;
        });
      });
      return acc;
    }, {});

    let migrated = false;

    try {
      const parsed = JSON.parse(legacy) as unknown;
      const entries: Array<{ lessonId: number; completed: boolean }> = [];

      const isRecord = (value: unknown): value is Record<string, unknown> =>
        typeof value === "object" && value !== null;

      if (Array.isArray(parsed)) {
        parsed.forEach((item) => {
          if (!isRecord(item)) {
            return;
          }

          const record = item;
          const slugValue = record["lesson"];
          if (typeof slugValue !== "string") {
            return;
          }

          const lessonId = slugToId[slugValue];
          if (!lessonId) {
            return;
          }

          entries.push({ lessonId, completed: Boolean(record["completed"]) });
        });
      } else if (isRecord(parsed)) {
        Object.entries(parsed).forEach(([key, value]) => {
          const lessonId = slugToId[key];
          if (!lessonId) {
            return;
          }

          entries.push({ lessonId, completed: Boolean(value) });
        });
      }

      if (entries.length) {
        await Promise.all(
          entries.map(({ lessonId, completed }) =>
            apiService.updateLessonCompletion(lessonId, completed),
          ),
        );
        migrated = true;
      }
    } catch (migrationError) {
      console.warn("Failed to migrate legacy track progress", migrationError);
    } finally {
      localStorage.removeItem("qpath_track_progress");
    }

    return migrated;
  }, []);

  const loadTracks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetched = await apiService.getTracks();
      setTracks(fetched);
      const migrated = await migrateLegacyProgress(fetched);
      if (migrated) {
        const refreshed = await apiService.getTracks();
        setTracks(refreshed);
      }
    } catch (err) {
      console.error("Failed to load tracks", err);
      setError("Não foi possível carregar as trilhas.");
    } finally {
      setIsLoading(false);
    }
  }, [migrateLegacyProgress]);

  useEffect(() => {
    loadTracks();
  }, [loadTracks]);

  useEffect(() => {
    if (tracks.length > 0 && !expandedTrack) {
      setExpandedTrack(tracks[0].slug);
    }
  }, [tracks, expandedTrack]);

  const handleLessonToggle = async (lessonId: number, completed: boolean) => {
    try {
      const success = await apiService.updateLessonCompletion(lessonId, completed);
      if (!success) {
        return;
      }
      setTracks((prev) =>
        prev.map((track) => ({
          ...track,
          modules: track.modules.map((module) => ({
            ...module,
            lessons: module.lessons.map((lesson) =>
              lesson.id === lessonId ? { ...lesson, completed } : lesson,
            ),
          })),
        }))
      );
    } catch (err) {
      console.error("Failed to update lesson", err);
      setError("Não foi possível atualizar o progresso da lição.");
    }
  };

  const trackSummaries = useMemo(() => {
    return tracks.map((track) => {
      const totalLessons = track.modules.reduce((sum, module) => sum + module.lessons.length, 0);
      const completedLessons = track.modules.reduce(
        (sum, module) => sum + module.lessons.filter((lesson) => lesson.completed).length,
        0,
      );
      return {
        ...track,
        totalLessons,
        completedLessons,
        trackProgress: track.progress,
      };
    });
  }, [tracks]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Trilhas de Aprendizagem</h1>
        <p className="text-muted-foreground mt-1">Carregando trilhas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Trilhas de Aprendizagem</h1>
        <p className="text-muted-foreground mt-1">Seu caminho estruturado para o conhecimento</p>
        {error && <p className="text-sm text-destructive mt-2">{error}</p>}
      </div>

      <div className="space-y-4">
        {trackSummaries.map((track) => {
          const isExpanded = expandedTrack === track.slug;

          return (
            <div key={track.id} className="bg-card border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedTrack(isExpanded ? null : track.slug)}
                className="w-full p-6 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  <div className="text-left">
                    <h2 className={`text-xl font-semibold text-${track.color}`}>{track.name}</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {track.completedLessons} de {track.totalLessons} lições completadas
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{Math.round(track.trackProgress)}%</p>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-border p-4 space-y-4">
                  {track.modules.map((module) => {
                    const isModuleExpanded = expandedModule === module.slug;

                    return (
                      <div key={module.id} className="bg-background/50 rounded-lg overflow-hidden">
                        <button
                          onClick={() => setExpandedModule(isModuleExpanded ? null : module.slug)}
                          className="w-full p-4 flex items-start gap-4 hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex-1 text-left">
                            <h3 className="font-semibold">{module.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
                            <div className="mt-3">
                              <Progress value={module.progress} className="h-2" />
                            </div>
                          </div>
                          {isModuleExpanded ? (
                            <ChevronDown className="w-5 h-5 mt-1" />
                          ) : (
                            <ChevronRight className="w-5 h-5 mt-1" />
                          )}
                        </button>

                        {isModuleExpanded && (
                          <div className="border-t border-border p-4 space-y-2">
                            {module.lessons.map((lesson) => (
                              <div
                                key={lesson.id}
                                className="flex items-center justify-between p-3 bg-background rounded-lg hover:bg-muted/30 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  {lesson.completed ? (
                                    <CheckCircle2 className="w-5 h-5 text-cyber" />
                                  ) : (
                                    <Circle className="w-5 h-5 text-muted-foreground" />
                                  )}
                                  <span className={lesson.completed ? "text-muted-foreground" : ""}>
                                    {lesson.title}
                                  </span>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="gap-2"
                                  onClick={() => handleLessonToggle(lesson.id, !lesson.completed)}
                                >
                                  <Play className="w-4 h-4" />
                                  {lesson.completed ? "Revisar" : "Concluir"}
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
