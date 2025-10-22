import { useState, useEffect } from "react";
import { FileText, Upload, Calendar, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  const { currentUser, isLoading: userLoading } = useUser();
  const [content, setContent] = useState(initialContent);
  const [tasks, setTasks] = useState<Task[]>(initialResearchTasks);
  const milestones = publicationTimeline;
  const [aiAnalysis, setAiAnalysis] = useState<{
    clarityScore: number;
    suggestedOutline: string[];
    feedback: string;
  } | null>(null);

  useEffect(() => {
    if (!currentUser) {
      setContent(initialContent);
      setTasks(initialResearchTasks);
      return;
    }

    const contentKey = `qpath_research_${currentUser.id}`;
    const tasksKey = `qpath_research_tasks_${currentUser.id}`;

    try {
      const storedContent = localStorage.getItem(contentKey);
      setContent(storedContent || initialContent);
    } catch (error) {
      console.error("Failed to load research content:", error);
      setContent(initialContent);
    }

    try {
      const storedTasks = localStorage.getItem(tasksKey);
      setTasks(storedTasks ? JSON.parse(storedTasks) : initialResearchTasks);
    } catch (error) {
      console.error("Failed to load research tasks:", error);
      setTasks(initialResearchTasks);
    }
  }, [currentUser]);

  const updateTask = (id: string, status: Task["status"]) => {
    setTasks((prev) => {
      const newTasks = prev.map((task) => (task.id === id ? { ...task, status } : task));

      if (currentUser) {
        localStorage.setItem(`qpath_research_tasks_${currentUser.id}`, JSON.stringify(newTasks));
      }

      return newTasks;
    });
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    if (currentUser) {
      localStorage.setItem(`qpath_research_${currentUser.id}`, newContent);
    }
  };

  const analyzeWriting = () => {
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

  if (userLoading && !currentUser) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Iniciação Científica</h2>
        <p className="text-muted-foreground">Carregando dados do usuário...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Iniciação Científica</h2>
        <p className="text-muted-foreground">Faça login para acompanhar sua pesquisa.</p>
      </div>
    );
  }

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
              className="min-h-[500px] font-mono text-sm"
              placeholder="Escreva seu artigo aqui..."
            />
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={analyzeWriting}>
                Analisar com IA
              </Button>
            </div>
          </div>

          {aiAnalysis && (
            <div className="bg-quantum/10 border border-quantum/30 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-quantum" />
                <div>
                  <h4 className="font-semibold">Análise de Clareza</h4>
                  <p className="text-sm text-muted-foreground">
                    Seu texto tem um score de clareza {aiAnalysis.clarityScore}/100
                  </p>
                </div>
              </div>
              <div>
                <h5 className="font-medium mb-2">Sugestões de Estrutura</h5>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {aiAnalysis.suggestedOutline.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>{aiAnalysis.feedback}</p>
              </div>
            </div>
          )}
        </div>

        {/* Tasks */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-quantum" />
              Roadmap da Pesquisa
            </h3>
            <div className="space-y-3">
              {milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className="border border-border rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-center gap-3">
                    {getMilestoneIcon(milestone.status)}
                    <div>
                      <p className="font-semibold">{milestone.title}</p>
                      <p className="text-sm text-muted-foreground">{milestone.date}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{milestone.description}</p>
                  {milestone.uploadedFile && (
                    <p className="text-xs text-quantum">Arquivo enviado: {milestone.uploadedFile}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyber" />
              Tarefas da Pesquisa
            </h3>
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="border border-border rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(task.status)}
                    <div>
                      <p className="font-medium">{task.text}</p>
                      <p className="text-xs text-muted-foreground">Status: {task.status}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateTask(task.id, "todo")}
                    >
                      To-do
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateTask(task.id, "progress")}
                    >
                      Em Progresso
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateTask(task.id, "done")}
                    >
                      Concluído
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
