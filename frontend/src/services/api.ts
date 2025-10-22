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
        ...options,
        headers,
      });

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