/**
 * Q-Path API Service
 * Handles all communication with the FastAPI backend
 */

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

// Types for API responses
export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: 'STUDENT' | 'MENTOR' | 'ADMIN';
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface QMentorResponse {
  response: string;
  guidance: string;
  status: string;
  query: string;
}

export interface QMentorHealthResponse {
  service: string;
  status: string;
  available: boolean;
  message: string;
}

class ApiService {
  private readonly baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('access_token');
  }

  // Set authentication token
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('access_token', token);
  }

  // Clear authentication token
  clearToken() {
    this.token = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  // Get headers with authentication
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic API request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; message: string }> {
    return this.request('/health');
  }

  // Authentication methods
  async register(userData: {
    username: string;
    email: string;
    password: string;
    full_name: string;
  }): Promise<User> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(username: string, password: string): Promise<AuthResponse> {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Login failed');
    }

    const authData = await response.json();
    this.setToken(authData.access_token);
    localStorage.setItem('refresh_token', authData.refresh_token);
    
    return authData;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.clearToken();
    }
  }

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.request<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    this.setToken(response.access_token);
    return response;
  }

  // User methods
  async getCurrentUser(): Promise<User> {
    return this.request('/users/me');
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    return this.request('/users/me', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Q-Mentor methods
  async qmentorHealth(): Promise<QMentorHealthResponse> {
    return this.request('/qmentor/health');
  }

  async askQMentor(query: string, userProfile?: Record<string, unknown>): Promise<QMentorResponse> {
    return this.request('/qmentor/guidance', {
      method: 'POST',
      body: JSON.stringify({ query, user_profile: userProfile }),
    });
  }

  async getQuantumRecommendations(
    careerArea: string,
    experienceLevel: string = 'beginner'
  ): Promise<QMentorResponse> {
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
    targetRole: string
  ): Promise<QMentorResponse> {
    return this.request('/qmentor/learning-path', {
      method: 'POST',
      body: JSON.stringify({
        current_skills: currentSkills,
        target_role: targetRole,
      }),
    });
  }

  async getQuickTips(careerArea: string): Promise<QMentorResponse> {
    return this.request(`/qmentor/quick-tips/${careerArea}`);
  }

  // Gamification methods
  async getGamificationProfile(): Promise<Record<string, unknown>> {
    return this.request('/gamification/profile');
  }

  async updateXP(activityType: string, xpAmount: number): Promise<Record<string, unknown>> {
    return this.request('/gamification/update-xp', {
      method: 'POST',
      body: JSON.stringify({
        activity_type: activityType,
        xp_amount: xpAmount,
      }),
    });
  }

  // Projects methods
  async getProjects(): Promise<Record<string, unknown>[]> {
    return this.request('/projects');
  }

  async createProject(projectData: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async getProject(projectId: number): Promise<Record<string, unknown>> {
    return this.request(`/projects/${projectId}`);
  }

  async updateProject(projectId: number, projectData: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.request(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;