<<<<<<< HEAD
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
=======
// src/services/api.ts
const API_BASE_URL = 'http://localhost:80'; // Sesuaikan dengan URL backend PHP Anda

interface LoginResponse {
  success: boolean;
  data?: {
    token: string;
    user: {
      user_id: number;
      username: string;
      email: string;
    };
  };
  error?: string;
}

interface RegisterResponse {
  success: boolean;
  error?: string;
}

export const apiService = {
  // Login - bisa pakai username atau email
  async login(username: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (result.status === 'success') {
        // Simpan token ke localStorage
        if (result.data.token) {
          localStorage.setItem('token', result.data.token);
          localStorage.setItem('user', JSON.stringify(result.data.user));
        }
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Koneksi ke server gagal' };
    }
  },

  // Register - phone_number opsional
  async register(
    username: string, 
    email: string, 
    password: string,
    phone_number: string = ''
  ): Promise<RegisterResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
          phone_number: phone_number || '', // Kirim string kosong jika tidak diisi
        }),
      });

      const result = await response.json();

      if (result.status === 'success') {
        return { success: true };
      } else {
        return { success: false, error: result.message };
      }
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: 'Koneksi ke server gagal' };
    }
  },

  // Logout
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  // Get token
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },

  // Get user
  getUser(): any {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  // API call dengan authentication
  async fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = this.getToken();
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
>>>>>>> 96921af4aef99d1d3f19270375fbc23a9d06a93f
        ...options,
        headers,
      });

<<<<<<< HEAD
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
      body: JSON.stringify({ username, email, password, phone }),
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
=======
      const result = await response.json();

      // Jika token expired atau invalid
      if (response.status === 401) {
        this.logout();
        return { success: false, error: 'Session expired. Please login again.' };
      }

      return result;
    } catch (error) {
      console.error('API error:', error);
      return { success: false, error: 'Connection to server failed' };
    }
  },
};
>>>>>>> 96921af4aef99d1d3f19270375fbc23a9d06a93f
