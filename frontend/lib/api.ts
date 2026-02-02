import { AuthResponse } from '@/types/user';
import { Todo, TodoCreateInput, TodoUpdateInput } from '@/types/todo';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://anooshaqasim-full-stack-todo-backend.hf.space';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: any;
}

class ApiClient {
  private baseUrl: string;
  public token: string | null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('access_token', token);
      } else {
        localStorage.removeItem('access_token');
      }
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      ...options.headers,
    };

    try {
      console.log(`[API] ${options.method || 'GET'} ${url}`, {
        token: this.token ? this.token.substring(0, 20) + '...' : 'No token',
        headers
      });

      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      console.log(`[API] Response status: ${response.status}`, data);

      if (!response.ok) {
        // Extract error message from various response formats
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        if (typeof data === 'object' && data !== null) {
          if (data.detail && typeof data.detail === 'string') {
            errorMessage = data.detail;
          } else if (data.message && typeof data.message === 'string') {
            errorMessage = data.message;
          } else if (data.error) {
            if (typeof data.error === 'string') {
              errorMessage = data.error;
            } else if (typeof data.error === 'object' && data.error.message) {
              errorMessage = data.error.message;
            } else {
              errorMessage = JSON.stringify(data.error);
            }
          }
        }
        
        console.error(`[API] Error: ${errorMessage}`, data);
        
        return {
          success: false,
          error: errorMessage,
          details: data
        };
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message
      };
    } catch (error: any) {
      console.error(`[API] Catch error: ${error.message}`, error);
      return {
        success: false,
        error: error.message || 'Network error occurred',
      };
    }
  }

  // Authentication methods
  async login(email: string, password: string): Promise<ApiResponse<AuthResponse['data']>> {
    return this.request<AuthResponse['data']>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async signup(email: string, password: string, name?: string): Promise<ApiResponse<AuthResponse['data']>> {
    return this.request<AuthResponse['data']>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  // Task methods
  async getTasks(): Promise<ApiResponse<Todo[]>> {
    return this.request<Todo[]>('/api/tasks/');
  }

  async createTask(task: TodoCreateInput): Promise<ApiResponse<Todo>> {
    return this.request<Todo>('/api/tasks/', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  async updateTask(id: string, task: TodoUpdateInput): Promise<ApiResponse<Todo>> {
    return this.request<Todo>(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    });
  }

  async deleteTask(id: string): Promise<ApiResponse<null>> {
    return this.request<null>(`/api/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleTask(id: string): Promise<ApiResponse<Todo>> {
    return this.request<Todo>(`/api/tasks/${id}/complete`, {
      method: 'PATCH',
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

export default ApiClient;