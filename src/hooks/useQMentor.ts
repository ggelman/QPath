/**
 * Q-Mentor Hook
 * Provides access to Q-Mentor AI functionality
 */
import { useState, useCallback } from 'react';
import {
  apiService,
  CareerGuidanceResponse,
  QuickTipsResponse,
  QuantumRecommendationResponse,
  LearningPathResponse,
  QMentorHealthResponse,
} from '@/services/api';

interface UseQMentorReturn {
  // State
  isLoading: boolean;
  error: string | null;
  lastResponse: CareerGuidanceResponse | null;
  isAvailable: boolean;

  // Methods
  askQuestion: (query: string, userProfile?: Record<string, unknown>) => Promise<CareerGuidanceResponse>;
  getQuickTips: (careerArea: string) => Promise<QuickTipsResponse>;
  getQuantumRecommendations: (
    careerArea: string,
    experienceLevel?: string,
  ) => Promise<QuantumRecommendationResponse>;
  analyzeLearningPath: (currentSkills: string[], targetRole: string) => Promise<LearningPathResponse>;
  checkHealth: () => Promise<QMentorHealthResponse>;
  clearError: () => void;
}

const isErrorStatus = (status?: string): boolean => {
  if (!status) {
    return false;
  }
  return status.toLowerCase() === 'error';
};

export const useQMentor = (): UseQMentorReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<CareerGuidanceResponse | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((err: unknown) => {
    const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
    setError(errorMessage);
    console.error('Q-Mentor error:', err);
  }, []);

  const askQuestion = useCallback(async (
    query: string,
    userProfile?: Record<string, unknown>,
  ): Promise<CareerGuidanceResponse> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiService.askQMentor(query, userProfile);
      setLastResponse(response);

      if (isErrorStatus(response.status)) {
        setError(response.response);
      }

      return response;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const getQuickTips = useCallback(async (careerArea: string): Promise<QuickTipsResponse> => {
    try {
      setIsLoading(true);
      setError(null);

      return await apiService.getQuickTips(careerArea);
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const getQuantumRecommendations = useCallback(async (
    careerArea: string,
    experienceLevel: string = 'beginner',
  ): Promise<QuantumRecommendationResponse> => {
    try {
      setIsLoading(true);
      setError(null);

      return await apiService.getQuantumRecommendations(careerArea, experienceLevel);
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const analyzeLearningPath = useCallback(async (
    currentSkills: string[],
    targetRole: string,
  ): Promise<LearningPathResponse> => {
    try {
      setIsLoading(true);
      setError(null);

      return await apiService.analyzeLearningPath(currentSkills, targetRole);
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const checkHealth = useCallback(async (): Promise<QMentorHealthResponse> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiService.qmentorHealth();
      setIsAvailable(response.available);

      if (!response.available) {
        setError(response.message);
      }

      return response;
    } catch (err) {
      handleError(err);
      setIsAvailable(false);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  return {
    // State
    isLoading,
    error,
    lastResponse,
    isAvailable,

    // Methods
    askQuestion,
    getQuickTips,
    getQuantumRecommendations,
    analyzeLearningPath,
    checkHealth,
    clearError,
  };
};
