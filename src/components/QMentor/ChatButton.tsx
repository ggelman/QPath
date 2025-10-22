import { useState, useEffect } from "react";
import { MessageCircle, X, Send, Bot, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQMentor } from "@/hooks/useQMentor";
import { useAuth } from "@/hooks/useAuth";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function QMentorChat() {
  const { user } = useAuth();
  const { 
    isLoading, 
    error, 
    isAvailable, 
    askQuestion, 
    checkHealth
  } = useQMentor();
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: user?.full_name 
        ? `Olá, ${user.full_name}! Sou o Q-Mentor, seu assistente de carreira quântico-segura. Como posso ajudá-lo hoje?`
        : "Olá! Sou o Q-Mentor, seu assistente de carreira quântico-segura. Como posso ajudá-lo hoje?",
    },
  ]);
  const [input, setInput] = useState("");

  // Check Q-Mentor health on component mount
  useEffect(() => {
    if (isOpen) {
      checkHealth().catch(console.error);
    }
  }, [isOpen, checkHealth]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput("");

    try {
      // Ask Q-Mentor using the hook
      const response = await askQuestion(userInput);
      
      const aiMessage: Message = {
        role: "assistant",
        content: response.response || "Desculpe, não consegui processar sua pergunta no momento. Tente novamente.",
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error getting Q-Mentor response:", error);
      
      // Fallback to encouraging response if API fails
      const fallbackMessage: Message = {
        role: "assistant",
        content: "Desculpe, estou com dificuldades técnicas no momento. Que tal explorar os materiais de estudo na sua trilha atual enquanto isso?",
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-quantum to-cyber hover:from-quantum/90 hover:to-cyber/90 shadow-lg z-50"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-card border border-border rounded-xl shadow-2xl flex flex-col z-50">
          {/* Header */}
          <div className="p-4 border-b border-border bg-gradient-to-r from-quantum/10 to-cyber/10">
            <h3 className="font-semibold">Q-Mentor</h3>
            <p className="text-xs text-muted-foreground">Seu tutor socrático pessoal</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-4">
              <Alert variant="destructive">
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Availability Status */}
          {!isAvailable && !error && (
            <div className="p-4">
              <Alert>
                <Bot className="h-4 w-4" />
                <AlertDescription>
                  Q-Mentor está temporariamente indisponível. Tentando reconectar...
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={`message-${idx}`}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.role === "user"
                        ? "bg-quantum text-white"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !isLoading && handleSend()}
                placeholder="Digite sua dúvida..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button 
                onClick={handleSend} 
                size="icon" 
                className="bg-quantum hover:bg-quantum/90"
                disabled={isLoading || !input.trim()}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
