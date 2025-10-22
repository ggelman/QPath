import { Trophy, Star, Zap, Award, Gift, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCallback, useEffect, useMemo, useState } from "react";
import apiService, { Achievement, ProfileDetails, UserReward } from "@/services/api";

const achievementIcons: Record<string, typeof Zap> = {
  first_pomodoro: Zap,
  crypto_master: Star,
  hundred_hours: Trophy,
  weekly_master: Award,
  lesson_hunter: Trophy,
};

export default function Perfil() {
  const [profile, setProfile] = useState<ProfileDetails | null>(null);
  const [rewards, setRewards] = useState<UserReward[]>([]);
  const [newReward, setNewReward] = useState({ condition: "", reward: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const migrateLegacyRewards = useCallback(async () => {
    const legacy =
      localStorage.getItem("qpath_profile_rewards") ?? localStorage.getItem("qpath_rewards");
    if (!legacy) {
      return false;
    }

    let migrated = false;

    try {
      const parsed = JSON.parse(legacy) as unknown;
      const isRecord = (value: unknown): value is Record<string, unknown> =>
        typeof value === "object" && value !== null;

      if (Array.isArray(parsed)) {
        for (const rawItem of parsed) {
          if (!isRecord(rawItem)) {
            continue;
          }

          const conditionValue = rawItem["condition"];
          const rewardValue = rawItem["reward"];
          if (typeof conditionValue === "string" && typeof rewardValue === "string") {
            await apiService.createReward({
              condition: conditionValue,
              reward: rewardValue,
            });
            migrated = true;
          }
        }
      }
    } catch (migrationError) {
      console.warn("Failed to migrate legacy rewards", migrationError);
    } finally {
      localStorage.removeItem("qpath_profile_rewards");
      localStorage.removeItem("qpath_rewards");
    }

    return migrated;
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const migrated = await migrateLegacyRewards();
      if (migrated) {
        // Allow backend to persist before fetching fresh data
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      const data = await apiService.getProfileDetails();
      setProfile(data);
      setRewards(data.rewards);
    } catch (err) {
      console.error("Failed to load profile details", err);
      setError("Não foi possível carregar os dados do perfil.");
    } finally {
      setIsLoading(false);
    }
  }, [migrateLegacyRewards]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleAddReward = async () => {
    if (!newReward.condition || !newReward.reward) {
      return;
    }

    try {
      const created = await apiService.createReward({
        condition: newReward.condition,
        reward: newReward.reward,
      });
      setRewards((prev) => [...prev, created]);
      setNewReward({ condition: "", reward: "" });
    } catch (err) {
      console.error("Failed to create reward", err);
      setError("Não foi possível criar a recompensa. Tente novamente.");
    }
  };

  const achievements = useMemo<Achievement[]>(() => profile?.achievements ?? [], [profile]);
  const stats = profile?.stats;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Perfil &amp; Recompensas</h1>
        <p className="text-muted-foreground mt-1">Carregando dados do perfil...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Perfil &amp; Recompensas</h1>
        <p className="text-muted-foreground mt-1">{error ?? "Nenhum dado disponível."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Perfil &amp; Recompensas</h1>
        <p className="text-muted-foreground mt-1">Celebre suas conquistas e defina recompensas</p>
        {error && <p className="text-sm text-destructive mt-2">{error}</p>}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6">Estatísticas</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-quantum/20 to-quantum/5 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Total XP</p>
                <p className="text-3xl font-bold text-quantum">{profile.profile.total_xp.toLocaleString()}</p>
              </div>
              <div className="bg-gradient-to-br from-cyber/20 to-cyber/5 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Nível Atual</p>
                <p className="text-3xl font-bold text-cyber">{stats?.current_level ?? profile.profile.current_level}</p>
              </div>
              <div className="bg-gradient-to-br from-software/20 to-software/5 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Horas de Estudo</p>
                <p className="text-3xl font-bold text-software">{stats?.total_hours ?? 0}h</p>
              </div>
              <div className="bg-gradient-to-br from-gold/20 to-gold/5 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Lições Completadas</p>
                <p className="text-3xl font-bold text-gold">{stats?.completed_lessons ?? 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Trophy className="w-5 h-5 text-gold" />
              <h2 className="text-xl font-semibold">Conquistas</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {achievements.map((achievement) => {
                const Icon = achievementIcons[achievement.id] ?? Award;
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

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Gift className="w-5 h-5 text-quantum" />
            <h2 className="text-xl font-semibold">Recompensas Personalizadas</h2>
          </div>

          <div className="space-y-3 mb-6">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className={`p-4 rounded-lg border ${
                  reward.achieved ? "border-cyber bg-cyber/10" : "border-border bg-background"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Quando: {reward.condition}
                  </p>
                  {reward.achieved && <Award className="w-4 h-4 text-cyber" />}
                </div>
                <p className="font-semibold">{reward.reward}</p>
              </div>
            ))}
          </div>

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
