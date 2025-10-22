import { useState } from "react";
import { ChevronDown, ChevronRight, CheckCircle2, Circle, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface Lesson {
  id: string;
  title: string;
  completed: boolean;
}

interface Module {
  id: string;
  title: string;
  description: string;
  progress: number;
  lessons: Lesson[];
}

interface Track {
  id: string;
  name: string;
  color: string;
  modules: Module[];
}

const tracks: Track[] = [
  {
    id: "quantum",
    name: "Computação Quântica",
    color: "quantum",
    modules: [
      {
        id: "q1",
        title: "Fundamentos Matemáticos",
        description: "Vetores, Matrizes e Probabilidade para Quantum",
        progress: 33,
        lessons: [
          { id: "q1l1", title: "Introdução a Vetores", completed: true },
          { id: "q1l2", title: "Operações com Matrizes", completed: false },
          { id: "q1l3", title: "Probabilidade Básica", completed: false },
        ],
      },
    ],
  },
  {
    id: "security",
    name: "Cybersecurity",
    color: "cyber",
    modules: [
      {
        id: "s1",
        title: "Criptografia Essencial",
        description: "Fundamentos de Criptografia Simétrica e Assimétrica",
        progress: 50,
        lessons: [
          { id: "s1l1", title: "Criptografia Simétrica", completed: true },
          { id: "s1l2", title: "Criptografia Assimétrica - RSA", completed: false },
        ],
      },
    ],
  },
  {
    id: "english",
    name: "Inglês C1",
    color: "gold",
    modules: [
      {
        id: "e1",
        title: "Writing - Essay Structure",
        description: "Como estruturar redações para o exame Cambridge C1",
        progress: 25,
        lessons: [
          { id: "e1l1", title: "Estrutura básica de Essay", completed: false },
          { id: "e1l2", title: "Argumentação e Desenvolvimento", completed: false },
          { id: "e1l3", title: "Conclusões efetivas", completed: false },
          { id: "e1l4", title: "Prática: Essay completo", completed: false },
        ],
      },
    ],
  },
  {
    id: "software",
    name: "Software Development",
    color: "software",
    modules: [
      {
        id: "sw1",
        title: "Arquitetura de Software",
        description: "Padrões de design e boas práticas",
        progress: 0,
        lessons: [
          { id: "sw1l1", title: "SOLID Principles", completed: false },
          { id: "sw1l2", title: "Design Patterns", completed: false },
        ],
      },
    ],
  },
];

export default function Trilhas() {
  const [expandedTrack, setExpandedTrack] = useState<string | null>("quantum");
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Trilhas de Aprendizagem</h1>
        <p className="text-muted-foreground mt-1">Seu caminho estruturado para o conhecimento</p>
      </div>

      <div className="space-y-4">
        {tracks.map((track) => {
          const isExpanded = expandedTrack === track.id;
          const totalLessons = track.modules.reduce((sum, m) => sum + m.lessons.length, 0);
          const completedLessons = track.modules.reduce(
            (sum, m) => sum + m.lessons.filter((l) => l.completed).length,
            0
          );
          const trackProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

          return (
            <div key={track.id} className="bg-card border border-border rounded-xl overflow-hidden">
              {/* Track Header */}
              <button
                onClick={() => setExpandedTrack(isExpanded ? null : track.id)}
                className="w-full p-6 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  <div className="text-left">
                    <h2 className={`text-xl font-semibold text-${track.color}`}>{track.name}</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {completedLessons} de {totalLessons} lições completadas
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{Math.round(trackProgress)}%</p>
                </div>
              </button>

              {/* Modules */}
              {isExpanded && (
                <div className="border-t border-border p-4 space-y-4">
                  {track.modules.map((module) => {
                    const isModuleExpanded = expandedModule === module.id;

                    return (
                      <div key={module.id} className="bg-background/50 rounded-lg overflow-hidden">
                        {/* Module Header */}
                        <button
                          onClick={() => setExpandedModule(isModuleExpanded ? null : module.id)}
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

                        {/* Lessons */}
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
                                <Button size="sm" variant="ghost" className="gap-2">
                                  <Play className="w-4 h-4" />
                                  {lesson.completed ? "Revisar" : "Iniciar"}
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
