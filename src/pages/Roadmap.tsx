import { useState } from "react";
import { MapPin, CheckCircle2, Circle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Milestone {
  id: string;
  date: string;
  title: string;
  description: string;
  status: "todo" | "progress" | "done";
  salary?: string;
}

const initialMilestones: Milestone[] = [
  {
    id: "1",
    date: "Dez 2025",
    title: "Obter Certificado Cambridge C1",
    description: "Certificação de proficiência em inglês nível C1",
    status: "progress",
  },
  {
    id: "2",
    date: "Jan 2027",
    title: "Início da Iniciação Científica",
    description: "Começar pesquisa em Segurança de Comunicações Quânticas",
    status: "progress",
  },
  {
    id: "3",
    date: "Jun 2027",
    title: "Formatura em Sistemas de Informação",
    description: "Conclusão do curso de graduação",
    status: "todo",
  },
  {
    id: "4",
    date: "Jul 2027",
    title: "Submissão de Artigo Acadêmico",
    description: "Submeter artigo para SBSEG/CBSoft sobre QKD e latência",
    status: "todo",
  },
  {
    id: "5",
    date: "T3 2027",
    title: "Salto de Carreira - Engenheira de Software Plena / AppSec",
    description: "Transição para posição plena com foco em segurança de aplicações",
    status: "todo",
    salary: "R$ 9.000/mês",
  },
  {
    id: "6",
    date: "Dez 2027",
    title: "Iniciar especialização em Quantum Security",
    description: "Mestrado ou especialização focada em segurança quântica",
    status: "todo",
  },
  {
    id: "7",
    date: "Jun 2028",
    title: "Aplicar para vagas no exterior",
    description: "Posições em EUA, Canadá ou Austrália",
    status: "todo",
    salary: "USD 85.000/ano",
  },
  {
    id: "8",
    date: "Dez 2028",
    title: "Conquistar posição de Quantum Security Engineer",
    description: "Especialista em segurança quântica em empresa internacional",
    status: "todo",
    salary: "USD 120.000/ano",
  },
];

export default function Roadmap() {
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>(() => {
    const stored = localStorage.getItem("qpath_roadmap_milestones");
    return stored ? JSON.parse(stored) : initialMilestones;
  });

  const updateMilestoneStatus = (id: string, status: Milestone["status"]) => {
    const newMilestones = milestones.map((m) => (m.id === id ? { ...m, status } : m));
    setMilestones(newMilestones);
    localStorage.setItem("qpath_roadmap_milestones", JSON.stringify(newMilestones));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "done":
        return <CheckCircle2 className="w-6 h-6 text-cyber" />;
      case "progress":
        return <Clock className="w-6 h-6 text-quantum" />;
      default:
        return <Circle className="w-6 h-6 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done":
        return "border-cyber bg-cyber/10";
      case "progress":
        return "border-quantum bg-quantum/10";
      default:
        return "border-border bg-card";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Roadmap de Carreira</h1>
        <p className="text-muted-foreground mt-1">
          Sua visão de longo prazo para se tornar especialista em Quantum Security
        </p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-quantum via-software to-cyber" />

        {/* Milestones */}
        <div className="space-y-8">
          {milestones.map((milestone, idx) => {
            const isSelected = selectedMilestone === milestone.id;

            return (
              <div key={milestone.id} className="relative pl-20">
                {/* Date Marker */}
                <div className="absolute left-0 top-0 flex items-center">
                  <div className="w-16 h-16 rounded-full border-4 border-background bg-card flex items-center justify-center">
                    {getStatusIcon(milestone.status)}
                  </div>
                </div>

                {/* Card */}
                <div
                  className={`border-2 rounded-xl p-6 transition-all cursor-pointer ${getStatusColor(
                    milestone.status
                  )} ${isSelected ? "shadow-lg scale-105" : "hover:shadow-md"}`}
                  onClick={() => setSelectedMilestone(isSelected ? null : milestone.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">
                          {milestone.date}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold">{milestone.title}</h3>
                    </div>
                    {milestone.salary && (
                      <div className="bg-gold/20 text-gold px-3 py-1 rounded-lg">
                        <p className="text-sm font-semibold">{milestone.salary}</p>
                      </div>
                    )}
                  </div>

                  <p className="text-muted-foreground mb-4">{milestone.description}</p>

                  {/* Status Selector */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={milestone.status === "todo" ? "default" : "outline"}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateMilestoneStatus(milestone.id, "todo");
                      }}
                    >
                      A Fazer
                    </Button>
                    <Button
                      size="sm"
                      variant={milestone.status === "progress" ? "default" : "outline"}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateMilestoneStatus(milestone.id, "progress");
                      }}
                      className={milestone.status === "progress" ? "bg-quantum hover:bg-quantum/90" : ""}
                    >
                      Em Andamento
                    </Button>
                    <Button
                      size="sm"
                      variant={milestone.status === "done" ? "default" : "outline"}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateMilestoneStatus(milestone.id, "done");
                      }}
                      className={milestone.status === "done" ? "bg-cyber hover:bg-cyber/90" : ""}
                    >
                      Concluído
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Resumo do Progresso</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-background rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Total de Marcos</p>
            <p className="text-3xl font-bold">{milestones.length}</p>
          </div>
          <div className="bg-background rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Em Andamento</p>
            <p className="text-3xl font-bold text-quantum">
              {milestones.filter((m) => m.status === "progress").length}
            </p>
          </div>
          <div className="bg-background rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Concluídos</p>
            <p className="text-3xl font-bold text-cyber">
              {milestones.filter((m) => m.status === "done").length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
