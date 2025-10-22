/**
 * Authentication Context for Q-Path
 * Manages user authentication state and provides auth methods
 */
import React, {
  createContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import {
  apiService,
  User,
  AuthSession,
  ApiError,
} from '../services/api';

interface RegisterData {
  username: string;
  email: string;
  password: string;
  full_name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleAuthError = useCallback((err: unknown) => {
    if (err instanceof ApiError) {
      if (err.status === 401) {
        setError(err.message || 'Sessão expirada. Faça login novamente.');
      } else {
        setError(err.message);
      }
    } else if (err instanceof Error) {
      setError(err.message);
    } else {
      setError('Erro inesperado durante a autenticação.');
    }
  }, []);

  const initializeAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      clearError();

      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      if (!storedToken) {
        setUser(null);
        return;
      }

      const currentUser = await apiService.getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      handleAuthError(err);
      apiService.clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [clearError, handleAuthError]);

  useEffect(() => {
    void initializeAuth();
  }, [initializeAuth]);

  const login = useCallback(async (username: string, password: string) => {
    setIsLoading(true);
    try {
      clearError();
      const session: AuthSession = await apiService.login(username, password);
      setUser(session.user);
    } catch (err) {
      handleAuthError(err);
      apiService.clearTokens();
      setUser(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [clearError, handleAuthError]);

  const register = useCallback(async (userData: RegisterData) => {
    setIsLoading(true);
    try {
      clearError();
      await apiService.register(userData);
      await login(userData.username, userData.password);
    } catch (err) {
      handleAuthError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [clearError, handleAuthError, login]);

  const logout = useCallback(async () => {
    try {
      await apiService.logout();
    } catch (err) {
      // Still clear tokens locally even if API request fails
      console.error('Logout error:', err);
    } finally {
      apiService.clearTokens();
      setUser(null);
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    try {
      clearError();
      const session: AuthSession = await apiService.refreshSession();
      setUser(session.user);
    } catch (err) {
      handleAuthError(err);
      await logout();
      throw err;
    }
  }, [clearError, handleAuthError, logout]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    error,
    login,
    register,
    logout,
    refreshAuth,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
