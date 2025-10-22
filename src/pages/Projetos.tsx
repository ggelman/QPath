import { useState, useEffect } from "react";
import { FileText, Code, Rocket, CheckSquare, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ResearchTab } from "./Projetos/ResearchTab";
import { StartupTab } from "./Projetos/StartupTab";
import { useUser } from "@/contexts/UserContext";

const initialProjectContent = `# A Ameaça Quântica à Criptografia Atual

## Introdução
[Escreva uma introdução sobre o impacto da computação quântica na criptografia moderna...]

## Desenvolvimento

### Algoritmo de Shor
[Descreva como o algoritmo de Shor pode quebrar criptografia RSA...]

### Criptografia Pós-Quântica
[Explore as soluções sendo desenvolvidas...]

## Conclusão
[Resuma os pontos principais e proponha uma reflexão...]`;

const initialTasks = [
  { id: "1", text: "Pesquisar sobre o Algoritmo de Shor", completed: true },
  { id: "2", text: "Estudar protocolos de criptografia pós-quântica", completed: false },
  { id: "3", text: "Escrever introdução do artigo", completed: false },
  { id: "4", text: "Revisar gramática e clareza", completed: false },
];

export default function Projetos() {
  const { currentUser, isLoading: userLoading } = useUser();
  const [content, setContent] = useState(initialProjectContent);
  const [tasks, setTasks] = useState(initialTasks);
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      setContent(initialProjectContent);
      setTasks(initialTasks);
      return;
    }

    const contentKey = `qpath_portfolio_${currentUser.id}`;
    const tasksKey = `qpath_portfolio_tasks_${currentUser.id}`;

    try {
      const storedContent = localStorage.getItem(contentKey);
      setContent(storedContent || initialProjectContent);
    } catch (error) {
      console.error("Failed to load project content:", error);
      setContent(initialProjectContent);
    }

    try {
      const storedTasks = localStorage.getItem(tasksKey);
      setTasks(storedTasks ? JSON.parse(storedTasks) : initialTasks);
    } catch (error) {
      console.error("Failed to load project tasks:", error);
      setTasks(initialTasks);
    }
  }, [currentUser]);

  const toggleTask = (id: string) => {
    setTasks((prev) => {
      const newTasks = prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task));

      if (currentUser) {
        localStorage.setItem(`qpath_portfolio_tasks_${currentUser.id}`, JSON.stringify(newTasks));
      }

      return newTasks;
    });
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    if (currentUser) {
      localStorage.setItem(`qpath_portfolio_${currentUser.id}`, newContent);
    }
  };

  if (userLoading && !currentUser) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Hub de Projetos</h1>
          <p className="text-muted-foreground mt-1">Carregando dados do usuário...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Hub de Projetos</h1>
          <p className="text-muted-foreground mt-1">Faça login para acessar seus projetos.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Hub de Projetos</h1>
        <p className="text-muted-foreground mt-1">Onde o conhecimento é aplicado</p>
      </div>

      <Tabs defaultValue="portfolio" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="portfolio">
            <Code className="w-4 h-4 mr-2" />
            Projetos de Portfólio
          </TabsTrigger>
          <TabsTrigger value="research">
            <FileText className="w-4 h-4 mr-2" />
            Iniciação Científica
          </TabsTrigger>
          <TabsTrigger value="startup">
            <Rocket className="w-4 h-4 mr-2" />
            Startup: Q-Shield
          </TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio" className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Artigo: A Ameaça Quântica à Criptografia Atual</h2>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Editor/Preview */}
              <div className="md:col-span-2 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Conteúdo do Artigo</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPreview(!isPreview)}
                    className="gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    {isPreview ? "Editar" : "Visualizar"}
                  </Button>
                </div>

                {isPreview ? (
                  <div className="bg-background border border-border rounded-lg p-6 min-h-[500px] prose prose-invert max-w-none">
                    {content.split("\n").map((line, idx) => {
                      if (line.startsWith("# ")) {
                        return (
                          <h1 key={idx} className="text-3xl font-bold mt-6 mb-4">
                            {line.replace("# ", "")}
                          </h1>
                        );
                      }
                      if (line.startsWith("## ")) {
                        return (
                          <h2 key={idx} className="text-2xl font-semibold mt-5 mb-3">
                            {line.replace("## ", "")}
                          </h2>
                        );
                      }
                      if (line.startsWith("### ")) {
                        return (
                          <h3 key={idx} className="text-xl font-medium mt-4 mb-2">
                            {line.replace("### ", "")}
                          </h3>
                        );
                      }
                      if (line.trim() === "") {
                        return <br key={idx} />;
                      }
                      return (
                        <p key={idx} className="mb-3">
                          {line}
                        </p>
                      );
                    })}
                  </div>
                ) : (
                  <Textarea
                    value={content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    className="min-h-[500px] font-mono text-sm"
                    placeholder="Escreva seu artigo aqui..."
                  />
                )}

                <Button className="w-full bg-quantum hover:bg-quantum/90">
                  Analisar Escrita com IA
                </Button>
              </div>

              {/* Checklist */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <CheckSquare className="w-5 h-5 text-cyber" />
                  <h3 className="font-medium">Checklist de Tarefas</h3>
                </div>

                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-start gap-3 p-3 bg-background rounded-lg">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleTask(task.id)}
                        className="mt-1"
                      />
                      <span className={task.completed ? "line-through text-muted-foreground" : ""}>
                        {task.text}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Progresso: {tasks.filter((t) => t.completed).length} / {tasks.length} tarefas
                  </p>
                  <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyber transition-all duration-500"
                      style={{
                        width: `${(tasks.filter((t) => t.completed).length / tasks.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="research">
          <ResearchTab />
        </TabsContent>

        <TabsContent value="startup">
          <StartupTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
