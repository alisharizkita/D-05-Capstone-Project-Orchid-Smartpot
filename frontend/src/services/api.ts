// src/app/services/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}/${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Authentication
  async login(username: string, password: string) {
    const response = await this.request<{user: any; token: string}>('login.php', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  // Register - BARU
  async register(username: string, email: string, password: string) {
    const response = await this.request<{user: any}>('register.php', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });

    return response;
  }

  async logout() {
    this.clearToken();
  }

  // Monitoring Data
  async getMonitoringData() {
    return this.request<any[]>('monitoring-data.php');
  }

  async getCurrentMonitoring(orchidType: string) {
    return this.request<any>(`monitoring-data.php?orchid_type=${orchidType}&latest=true`);
  }

  async getHistoricalData(orchidType: string, hours: number = 24) {
    return this.request<any[]>(`monitoring-data.php?orchid_type=${orchidType}&hours=${hours}`);
  }

  // Orchid Types
  async getOrchidTypes() {
    return this.request<any[]>('orchid-types.php');
  }

  // Actions
  async triggerWatering(orchidType: string) {
    return this.request<any>('actions/water.php', {
      method: 'POST',
      body: JSON.stringify({ orchid_type: orchidType }),
    });
  }

  async generateReport(orchidType: string) {
    return this.request<any>('reports/generate.php', {
      method: 'POST',
      body: JSON.stringify({ orchid_type: orchidType }),
    });
  }

  // Alerts
  async getAlerts(orchidType: string) {
    return this.request<any[]>(`alerts.php?orchid_type=${orchidType}`);
  }

  async dismissAlert(alertId: number) {
    return this.request<any>(`alerts.php?id=${alertId}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService(API_BASE_URL);