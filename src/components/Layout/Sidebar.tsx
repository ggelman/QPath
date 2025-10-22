import { Home, BookOpen, FolderKanban, Map, Award } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/UserContext";
import { ProfileSwitcher } from "./ProfileSwitcher";

const navItems = [
  { icon: Home, label: "Dashboard", path: "/" },
  { icon: BookOpen, label: "Trilhas de Aprendizagem", path: "/trilhas" },
  { icon: FolderKanban, label: "Hub de Projetos", path: "/projetos" },
  { icon: Map, label: "Roadmap de Carreira", path: "/roadmap" },
  { icon: Award, label: "Perfil & Recompensas", path: "/perfil" },
];

export function Sidebar() {
  const location = useLocation();
  const { currentUser } = useUser();
  const xpPercentage = (currentUser.currentXP / currentUser.xpToNextLevel) * 100;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-semibold bg-gradient-to-r from-quantum via-software to-cyber bg-clip-text text-transparent">
          Q-Path
        </h1>
        <p className="text-xs text-muted-foreground mt-1">Quantum Career System</p>
      </div>

      {/* User Profile */}
      <div className="p-6 border-b border-border space-y-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
            currentUser.id === "giulia" 
              ? "bg-gradient-to-br from-quantum to-cyber" 
              : "bg-gradient-to-br from-software to-gold"
          }`}>
            {currentUser.avatar}
          </div>
          <div>
            <p className="font-semibold">{currentUser.name}</p>
            <p className="text-sm text-muted-foreground">Nível {currentUser.level}</p>
          </div>
        </div>
        
        {/* XP Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{currentUser.currentXP} XP</span>
            <span>{currentUser.xpToNextLevel} XP</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-gold to-quantum transition-all duration-500"
              style={{ width: `${xpPercentage}%` }}
            />
          </div>
        </div>

        {/* Profile Switcher */}
        <ProfileSwitcher />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border text-xs text-muted-foreground">
        <p>Objetivo: Especialista em</p>
        <p className="font-medium text-foreground">Software × Quantum × Security</p>
      </div>
    </aside>
  );
}
