import { useState } from "react";
import { FileText, Upload, Calendar, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useUser } from "@/contexts/UserContext";

interface Task {
  id: string;
  text: string;
  status: "todo" | "progress" | "done";
}

interface PublicationMilestone {
  id: string;
  date: string;
  title: string;
  description: string;
  status: "upcoming" | "inProgress" | "completed";
  uploadedFile?: string;
}

const initialResearchTasks: Task[] = [
  { id: "1", text: "Revisão Bibliográfica", status: "todo" },
  { id: "2", text: "Levantamento de Dados (Métricas de Latência)", status: "todo" },
  { id: "3", text: "Análise de Resultados", status: "todo" },
  { id: "4", text: "Redação da Introdução", status: "todo" },
  { id: "5", text: "Redação da Metodologia", status: "todo" },
  { id: "6", text: "Redação dos Resultados", status: "todo" },
];

const publicationTimeline: PublicationMilestone[] = [
  {
    id: "1",
    date: "Jun 2027",
    title: "Envio de Resumo para SBSEG/CBSoft",
    description: "Submissão do resumo expandido do artigo de IC",
    status: "upcoming",
  },
  {
    id: "2",
    date: "Jul 2027",
    title: "Submissão do Paper Completo",
    description: "Envio do artigo completo para publicação",
    status: "upcoming",
  },
];

const initialContent = `# Análise de Segurança em Comunicações Quânticas: Um Estudo de Latência em Protocolos QKD

## Resumo
[Escreva um resumo de 150-250 palavras sobre o objetivo, metodologia e resultados esperados...]

## 1. Introdução

### 1.1 Contextualização
A distribuição quântica de chaves (QKD - Quantum Key Distribution) representa um dos avanços mais significativos em criptografia...

### 1.2 Problema de Pesquisa
[Defina claramente o problema que sua pesquisa aborda...]

### 1.3 Objetivos
**Objetivo Geral:** Avaliar o impacto da latência em protocolos QKD...

**Objetivos Específicos:**
- Analisar protocolos BB84 e E91
- Medir latência em diferentes cenários
- Propor otimizações

## 2. Fundamentação Teórica

### 2.1 Criptografia Pós-Quântica
[Desenvolvimento teórico...]

### 2.2 Protocolos QKD
[Detalhamento dos protocolos...]

## 3. Metodologia

### 3.1 Abordagem de Pesquisa
[Descreva a abordagem metodológica...]

### 3.2 Ferramentas e Tecnologias
- Qiskit para simulação
- Python para análise de dados
- [Outras ferramentas...]

## 4. Resultados Esperados
[Descreva os resultados que você espera obter...]

## 5. Conclusão
[Conclusões preliminares...]

## Referências
[1] Bennett, C. H., & Brassard, G. (1984). Quantum cryptography...`;

export function ResearchTab() {
  const { currentUser } = useUser();
  const [content, setContent] = useState(() => {
    const stored = localStorage.getItem(`qpath_research_${currentUser.id}`);
    return stored || initialContent;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const stored = localStorage.getItem(`qpath_research_tasks_${currentUser.id}`);
    return stored ? JSON.parse(stored) : initialResearchTasks;
  });

  const [milestones, setMilestones] = useState<PublicationMilestone[]>(publicationTimeline);
  const [aiAnalysis, setAiAnalysis] = useState<{
    clarityScore: number;
    suggestedOutline: string[];
    feedback: string;
  } | null>(null);

  const updateTask = (id: string, status: Task["status"]) => {
    const newTasks = tasks.map((task) => (task.id === id ? { ...task, status } : task));
    setTasks(newTasks);
    localStorage.setItem(`qpath_research_tasks_${currentUser.id}`, JSON.stringify(newTasks));
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    localStorage.setItem(`qpath_research_${currentUser.id}`, newContent);
  };

  const analyzeWriting = () => {
    // Simulação de análise de IA
    const wordCount = content.split(/\s+/).length;
    const sentenceCount = content.split(/[.!?]+/).length;
    const avgWordsPerSentence = wordCount / sentenceCount;

    const clarityScore = Math.min(95, Math.floor(75 + (20 - Math.abs(avgWordsPerSentence - 20)) * 2));

    setAiAnalysis({
      clarityScore,
      suggestedOutline: [
        "Expandir a seção de Resultados Esperados com métricas quantitativas",
        "Adicionar mais referências bibliográficas recentes (2022-2024)",
        "Incluir diagrama de arquitetura do experimento na Metodologia",
        "Fortalecer a argumentação sobre a relevância prática da pesquisa",
      ],
      feedback:
        "Sua argumentação está sólida, mas considere adicionar mais dados quantitativos na seção de metodologia. A estrutura está bem organizada para um paper acadêmico.",
    });
  };

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "done":
        return <CheckCircle2 className="w-5 h-5 text-cyber" />;
      case "progress":
        return <Clock className="w-5 h-5 text-quantum" />;
      default:
        return <AlertCircle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getMilestoneIcon = (status: PublicationMilestone["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-6 h-6 text-cyber" />;
      case "inProgress":
        return <Clock className="w-6 h-6 text-quantum" />;
      default:
        return <Calendar className="w-6 h-6 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Iniciação Científica</h2>
          <p className="text-muted-foreground text-sm">
            Artigo: Análise de Segurança em Comunicações Quânticas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Upload className="w-4 h-4" />
            Exportar PDF
          </Button>
          <Button variant="outline" className="gap-2">
            <Upload className="w-4 h-4" />
            Exportar DOCX
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Editor */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-quantum" />
              Editor de Artigo Acadêmico
            </h3>
            <Textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              className="min-h-[600px] font-mono text-sm"
              placeholder="Escreva seu artigo científico aqui..."
            />
            <div className="mt-4 flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {content.split(/\s+/).length} palavras
              </p>
              <Button onClick={analyzeWriting} className="bg-quantum hover:bg-quantum/90">
                Analisar Escrita com IA
              </Button>
            </div>
          </div>

          {/* AI Analysis Results */}
          {aiAnalysis && (
            <div className="bg-card border border-quantum/50 rounded-xl p-6">
              <h3 className="font-semibold mb-4 text-quantum">Análise de Escrita - Q-Mentor</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Score de Clareza</span>
                    <span className="text-2xl font-bold text-quantum">{aiAnalysis.clarityScore}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-quantum transition-all duration-500"
                      style={{ width: `${aiAnalysis.clarityScore}%` }}
                    />
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Feedback Geral</p>
                  <p className="text-sm text-muted-foreground">{aiAnalysis.feedback}</p>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Sugestões de Melhoria</p>
                  <ul className="space-y-2">
                    {aiAnalysis.suggestedOutline.map((suggestion, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-quantum">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Task Checklist */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold mb-4">Checklist de Produção</h3>
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-start gap-3 p-3 bg-background rounded-lg">
                  <div className="mt-1">{getStatusIcon(task.status)}</div>
                  <div className="flex-1">
                    <p className={`text-sm ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                      {task.text}
                    </p>
                    <div className="flex gap-1 mt-2">
                      <Button
                        size="sm"
                        variant={task.status === "todo" ? "default" : "ghost"}
                        onClick={() => updateTask(task.id, "todo")}
                        className="h-6 text-xs"
                      >
                        To Do
                      </Button>
                      <Button
                        size="sm"
                        variant={task.status === "progress" ? "default" : "ghost"}
                        onClick={() => updateTask(task.id, "progress")}
                        className={`h-6 text-xs ${task.status === "progress" ? "bg-quantum hover:bg-quantum/90" : ""}`}
                      >
                        Andamento
                      </Button>
                      <Button
                        size="sm"
                        variant={task.status === "done" ? "default" : "ghost"}
                        onClick={() => updateTask(task.id, "done")}
                        className={`h-6 text-xs ${task.status === "done" ? "bg-cyber hover:bg-cyber/90" : ""}`}
                      >
                        Feito
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Progresso: {tasks.filter((t) => t.status === "done").length} / {tasks.length}
              </p>
            </div>
          </div>

          {/* Publication Timeline */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold mb-4">Linha do Tempo de Publicação</h3>
            <div className="space-y-4">
              {milestones.map((milestone) => (
                <div key={milestone.id} className="space-y-2">
                  <div className="flex items-start gap-3">
                    {getMilestoneIcon(milestone.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground">{milestone.date}</span>
                      </div>
                      <p className="font-medium text-sm">{milestone.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{milestone.description}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full gap-2">
                    <Upload className="w-3 h-3" />
                    Anexar Arquivo
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
