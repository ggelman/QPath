/**
 * Q-Mentor Hook
 * Provide  cons  const handleError = useCallback((err: unknown) => {
    const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
    setError(errorMessage);
    console.error('Q-Mentor Error:', err);
  }, []);

  const askQuestion = useCallback(async (query: string, userProfile?: Record<string, unknown>): Promise<QMentorResponse> => {eError = useCallback((err: unknown) => {
    const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
    setError(errorMessage);
    console.error('Q-Mentor Error:', err);
  }, []);

  const askQuestion = useCallback(async (query: string, userProfile?: Record<string, unknown>): Promise<QMentorResponse> => {access to Q-Mentor AI functionality
 */
import { useState, useCallback } from 'react';
import { apiService, QMentorResponse, QMentorHealthResponse } from '../services/api';

interface UseQMentorReturn {
  // State
  isLoading: boolean;
  error: string | null;
  lastResponse: QMentorResponse | null;
  isAvailable: boolean;
  
  // Methods
  askQuestion: (query: string, userProfile?: Record<string, unknown>) => Promise<QMentorResponse>;
  getQuickTips: (careerArea: string) => Promise<QMentorResponse>;
  getQuantumRecommendations: (careerArea: string, experienceLevel?: string) => Promise<QMentorResponse>;
  analyzeLearningPath: (currentSkills: string[], targetRole: string) => Promise<QMentorResponse>;
  checkHealth: () => Promise<QMentorHealthResponse>;
  clearError: () => void;
}

export const useQMentor = (): UseQMentorReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<QMentorResponse | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((err: unknown) => {
    const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
    setError(errorMessage);
    console.error('Q-Mentor error:', err);
  }, []);

  const askQuestion = useCallback(async (query: string, userProfile?: Record<string, unknown>): Promise<QMentorResponse> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.askQMentor(query, userProfile);
      setLastResponse(response);
      
      if (response.status === 'error') {
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

  const getQuickTips = useCallback(async (careerArea: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.getQuickTips(careerArea);
      return response;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const getQuantumRecommendations = useCallback(async (
    careerArea: string, 
    experienceLevel: string = 'beginner'
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.getQuantumRecommendations(careerArea, experienceLevel);
      return response;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const analyzeLearningPath = useCallback(async (
    currentSkills: string[], 
    targetRole: string
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.analyzeLearningPath(currentSkills, targetRole);
      return response;
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