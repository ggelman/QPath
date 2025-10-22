import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Sidebar } from "@/components/Layout/Sidebar";
import { QMentorChat } from "@/components/QMentor/ChatButton";
import { UserProvider } from "@/contexts/UserContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Dashboard from "./pages/Dashboard";
import Trilhas from "./pages/Trilhas";
import Projetos from "./pages/Projetos";
import Roadmap from "./pages/Roadmap";
import Perfil from "./pages/Perfil";

const queryClient = new QueryClient();

const App = () => {

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
            <div className="min-h-screen w-full flex bg-background text-foreground">
              <Sidebar />
              
              <main className="flex-1 ml-64 p-8">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/trilhas" element={<Trilhas />} />
                  <Route path="/projetos" element={<Projetos />} />
                  <Route path="/roadmap" element={<Roadmap />} />
                  <Route path="/perfil" element={<Perfil />} />
                </Routes>
              </main>

              <QMentorChat />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </UserProvider>
    </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
