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

  /**
   * Extract user-friendly error message from HTML error pages
   */
  private extractErrorMessageFromHTML(status: number, html: string): string {
    // Check for common error patterns in HTML
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      const title = titleMatch[1].trim();
      // Remove "| 500: Internal server error" type patterns
      const cleanTitle = title.replace(/\|\s*\d+[:\s].*/i, '').trim();
      if (cleanTitle && !cleanTitle.includes('<!DOCTYPE')) {
        return cleanTitle;
      }
    }

    // Check for h1 tags with error messages
    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    if (h1Match && h1Match[1]) {
      const h1Text = h1Match[1].trim();
      if (h1Text && h1Text.length < 100) {
        return h1Text;
      }
    }

    // Fallback to status-based message
    return this.getUserFriendlyErrorMessage(status);
  }

  /**
   * Get user-friendly error message based on HTTP status code
   */
  private getUserFriendlyErrorMessage(status: number): string {
    switch (status) {
      case 400:
        return 'Invalid request. Please check your input and try again.';
      case 401:
        return 'Authentication required. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 408:
        return 'Request timeout. Please try again.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'Server error. The service is temporarily unavailable. Please try again later.';
      case 502:
        return 'Service temporarily unavailable. The server is down or overloaded. Please try again in a few minutes.';
      case 503:
        return 'Service unavailable. The server is temporarily down for maintenance. Please try again later.';
      case 504:
        return 'Gateway timeout. The server took too long to respond. Please try again.';
      default:
        if (status >= 500) {
          return 'Server error. Please try again later.';
        } else if (status >= 400) {
          return 'Request error. Please check your input and try again.';
        }
        return 'An error occurred. Please try again.';
    }
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
        const contentType = response.headers.get('content-type') || '';
        
        // Try to parse JSON error response, but handle cases where it's not JSON
        if (contentType.includes('application/json')) {
          try {
            errorData = await response.json();
          } catch (e) {
            // If JSON parsing fails, use status text
            errorData = { message: response.statusText || 'An error occurred' };
          }
        } else {
          // If not JSON (could be HTML error page), try to get text
          try {
            const text = await response.text();
            
            // Check if response is HTML (common for Cloudflare/nginx error pages)
            if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
              // Extract meaningful error message from HTML
              const userFriendlyMessage = this.extractErrorMessageFromHTML(response.status, text);
              errorData = { message: userFriendlyMessage };
            } else {
              // Try to parse as JSON even if content-type wasn't set correctly
              try {
                errorData = JSON.parse(text);
              } catch {
                // If it's plain text, use it as message (but limit length)
                errorData = { 
                  message: text.length > 200 ? text.substring(0, 200) + '...' : text || response.statusText || 'An error occurred' 
                };
              }
            }
          } catch (e) {
            errorData = { message: this.getUserFriendlyErrorMessage(response.status) };
          }
        }

        const error: ApiError = {
          message: errorData.message || errorData.error || this.getUserFriendlyErrorMessage(response.status),
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

