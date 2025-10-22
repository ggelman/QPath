import { useState } from "react";
import { Rocket, Lightbulb, Code, Map, TrendingUp } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";

interface Section {
  id: string;
  title: string;
  icon: any;
  placeholder: string;
}

const sections: Section[] = [
  {
    id: "problem",
    title: "Dor de Mercado",
    icon: Lightbulb,
    placeholder:
      "Descreva o problema que a Q-Shield resolve...\n\nEx: Empresas de logística enfrentam dificuldades em proteger comunicações sensíveis entre centros de distribuição, tornando-se vulneráveis a ataques de interceptação...",
  },
  {
    id: "solution",
    title: "Solução Proposta",
    icon: Rocket,
    placeholder:
      "Explique como a Q-Shield soluciona o problema...\n\nEx: Q-Shield é uma plataforma de comunicação segura baseada em QKD (Quantum Key Distribution) que garante proteção contra ataques quânticos...",
  },
  {
    id: "architecture",
    title: "Arquitetura Técnica",
    icon: Code,
    placeholder:
      "Descreva a arquitetura do sistema...\n\nComponentes principais:\n- Frontend: React + TypeScript\n- Backend: Python + FastAPI\n- QKD Engine: Qiskit\n- Database: PostgreSQL\n- Infraestrutura: AWS/Azure\n\nFluxo de dados:\n1. [Descreva o fluxo...]",
  },
  {
    id: "roadmap",
    title: "Roadmap de Desenvolvimento",
    icon: Map,
    placeholder:
      "Planeje as fases de desenvolvimento...\n\n**Fase 1 (Q1 2027):** MVP com simulação QKD\n**Fase 2 (Q2 2027):** Integração com hardware quântico\n**Fase 3 (Q3 2027):** Beta com clientes piloto\n**Fase 4 (Q4 2027):** Lançamento comercial",
  },
  {
    id: "market",
    title: "Modelo de Negócio",
    icon: TrendingUp,
    placeholder:
      "Defina o modelo de receita e mercado-alvo...\n\nMercado-alvo: Empresas de logística de médio a grande porte\n\nModelo de receita:\n- SaaS: R$ 5.000/mês por empresa\n- Implementação: R$ 50.000 inicial\n- Suporte premium: R$ 2.000/mês",
  },
];

export function StartupTab() {
  const { currentUser } = useUser();
  const [sectionContents, setSectionContents] = useState<Record<string, string>>(() => {
    const stored = localStorage.getItem(`qpath_startup_${currentUser.id}`);
    if (stored) return JSON.parse(stored);

    return sections.reduce((acc, section) => {
      acc[section.id] = "";
      return acc;
    }, {} as Record<string, string>);
  });

  const updateSection = (sectionId: string, content: string) => {
    const newContents = { ...sectionContents, [sectionId]: content };
    setSectionContents(newContents);
    localStorage.setItem(`qpath_startup_${currentUser.id}`, JSON.stringify(newContents));
  };

  const totalProgress = Object.values(sectionContents).filter((c) => c.trim().length > 50).length;
  const progressPercentage = (totalProgress / sections.length) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Rocket className="w-7 h-7 text-quantum" />
            Q-Shield Logistics - MVP
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Plataforma de Comunicação Segura com QKD para Logística
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 min-w-[200px]">
          <p className="text-xs text-muted-foreground mb-2">Progresso Geral</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-quantum to-cyber transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span className="text-sm font-semibold">{totalProgress}/{sections.length}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {sections.map((section) => {
          const Icon = section.icon;
          const hasContent = sectionContents[section.id]?.trim().length > 50;

          return (
            <div key={section.id} className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${hasContent ? "bg-cyber/20" : "bg-muted"}`}>
                  <Icon className={`w-5 h-5 ${hasContent ? "text-cyber" : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{section.title}</h3>
                  {hasContent && (
                    <p className="text-xs text-cyber">✓ Seção preenchida</p>
                  )}
                </div>
              </div>

              <Textarea
                value={sectionContents[section.id]}
                onChange={(e) => updateSection(section.id, e.target.value)}
                placeholder={section.placeholder}
                className="min-h-[200px] font-mono text-sm"
              />

              <div className="mt-3 flex justify-between items-center">
                <p className="text-xs text-muted-foreground">
                  {sectionContents[section.id]?.split(/\s+/).filter(Boolean).length || 0} palavras
                </p>
                {!hasContent && (
                  <p className="text-xs text-muted-foreground">Mínimo recomendado: 50 palavras</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-quantum/10 border border-quantum/50 rounded-xl p-6">
        <h3 className="font-semibold mb-2 text-quantum">💡 Dica do Q-Mentor</h3>
        <p className="text-sm text-muted-foreground">
          Para uma proposta de startup sólida, seja específico nos problemas que você resolve e nos
          números do mercado. Investidores querem ver validação e potencial de escala.
        </p>
      </div>
    </div>
  );
}
