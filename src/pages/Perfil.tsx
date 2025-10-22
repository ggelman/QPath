import { Trophy, Star, Zap, Award, Gift, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const achievements = [
  { id: "1", name: "Primeiro Circuito Quântico", icon: Zap, unlocked: true },
  { id: "2", name: "Módulo de Criptografia Concluído", icon: Star, unlocked: true },
  { id: "3", name: "100h de Foco", icon: Trophy, unlocked: false },
  { id: "4", name: "Mestre da Semana", icon: Award, unlocked: false },
];

const initialRewards = [
  { id: "1", condition: "Nível 10", reward: "Comprar um livro novo", achieved: false },
  { id: "2", condition: "Completar módulo Quantum", reward: "Uma tarde livre de estudos", achieved: false },
];

export default function Perfil() {
  const [rewards, setRewards] = useState(initialRewards);
  const [newReward, setNewReward] = useState({ condition: "", reward: "" });

  const totalXP = 4250;
  const totalHours = 87;
  const completedLessons = 23;
  const currentLevel = 8;

  const handleAddReward = () => {
    if (newReward.condition && newReward.reward) {
      setRewards((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          condition: newReward.condition,
          reward: newReward.reward,
          achieved: false,
        },
      ]);
      setNewReward({ condition: "", reward: "" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Perfil & Recompensas</h1>
        <p className="text-muted-foreground mt-1">Celebre suas conquistas e defina recompensas</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Stats & Achievements */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6">Estatísticas</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-quantum/20 to-quantum/5 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Total XP</p>
                <p className="text-3xl font-bold text-quantum">{totalXP.toLocaleString()}</p>
              </div>
              <div className="bg-gradient-to-br from-cyber/20 to-cyber/5 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Nível Atual</p>
                <p className="text-3xl font-bold text-cyber">{currentLevel}</p>
              </div>
              <div className="bg-gradient-to-br from-software/20 to-software/5 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Horas de Estudo</p>
                <p className="text-3xl font-bold text-software">{totalHours}h</p>
              </div>
              <div className="bg-gradient-to-br from-gold/20 to-gold/5 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Lições Completadas</p>
                <p className="text-3xl font-bold text-gold">{completedLessons}</p>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Trophy className="w-5 h-5 text-gold" />
              <h2 className="text-xl font-semibold">Conquistas</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {achievements.map((achievement) => {
                const Icon = achievement.icon;
                return (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      achievement.unlocked
                        ? "border-gold bg-gold/10"
                        : "border-border bg-background opacity-50"
                    }`}
                  >
                    <Icon
                      className={`w-8 h-8 mx-auto mb-2 ${
                        achievement.unlocked ? "text-gold" : "text-muted-foreground"
                      }`}
                    />
                    <p className="text-xs text-center font-medium">{achievement.name}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Personal Rewards */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Gift className="w-5 h-5 text-quantum" />
            <h2 className="text-xl font-semibold">Recompensas Personalizadas</h2>
          </div>

          {/* Existing Rewards */}
          <div className="space-y-3 mb-6">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className={`p-4 rounded-lg border ${
                  reward.achieved
                    ? "border-cyber bg-cyber/10"
                    : "border-border bg-background"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Quando: {reward.condition}
                  </p>
                  {reward.achieved && (
                    <Award className="w-4 h-4 text-cyber" />
                  )}
                </div>
                <p className="font-semibold">{reward.reward}</p>
              </div>
            ))}
          </div>

          {/* Add New Reward */}
          <div className="border-t border-border pt-6 space-y-4">
            <h3 className="font-medium">Criar Nova Recompensa</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Condição (ex: "Nível 15")
                </label>
                <Input
                  value={newReward.condition}
                  onChange={(e) => setNewReward({ ...newReward, condition: e.target.value })}
                  placeholder="Se eu alcançar..."
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Recompensa
                </label>
                <Input
                  value={newReward.reward}
                  onChange={(e) => setNewReward({ ...newReward, reward: e.target.value })}
                  placeholder="Então eu vou..."
                />
              </div>
              <Button
                onClick={handleAddReward}
                className="w-full gap-2 bg-quantum hover:bg-quantum/90"
              >
                <Plus className="w-4 h-4" />
                Adicionar Recompensa
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
