// src/services/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

type MaybeHeaders = Record<string, string> | undefined;

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL.replace(/\/+$/, ''); // trim trailing slash
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  // publicly callable
  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  getToken(): string | null {
    return this.token;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  }

  private buildHeaders(extra?: MaybeHeaders) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (extra) Object.assign(headers, extra);
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
    return headers;
  }

  private async safeJsonParse(response: Response) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}/${endpoint.replace(/^\/+/, '')}`;
    const ctrl = new AbortController();
    const timeout = typeof options.signal === 'undefined' ? setTimeout(() => ctrl.abort(), 20000) : undefined;

    try {
      const headers = this.buildHeaders(options.headers as MaybeHeaders);
      const res = await fetch(url, { ...options, headers, signal: ctrl.signal });

      if (timeout) clearTimeout(timeout);

      const parsed = await this.safeJsonParse(res);

      // Normalize backend variations:
      // - { success: true, data: ... }
      // - { status: 'success', data: ... }
      // - plain data
      if (parsed && (parsed.success === true || parsed.status === 'success')) {
        return { success: true, data: parsed.data ?? parsed };
      }

      if (parsed && (parsed.success === false || parsed.status === 'error')) {
        return { success: false, error: parsed.message || parsed.error || 'Request gagal' };
      }

      if (!res.ok) {
        // if backend returned json with message field use it
        const errMsg = parsed?.message || parsed?.error || `HTTP ${res.status} - ${res.statusText}`;
        return { success: false, error: errMsg };
      }

      // if OK and no success flag, return parsed or empty object
      return { success: true, data: (parsed as T) ?? (undefined as any) };
    } catch (err: any) {
      if (err && err.name === 'AbortError') {
        return { success: false, error: 'Request timeout - Server tidak merespons' };
      }
      if (err && err.message && err.message.includes('Failed to fetch')) {
        return { success: false, error: 'Tidak dapat terhubung ke server. Pastikan backend sudah berjalan dan CORS mengizinkan domain ini.' };
      }
      return { success: false, error: err?.message ?? 'Unknown error' };
    }
  }

  // --- Auth ---
  // Expect backend login to accept { username, password } and return token & user
  async login(username: string, password: string) {
    const response = await this.request<{ token: string; user: any }>('users/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
  });

    if (response.success && response.data) {
      // backend kamu kirim token di dalam data.data.token
      const token = (response.data as any).token || (response.data as any).data?.token;
      const user = (response.data as any).user || (response.data as any).data?.user;

      if (token) {
        this.setToken(token);
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', token);
          localStorage.setItem('user', JSON.stringify(user));
      }
    }
  }

  return response;
}

  async register(username: string, email: string, password: string, phone_number?: string): Promise<ApiResponse> {
    return this.request('users/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, phone_number }),
    });
  }

  async logout(): Promise<ApiResponse> {
    // optional: call backend logout if exists
    const res = await this.request('auth/logout', { method: 'POST' });
    // always clear token client-side
    this.clearToken();
    return res.success ? { success: true } : res;
  }

  // --- Orchid methods ---
  async getAllOrchids() {
    // Backend baca user_id dari token, jadi tidak perlu kirim userId
    return this.request<any[]>('orchid/getAll', {
      method: 'GET',
    });
  }

  async createOrchid(orchidData: { orchid_name: string; orchid_type: string; device_id?: string }) {
    // Backend pakai token untuk tahu user_id
    return this.request('orchid/create', {
      method: 'POST',
      body: JSON.stringify(orchidData),
    });
  }

async deleteOrchid(orchidId: number) {
  // Backend kemungkinan pakai /orchid/delete?id=...
  return this.request(`orchid/delete?id=${encodeURIComponent(orchidId)}`, {
    method: 'DELETE',
  });
}


  // helper to get logged user from localStorage
  getStoredUser() {
    if (typeof window === 'undefined') return null;
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  }
}

const apiService = new ApiService(API_BASE_URL);
export { apiService };
export default apiService;
