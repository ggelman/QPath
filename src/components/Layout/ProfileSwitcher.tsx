import { Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { useState } from "react";

const gradients = [
  "bg-gradient-to-br from-quantum to-cyber",
  "bg-gradient-to-br from-software to-gold",
  "bg-gradient-to-br from-cyber to-quantum",
];

export function ProfileSwitcher() {
  const { users, currentUser, switchUser, isLoading, error } = useUser();
  const [open, setOpen] = useState(false);

  const handleSwitch = (userId: string) => {
    switchUser(userId);
    setOpen(false);
  };

  const renderContent = () => {
    if (isLoading) {
      return <p className="text-sm text-muted-foreground">Carregando perfis...</p>;
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (!users.length || !currentUser) {
      return <p className="text-sm text-muted-foreground">Nenhum perfil disponível.</p>;
    }

    return (
      <div className="grid gap-3">
        {users.map((user, index) => {
          const isActive = currentUser.id === user.id;
          const gradient = gradients[index % gradients.length];

          return (
            <button
              key={user.id}
              onClick={() => handleSwitch(user.id)}
              className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                isActive
                  ? "border-quantum bg-quantum/10"
                  : "border-border hover:border-quantum/50 hover:bg-card"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${gradient}`}
              >
                {user.avatar}
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-muted-foreground">
                  Nível {user.level} • {Math.round(user.totalXP)} XP
                </p>
              </div>
              {isActive && (
                <div className="px-3 py-1 bg-quantum text-white text-xs rounded-full">Ativo</div>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full gap-2" disabled={!users.length && !isLoading}>
          <Users className="w-4 h-4" />
          Alternar Perfil
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Selecionar Perfil</DialogTitle>
          <DialogDescription>Escolha qual perfil você deseja usar</DialogDescription>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
