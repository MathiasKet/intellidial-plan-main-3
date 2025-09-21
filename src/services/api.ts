import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { toast } from '@/components/ui/use-toast';

// Fix for axios import in Vite
// @ts-ignore - Fix for Vite's ESM imports
if (import.meta.env.DEV) {
  // @ts-ignore
  window.process = { env: {} };
}

// Extend AxiosRequestConfig to include retry flag
interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Define API response types
interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Auth interfaces
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    phone?: string;
    role: 'admin' | 'agent' | 'user';
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
  accessToken: string;
  refreshToken: string;
}

// Call interfaces
export interface CallRequest {
  to: string;
  from: string;
  message?: string;
  contactId?: string;
}

export interface Call {
  id: string;
  user_id: string;
  status: 'initiated' | 'in-progress' | 'completed' | 'failed';
  from_number: string;
  to_number: string;
  started_at: string | null;
  ended_at: string | null;
  duration: number | null;
  recording_url: string | null;
  transcript: string | null;
  created_at: string;
  updated_at: string;
}

// Contact interfaces
export interface Contact {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string;
  company: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Transcript interfaces
export interface Transcript {
  id: string;
  call_id: string;
  content: string;
  sentiment_score: number | null;
  key_points: string[] | null;
  created_at: string;
  updated_at: string;
}

// Settings interfaces
export interface UserSettings {
  id: string;
  user_id: string;
  voice_id: string;
  voice_settings: {
    stability: number;
    similarity_boost: number;
  };
  call_volume: number;
  call_recording: boolean;
  created_at: string;
  updated_at: string;
}

// Error handling
class ApiError extends Error {
  status: number;
  code?: string;
  details?: any;

  constructor(message: string, status: number, code?: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// Helper function to handle API errors
const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || error.message || 'An error occurred';
    const code = error.response?.data?.code;
    const details = error.response?.data?.details;
    
    // Show error toast
    toast({
      title: `Error ${status}`,
      description: message || 'An error occurred',
      variant: 'destructive',
    });
    
    // Handle specific status codes
    if (status === 401) {
      // Unauthorized - clear auth data and redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    throw new ApiError(message, status || 500, code, details);
  }
  
  // Handle non-Axios errors
  const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
  toast({
    title: 'Error',
    description: errorMessage,
    variant: 'destructive',
  });
  
  throw new ApiError(errorMessage, 500);
};

// Get API URL from environment variables or use default
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance with base URL
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling 401 errors and token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryConfig;
    
    // If error is not 401 or we've already retried, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }
    
    // Set retry flag to prevent infinite loops
    originalRequest._retry = true;
    
    try {
      // Try to refresh the token
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await axios.post<{ accessToken: string; refreshToken: string }>(
        `${API_BASE_URL}/auth/refresh-token`,
        { refreshToken }
      );
      
      const { accessToken, refreshToken: newRefreshToken } = response.data;
      
      // Store the new tokens
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      
      // Update the Authorization header
      if (originalRequest.headers) {
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
      }
      
      // Retry the original request
      return api(originalRequest);
    } catch (refreshError) {
      // If refresh fails, clear auth data and redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(refreshError);
    }
  }
);

// Auth API
export const authApi = {
  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', { email, password });
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  /**
   * Register a new user
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', userData);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Even if logout fails, clear local storage
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },
  
  /**
   * Get current user profile
   */
  async getProfile(): Promise<AuthResponse['user']> {
    try {
      const response = await api.get<ApiResponse<AuthResponse['user']>>('/auth/me');
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<void> {
    try {
      await api.post('/auth/forgot-password', { email });
      toast({
        title: 'Success',
        description: 'If an account exists with this email, you will receive a password reset link.',
      });
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  /**
   * Reset password with token
   */
  async resetPassword(token: string, password: string): Promise<void> {
    try {
      await api.post('/auth/reset-password', { token, password });
      toast({
        title: 'Success',
        description: 'Your password has been reset. You can now log in with your new password.',
      });
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// Calls API
export const callsApi = {
  initiateCall: async (data: {
    to: string;
    from: string;
    message?: string;
  }) => {
    const response = await api.post('/calls/initiate', data);
    return response.data;
  },
  
  getCallHistory: async (params: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}) => {
    const response = await api.get('/calls/history', { params });
    return response.data;
  },
  
  getCallDetails: async (callId: string) => {
    const response = await api.get(`/calls/${callId}`);
    return response.data;
  },
  
  endCall: async (callId: string) => {
    const response = await api.post(`/calls/${callId}/end`);
    return response.data;
  },
  
  getRecording: async (recordingId: string) => {
    const response = await api.get(`/recordings/${recordingId}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

// Contacts API
export const contactsApi = {
  getContacts: async (params: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}) => {
    const response = await api.get('/contacts', { params });
    return response.data;
  },
  
  createContact: async (data: {
    firstName: string;
    lastName: string;
    email?: string;
    phone: string;
    company?: string;
    notes?: string;
  }) => {
    const response = await api.post('/contacts', data);
    return response.data;
  },
  
  updateContact: async (id: string, data: any) => {
    const response = await api.put(`/contacts/${id}`, data);
    return response.data;
  },
  
  deleteContact: async (id: string) => {
    await api.delete(`/contacts/${id}`);
  },
};

// Transcripts API
export const transcriptsApi = {
  getTranscripts: async (params: {
    page?: number;
    limit?: number;
    callId?: string;
  } = {}) => {
    const response = await api.get('/transcripts', { params });
    return response.data;
  },
  
  getTranscript: async (id: string) => {
    const response = await api.get(`/transcripts/${id}`);
    return response.data;
  },
  
  analyzeSentiment: async (transcriptId: string) => {
    const response = await api.post(`/transcripts/${transcriptId}/analyze`);
    return response.data;
  },
};

// CRM API
export const crmApi = {
  syncCall: async (callId: string) => {
    const response = await api.post(`/crm/sync/call/${callId}`);
    return response.data;
  },
  
  searchLeads: async (query: string) => {
    const response = await api.get('/crm/leads/search', { params: { q: query } });
    return response.data;
  },
  
  createLead: async (data: any) => {
    const response = await api.post('/crm/leads', data);
    return response.data;
  },
};

// Settings API
export const settingsApi = {
  getSettings: async () => {
    const response = await api.get('/settings');
    return response.data;
  },
  
  updateSettings: async (data: any) => {
    const response = await api.put('/settings', data);
    return response.data;
  },
  
  updateVoiceSettings: async (data: {
    voiceId: string;
    stability?: number;
    similarityBoost?: number;
  }) => {
    const response = await api.put('/settings/voice', data);
    return response.data;
  },
};

export default api;
