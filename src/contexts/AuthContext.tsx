import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { authApi } from '@/services/api';

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'admin' | 'agent' | 'user';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  is_active: boolean;
}

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
    phone: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  updateUser: (userData: Partial<User>) => void;
  hasRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Custom error class for auth-related errors
export class AuthError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'AuthError';
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AuthError);
    }
  }
}

const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const userData = localStorage.getItem('user');
    if (!userData) return null;
    
    const parsedUser = JSON.parse(userData);
    if (!parsedUser || !parsedUser.id || !parsedUser.email) {
      console.error('Invalid user data in storage');
      return null;
    }
    
    return parsedUser;
  } catch (error) {
    console.error('Error getting user from storage:', error);
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();
  
  // Initialize auth state
  // Check if user is authenticated
  const isAuthenticated = !!user?.id;

  // Update user data in state and local storage
  const updateUser = useCallback((userData: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updatedUser = { ...prev, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { user, accessToken, refreshToken } = await authApi.login(email, password);
      
      // Store tokens and user data
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      
      toast({
        title: 'Login successful',
        description: `Welcome back, ${user.name}!`,
      });
      
      navigate('/dashboard');
    } catch (err) {
      const error = err as Error;
      setError(error);
      
      toast({
        title: 'Login failed',
        description: error.message || 'Failed to log in. Please try again.',
        variant: 'destructive',
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Register function
  const register = async (userData: {
    name: string;
    email: string;
    password: string;
    phone: string;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const { user, accessToken, refreshToken } = await authApi.register(userData);
      
      // Store tokens and user data
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      
      toast({
        title: 'Registration successful',
        description: 'Your account has been created!',
      });
      
      navigate('/onboarding');
    } catch (err) {
      const error = err as Error;
      setError(error);
      
      toast({
        title: 'Registration failed',
        description: error.message || 'Failed to register. Please try again.',
        variant: 'destructive',
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Logout function
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear all auth data
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      setUser(null);
      setError(null);
      
      navigate('/login');
    }
  };
  
  // Refresh access token
  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      // The token refresh is handled by the API interceptor
      // This function is just for manual refresh if needed
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }
      
      const { accessToken, refreshToken: newRefreshToken } = await response.json();
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
      return false;
    }
  };
  
  // Check if user has required role
  const hasRole = (roles: string[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    refreshToken,
    updateUser,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
