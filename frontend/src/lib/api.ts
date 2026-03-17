const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
}

interface ApiErrorResponse {
  statusCode: number;
  message: string;
  errors?: string[];
  path?: string;
}

export class ApiError extends Error {
  statusCode: number;
  errors?: string[];
  path?: string;

  constructor(response: ApiErrorResponse) {
    super(response.message);
    this.name = 'ApiError';
    this.statusCode = response.statusCode;
    this.errors = response.errors;
    this.path = response.path;
  }
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  private handleUnauthorized() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.assign('/login');
    }
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {} } = options;

    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    headers['Content-Type'] = 'application/json';

    const config: RequestInit = {
      method,
      headers,
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, config);

    if (response.status === 401) {
      this.handleUnauthorized();
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        statusCode: response.status,
        message: 'Error de conexión con el servidor',
      }));
      throw new ApiError({
        statusCode: errorData.statusCode || response.status,
        message: errorData.message || `Error HTTP: ${response.status}`,
        errors: errorData.errors,
        path: errorData.path,
      });
    }

    return response.json();
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  post<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body });
  }

  put<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body });
  }

  patch<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH', body });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient(API_BASE);
