/**
 * Q-Path API Service
 * Handles all communication with the FastAPI backend
 */

const RAW_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL)
  ? String(import.meta.env.VITE_API_BASE_URL)
  : undefined;

const API_BASE_URL = (RAW_BASE_URL && RAW_BASE_URL.trim().length > 0
  ? RAW_BASE_URL
  : 'http://127.0.0.1:8000/api/v1').replace(/\/$/, '');

export type UserRole = 'user' | 'moderator' | 'admin';

export interface User {
  id: number;
  email: string;
  full_name: string;
  username: string;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login: string | null;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface AuthSession {
  tokens: AuthTokens;
  user: User;
}

export type GamificationLevel =
  | 'iniciante'
  | 'explorador'
  | 'especialista'
  | 'mestre'
  | 'quantum_guardian';

export interface GamificationProfile {
  id: number;
  user_id: number;
  total_xp: number;
  current_level: GamificationLevel;
  current_streak: number;
  longest_streak: number;
  completed_trilhas: number;
  completed_projects: number;
  pomodoro_sessions: number;
  last_activity_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface CareerGuidanceResponse {
  response: string;
  status: string;
  query: string;
}

export interface QuantumRecommendationResponse {
  recommendations: Record<string, unknown>;
  status: string;
  career_area: string;
  experience_level: string;
}

export interface LearningPathResponse {
  analysis: string;
  status: string;
  current_skills: string[];
  target_role: string;
}

export interface QuickTipsResponse {
  career_area: string;
  tips: string;
  status: string;
}

export interface QMentorHealthResponse {
  service: string;
  status: string;
  available: boolean;
  message: string;
}

export type ProjectType = 'research' | 'startup';

export type ProjectStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';

export interface ProjectSubmission {
  id: number;
  user_id: number;
  project_type: ProjectType;
  title: string;
  description: string;
  github_url: string | null;
  demo_url: string | null;
  status: ProjectStatus;
  submission_notes: string | null;
  reviewer_feedback: string | null;
  reviewed_at: string | null;
  reviewed_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectSubmissionPayload {
  project_type: ProjectType;
  title: string;
  description: string;
  github_url?: string | null;
  demo_url?: string | null;
  submission_notes?: string | null;
}

export interface ProjectSubmissionUpdatePayload {
  title?: string;
  description?: string;
  github_url?: string | null;
  demo_url?: string | null;
  status?: ProjectStatus;
  submission_notes?: string | null;
  reviewer_feedback?: string | null;
}

export class ApiError extends Error {
  status?: number;
  details?: unknown;

  constructor(message: string, status?: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

class ApiService {
  private readonly baseURL: string;
  private accessToken: string | null;
  private refreshToken: string | null;
  private refreshPromise: Promise<AuthTokens> | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.accessToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    this.refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
  }

  private persistTokens(): void {
    if (typeof window === 'undefined') {
      return;
    }

    if (this.accessToken) {
      localStorage.setItem('access_token', this.accessToken);
    } else {
      localStorage.removeItem('access_token');
    }

    if (this.refreshToken) {
      localStorage.setItem('refresh_token', this.refreshToken);
    } else {
      localStorage.removeItem('refresh_token');
    }
  }

  private setTokens(tokens: AuthTokens): AuthTokens {
    this.accessToken = tokens.access_token;
    this.refreshToken = tokens.refresh_token;
    this.persistTokens();
    return tokens;
  }

  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.persistTokens();
  }

  private buildHeaders(options: RequestInit = {}): Headers {
    const headers = new Headers(options.headers ?? undefined);
    const isFormData = options.body instanceof FormData;

    if (!isFormData && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    if (!headers.has('Accept')) {
      headers.set('Accept', 'application/json');
    }

    if (this.accessToken && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${this.accessToken}`);
    }

    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}, retry = true): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: this.buildHeaders(options),
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 204) {
        return undefined as T;
      }

      if (!response.ok) {
        if (response.status === 401 && retry && this.refreshToken) {
          await this.refreshAccessToken();
          return this.request<T>(endpoint, options, false);
        }

        let errorBody: unknown = null;
        try {
          errorBody = await response.json();
        } catch {
          // Ignore parse errors for empty responses
        }

        const detail =
          typeof errorBody === 'object' && errorBody !== null && 'detail' in errorBody
            ? (errorBody as { detail: unknown }).detail
            : response.statusText;

        throw new ApiError(
          typeof detail === 'string' ? detail : 'Erro ao processar a solicitação.',
          response.status,
          errorBody,
        );
      }

      const contentType = response.headers.get('Content-Type') ?? '';
      const text = await response.text();

      if (!text) {
        return undefined as T;
      }

      if (contentType.includes('application/json')) {
        return JSON.parse(text) as T;
      }

      return text as unknown as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError('Falha de rede ao comunicar com o servidor.', undefined, error);
    }
  }

  private async refreshAccessToken(): Promise<AuthTokens> {
    if (!this.refreshToken) {
      this.clearTokens();
      throw new ApiError('Sessão expirada. Faça login novamente.', 401);
    }

    if (!this.refreshPromise) {
      this.refreshPromise = (async () => {
        try {
          const response = await fetch(`${this.baseURL}/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({ refresh_token: this.refreshToken }),
          });

          if (!response.ok) {
            let errorBody: unknown = null;
            try {
              errorBody = await response.json();
            } catch {
              // Ignore parse errors
            }

            this.clearTokens();

            const detail =
              typeof errorBody === 'object' && errorBody !== null && 'detail' in errorBody
                ? (errorBody as { detail: unknown }).detail
                : response.statusText;

            throw new ApiError(
              typeof detail === 'string' ? detail : 'Não foi possível atualizar a sessão.',
              response.status,
              errorBody,
            );
          }

          const data = (await response.json()) as AuthTokens;
          this.setTokens(data);
          return data;
        } finally {
          this.refreshPromise = null;
        }
      })();
    }

    return this.refreshPromise;
  }

  async login(username: string, password: string): Promise<AuthSession> {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const tokens = await this.request<AuthTokens>('/auth/login', {
      method: 'POST',
      body: formData,
    });

    this.setTokens(tokens);
    const user = await this.getCurrentUser();

    return { tokens, user };
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    full_name: string;
  }): Promise<User> {
    return this.request<User>('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.clearTokens();
    }
  }

  async refreshSession(): Promise<AuthSession> {
    const tokens = await this.refreshAccessToken();
    const user = await this.getCurrentUser();
    return { tokens, user };
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  async getUsers(skip = 0, limit = 50): Promise<User[]> {
    const params = new URLSearchParams({ skip: String(skip), limit: String(limit) });
    return this.request<User[]>(`/users/?${params.toString()}`);
  }

  async updateProfile(userData: Partial<Pick<User, 'email' | 'full_name' | 'username'>>): Promise<User> {
    return this.request<User>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async healthCheck(): Promise<{ status: string; message?: string; environment?: string }> {
    return this.request('/health');
  }

  async qmentorHealth(): Promise<QMentorHealthResponse> {
    return this.request('/qmentor/health');
  }

  async askQMentor(query: string, userProfile?: Record<string, unknown>): Promise<CareerGuidanceResponse> {
    return this.request('/qmentor/guidance', {
      method: 'POST',
      body: JSON.stringify({ query, user_profile: userProfile }),
    });
  }

  async getQuantumRecommendations(
    careerArea: string,
    experienceLevel: string = 'beginner',
  ): Promise<QuantumRecommendationResponse> {
    return this.request('/qmentor/quantum-recommendations', {
      method: 'POST',
      body: JSON.stringify({
        career_area: careerArea,
        experience_level: experienceLevel,
      }),
    });
  }

  async analyzeLearningPath(
    currentSkills: string[],
    targetRole: string,
  ): Promise<LearningPathResponse> {
    return this.request('/qmentor/learning-path', {
      method: 'POST',
      body: JSON.stringify({
        current_skills: currentSkills,
        target_role: targetRole,
      }),
    });
  }

  async getQuickTips(careerArea: string): Promise<QuickTipsResponse> {
    return this.request(`/qmentor/quick-tips/${encodeURIComponent(careerArea)}`);
  }

  async getGamificationProfile(): Promise<GamificationProfile> {
    return this.request('/gamification/profile');
  }

  async addXP(
    activityType: string,
    xpAmount: number,
    description: string,
  ): Promise<GamificationProfile> {
    return this.request('/gamification/add-xp', {
      method: 'POST',
      body: JSON.stringify({
        activity_type: activityType,
        xp_amount: xpAmount,
        description,
      }),
    });
  }

  async completeTrilha(trilhaName: string, xpEarned = 100): Promise<GamificationProfile> {
    return this.request('/gamification/complete-trilha', {
      method: 'POST',
      body: JSON.stringify({
        trilha_name: trilhaName,
        xp_earned: xpEarned,
      }),
    });
  }

  async logPomodoroSession(durationMinutes: number): Promise<GamificationProfile> {
    return this.request('/gamification/pomodoro-session', {
      method: 'POST',
      body: JSON.stringify({ duration_minutes: durationMinutes }),
    });
  }

  async getProjects(): Promise<ProjectSubmission[]> {
    return this.request('/projects/my-submissions');
  }

  async createProject(projectData: ProjectSubmissionPayload): Promise<ProjectSubmission> {
    return this.request('/projects/submit', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async getProject(submissionId: number): Promise<ProjectSubmission> {
    return this.request(`/projects/submission/${submissionId}`);
  }

  async updateProject(
    submissionId: number,
    projectData: ProjectSubmissionUpdatePayload,
  ): Promise<ProjectSubmission> {
    return this.request(`/projects/submission/${submissionId}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  }
}

export const apiService = new ApiService();
export default apiService;
