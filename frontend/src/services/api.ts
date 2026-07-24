const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Case {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  issue_type: string;
  desired_resolution: string;
  status: string;
  created_at: string;
  updated_at: string;
}

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  public setToken(token: string) {
    localStorage.setItem('access_token', token);
  }

  public clearToken() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
  }

  public getUser(): User | null {
    const raw = localStorage.getItem('user_data');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  public setUser(user: User) {
    localStorage.setItem('user_data', JSON.stringify(user));
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'An unexpected error occurred' }));
      throw new Error(errorData.detail || `Request failed with status ${response.status}`);
    }

    return response.json();
  }

  // Auth Methods
  async signup(data: { name: string; email: string; password: string }): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(res.access_token);
    this.setUser(res.user);
    return res;
  }

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(res.access_token);
    this.setUser(res.user);
    return res;
  }

  async getMe(): Promise<User> {
    const user = await this.request<User>('/auth/me');
    this.setUser(user);
    return user;
  }

  // Case Methods
  async createCase(data: { title: string; description: string; category?: string; issue_type?: string; desired_resolution?: string }): Promise<Case> {
    return this.request<Case>('/cases', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCases(): Promise<Case[]> {
    return this.request<Case[]>('/cases');
  }

  async getCase(id: string): Promise<Case> {
    return this.request<Case>(`/cases/${id}`);
  }

  async updateCaseStatus(id: string, status: string): Promise<Case> {
    return this.request<Case>(`/cases/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // AI System Methods
  async analyzeCase(caseId: string): Promise<{
    summary: string;
    category: string;
    issue_type: string;
    desired_resolution: string;
    key_facts: string[];
    missing_information: string[];
  }> {
    return this.request(`/cases/${caseId}/ai/analyze`, { method: 'POST' });
  }

  async getFollowUpQuestions(caseId: string): Promise<{ questions: string[] }> {
    return this.request(`/cases/${caseId}/ai/follow-up`, { method: 'POST' });
  }

  async submitAnswers(caseId: string, answers: Record<string, string>): Promise<{ status: string; answers_saved: number }> {
    return this.request(`/cases/${caseId}/ai/answers`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  }

  async getAIGuidance(caseId: string): Promise<{
    summary_analysis: string;
    applicable_laws: Array<{ title: string; source: string; summary: string }>;
    recommended_remedies: string[];
    next_steps: string[];
  }> {
    return this.request(`/cases/${caseId}/ai/guidance`, { method: 'POST' });
  }

  // Evidence Management Methods
  async uploadEvidence(caseId: string, file: File, evidenceType: string = 'other'): Promise<any> {
    const token = this.getToken();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('evidence_type', evidenceType);

    const response = await fetch(`${API_BASE_URL}/cases/${caseId}/evidence`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(errorData.detail || 'Upload failed');
    }

    return response.json();
  }

  async getEvidence(caseId: string): Promise<any[]> {
    return this.request(`/cases/${caseId}/evidence`);
  }

  async deleteEvidence(caseId: string, evidenceId: string): Promise<void> {
    const token = this.getToken();
    const response = await fetch(`${API_BASE_URL}/cases/${caseId}/evidence/${evidenceId}`, {
      method: 'DELETE',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete evidence file');
    }
  }

  // Timeline Methods
  async getTimeline(caseId: string): Promise<any[]> {
    return this.request(`/cases/${caseId}/timeline`);
  }

  // Complaint Generator Methods
  async generateComplaint(caseId: string, customInstructions?: string): Promise<any> {
    return this.request(`/cases/${caseId}/complaint/generate`, {
      method: 'POST',
      body: JSON.stringify({ custom_instructions: customInstructions }),
    });
  }

  async getComplaint(caseId: string): Promise<any> {
    return this.request(`/cases/${caseId}/complaint`);
  }

  async updateComplaint(caseId: string, content: string, title?: string): Promise<any> {
    return this.request(`/cases/${caseId}/complaint`, {
      method: 'PUT',
      body: JSON.stringify({ content, title }),
    });
  }

  getComplaintExportUrl(caseId: string, format: 'txt' | 'pdf' = 'txt'): string {
    const token = this.getToken();
    return `${API_BASE_URL}/cases/${caseId}/complaint/export?format=${format}&token=${token}`;
  }
}

export const api = new ApiService();
