import { API_CONFIG } from './config';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export class ApiClient {
  private baseURL: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseURL = API_CONFIG.baseURL;
    this.timeout = API_CONFIG.timeout;
    this.defaultHeaders = { ...API_CONFIG.headers };
  }

  private tokenGetter: (() => Promise<string | null>) | null = null;

  /**
   * Set token getter function (called by auth context)
   */
  setTokenGetter(getter: () => Promise<string | null>): void {
    this.tokenGetter = getter;
  }

  private async getToken(): Promise<string | null> {
    if (this.tokenGetter) {
      return this.tokenGetter();
    }
    // Fallback for web
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem('auth_token');
    }
    return null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getToken();
    const isFormData = options.body instanceof FormData;
    const headers: HeadersInit = {
      // Only set default headers if not FormData
      ...(isFormData ? {} : this.defaultHeaders),
      ...options.headers,
    };

    if (token) {
      // If headers is a Headers object, use set(). If it's a plain object, assign directly.
      if (headers instanceof Headers) {
        headers.set('Authorization', `Bearer ${token}`);
      } else if (typeof headers === 'object' && headers !== null) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);


    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorData: any = {};
        const contentType = response.headers.get('content-type');
        
        // Try to parse JSON error response, but handle cases where it's not JSON
        if (contentType && contentType.includes('application/json')) {
          try {
            errorData = await response.json();
          } catch (e) {
            // If JSON parsing fails, use status text
            errorData = { message: response.statusText || 'An error occurred' };
          }
        } else {
          // If not JSON, try to get text or use status text
          try {
            const text = await response.text();
            errorData = { message: text || response.statusText || 'An error occurred' };
          } catch (e) {
            errorData = { message: response.statusText || 'An error occurred' };
          }
        }

        const error: ApiError = {
          message: errorData.message || errorData.error || 'An error occurred',
          status: response.status,
          code: errorData.code,
        };

        throw error;
      }

      // Parse response as JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return data as T;
      } else {
        // If response is not JSON, try to parse as text or return empty object
        const text = await response.text();
        try {
          return JSON.parse(text) as T;
        } catch {
          return {} as T;
        }
      }
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw {
          message: 'Request timeout. Please try again.',
          status: 408,
        } as ApiError;
      }

      if (error.status) {
        throw error;
      }

      throw {
        message: error.message || 'Network error. Please check your connection.',
        status: 0,
      } as ApiError;
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    const isFormData = data instanceof FormData;
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? (isFormData ? data : JSON.stringify(data)) : undefined,
      headers: isFormData 
        ? { ...options?.headers } // Don't set Content-Type for FormData, browser will set it with boundary
        : { ...options?.headers },
    });
  }

  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    const isFormData = data instanceof FormData;
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? (isFormData ? data : JSON.stringify(data)) : undefined,
      headers: isFormData 
        ? { ...options?.headers } // Don't set Content-Type for FormData, browser will set it with boundary
        : { ...options?.headers },
    });
  }

  async patch<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();

