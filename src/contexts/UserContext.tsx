import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { apiService, GamificationProfile, UserRole, User } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  level: number;
  levelName: GamificationProfile['current_level'];
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
  remainingXP: number;
}

interface UserContextType {
  currentUser: UserProfile | null;
  users: UserProfile[];
  isLoading: boolean;
  error: string | null;
  switchUser: (userId: string) => void;
  updateUserXP: (xp: number) => void;
  refreshProfiles: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const LEVEL_TABLE: Array<{ level: number; min: number; max: number | null; name: GamificationProfile['current_level'] }> = [
  { level: 1, min: 0, max: 999, name: 'iniciante' },
  { level: 2, min: 1000, max: 2999, name: 'explorador' },
  { level: 3, min: 3000, max: 6999, name: 'especialista' },
  { level: 4, min: 7000, max: 14999, name: 'mestre' },
  { level: 5, min: 15000, max: null, name: 'quantum_guardian' },
];

const computeGamificationStats = (profile?: GamificationProfile) => {
  const totalXp = profile?.total_xp ?? 0;
  const match = LEVEL_TABLE.find((item) =>
    totalXp >= item.min && (item.max === null || totalXp <= item.max)
  ) ?? LEVEL_TABLE[0];

  const nextLevel = LEVEL_TABLE[LEVEL_TABLE.indexOf(match) + 1];
  const xpIntoLevel = totalXp - match.min;
  const xpTarget = nextLevel ? nextLevel.min - match.min : xpIntoLevel || 1;
  const xpToNextLevel = nextLevel ? nextLevel.min - totalXp : 0;

  return {
    level: match.level,
    levelName: match.name,
    currentXP: xpIntoLevel,
    xpToNextLevel: xpTarget,
    totalXP: totalXp,
    remainingToNext: xpToNextLevel,
  };
};

const createUserProfile = (user: User, profile?: GamificationProfile): UserProfile => {
  const fullName = user.full_name?.trim() || user.username;
  const avatar = fullName ? fullName.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase();
  const stats = computeGamificationStats(profile);

  return {
    id: String(user.id),
    name: fullName,
    email: user.email,
    avatar,
    role: user.role,
    level: stats.level,
    levelName: stats.levelName,
    currentXP: stats.currentXP,
    xpToNextLevel: stats.xpToNextLevel,
    totalXP: stats.totalXP,
    remainingXP: stats.remainingToNext,
  };
};

export function UserProvider({ children }: { children: ReactNode }) {
  const { user: authUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentUser = users.find((u) => u.id === currentUserId) ?? users[0] ?? null;

  const loadProfiles = useCallback(async () => {
    if (!authUser) {
      setUsers([]);
      setCurrentUserId(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [gamification, additionalUsers] = await Promise.all([
        apiService.getGamificationProfile().catch(() => null),
        authUser.role === 'admin' ? apiService.getUsers(0, 20).catch(() => null) : Promise.resolve(null),
      ]);

      const primaryProfile = createUserProfile(authUser, gamification ?? undefined);
      const profiles: UserProfile[] = [primaryProfile];

      if (additionalUsers && Array.isArray(additionalUsers)) {
        additionalUsers
          .filter((u) => u.id !== authUser.id)
          .forEach((otherUser) => {
            profiles.push(createUserProfile(otherUser));
          });
      }

      setUsers(profiles);
      setCurrentUserId(primaryProfile.id);
    } catch (err) {
      console.error('Failed to load user profiles:', err);
      setError('Não foi possível carregar os perfis do usuário.');
      const fallbackProfile = createUserProfile(authUser);
      setUsers([fallbackProfile]);
      setCurrentUserId(fallbackProfile.id);
    } finally {
      setIsLoading(false);
    }
  }, [authUser]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated || !authUser) {
      setUsers([]);
      setCurrentUserId(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    void loadProfiles();
  }, [authLoading, isAuthenticated, authUser, loadProfiles]);

  const switchUser = (userId: string) => {
    setCurrentUserId(userId);
  };

  const updateUserXP = (xp: number) => {
    if (!currentUserId) {
      return;
    }

    setUsers((prev) =>
      prev.map((profile) => {
        if (profile.id !== currentUserId) {
          return profile;
        }

        const updatedTotalXP = profile.totalXP + xp;
        const updatedStats = computeGamificationStats({
          id: Number(profile.id),
          user_id: Number(profile.id),
          total_xp: updatedTotalXP,
          current_level: profile.levelName,
          current_streak: 0,
          longest_streak: 0,
          completed_trilhas: 0,
          completed_projects: 0,
          pomodoro_sessions: 0,
          last_activity_date: null,
          created_at: '',
          updated_at: '',
        } as GamificationProfile);

        return {
          ...profile,
          level: updatedStats.level,
          levelName: updatedStats.levelName,
          currentXP: updatedStats.currentXP,
          xpToNextLevel: updatedStats.xpToNextLevel,
          totalXP: updatedTotalXP,
          remainingXP: updatedStats.remainingToNext,
        };
      })
    );
  };

  const refreshProfiles = useCallback(async () => {
    await loadProfiles();
  }, [loadProfiles]);

  return (
    <UserContext.Provider
      value={{
        currentUser,
        users,
        isLoading,
        error,
        switchUser,
        updateUserXP,
        refreshProfiles,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}
