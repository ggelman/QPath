import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface User {
  id: string;
  name: string;
  avatar: string;
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  role: "admin" | "guest";
}

interface UserContextType {
  currentUser: User;
  switchUser: (userId: string) => void;
  users: User[];
  updateUserXP: (xp: number) => void;
}

const defaultUsers: User[] = [
  {
    id: "giulia",
    name: "Giulia",
    avatar: "G",
    level: 8,
    currentXP: 4250,
    xpToNextLevel: 5000,
    role: "admin",
  },
  {
    id: "yasmin",
    name: "Yasmin",
    avatar: "Y",
    level: 1,
    currentXP: 0,
    xpToNextLevel: 1000,
    role: "guest",
  },
];

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(() => {
    const stored = localStorage.getItem("qpath_users");
    return stored ? JSON.parse(stored) : defaultUsers;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem("qpath_current_user") || "giulia";
  });

  const currentUser = users.find((u) => u.id === currentUserId) || users[0];

  useEffect(() => {
    localStorage.setItem("qpath_users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("qpath_current_user", currentUserId);
  }, [currentUserId]);

  const switchUser = (userId: string) => {
    setCurrentUserId(userId);
  };

  const updateUserXP = (xp: number) => {
    setUsers((prev) =>
      prev.map((user) => {
        if (user.id === currentUserId) {
          const newXP = user.currentXP + xp;
          let newLevel = user.level;
          let newCurrentXP = newXP;
          let newXpToNextLevel = user.xpToNextLevel;

          // Level up logic
          while (newCurrentXP >= newXpToNextLevel) {
            newCurrentXP -= newXpToNextLevel;
            newLevel++;
            newXpToNextLevel = Math.floor(newXpToNextLevel * 1.5);
          }

          return {
            ...user,
            level: newLevel,
            currentXP: newCurrentXP,
            xpToNextLevel: newXpToNextLevel,
          };
        }
        return user;
      })
    );
  };

  return (
    <UserContext.Provider value={{ currentUser, switchUser, users, updateUserXP }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
}
