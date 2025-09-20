import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toastSuccess, toastInfo } from '@/lib/toast';

type SubscriptionTier = 'demo' | 'basic' | 'pro' | 'enterprise';

interface User {
  id: string;
  email: string;
  name: string;
  subscription: SubscriptionTier;
  isDemo: boolean;
  image?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  upgradeSubscription: (tier: SubscriptionTier) => void;
  hasAccess: (requiredTier: SubscriptionTier) => boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom error class for auth-related errors
export class AuthError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'AuthError';
    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AuthError);
    }
  }
}

const getUserFromStorage = (): User | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const userData = localStorage.getItem('user');
    if (!userData) return null;
    
    const parsedUser = JSON.parse(userData);
    if (!parsedUser || !parsedUser.id || !parsedUser.email || !parsedUser.subscription) {
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();
  
  // Initialize auth state
  useEffect(() => {
    let isMounted = true;
    
    const initializeAuth = async () => {
      if (!isMounted) return;
      
      try {
        const storedUser = getUserFromStorage();
        if (storedUser) {
          setUser(storedUser);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setError(error instanceof Error ? error : new Error('Failed to initialize authentication'));
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    initializeAuth();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      toastInfo('Signing in...', 'Please wait while we authenticate your account');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Hardcoded admin credentials for demo purposes
      const ADMIN_CREDENTIALS = {
        email: 'admin@intellidial.com',
        password: 'admin123'  // In a real app, never store passwords in code
      };
      
      // Check for admin credentials
      const isAdminLogin = email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password;
      
      // Check for admin email pattern
      const isAdminEmail = isAdminLogin || email.endsWith('@admin.com') || email === 'admin@example.com';
      
      // For demo purposes, we'll create a user on the fly
      const user: User = isAdminEmail 
        ? {
            id: 'admin-user-123',
            email: isAdminLogin ? ADMIN_CREDENTIALS.email : email,
            name: 'Admin User',
            subscription: 'enterprise',
            isDemo: false,
          }
        : {
            id: 'demo-user-123',
            email: email,
            name: 'Demo User',
            subscription: 'demo',
            isDemo: true,
          };
      
      console.log('User logged in:', {
        ...user,
        password: '***' // Never log actual passwords
      });
      
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      if (isAdminEmail) {
        console.log('Admin user logged in with full access');
        // Mark onboarding as completed for admin
        localStorage.setItem('onboardingCompleted', 'true');
      }
      
      setLoading(false);
      toastSuccess('Welcome back!', 'You have successfully logged in');
      navigate('/');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(new Error(errorMessage));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check for admin email pattern (e.g., admin@example.com or *@admin.com)
      const isAdminEmail = email.endsWith('@admin.com') || email === 'admin@example.com';
      
      const newUser: User = {
        id: `user-${Date.now()}`,
        email,
        name,
        // If admin, give highest subscription level, otherwise use demo
        subscription: isAdminEmail ? 'enterprise' : 'demo',
        isDemo: !isAdminEmail // Admin accounts are not in demo mode
      };
      
      console.log('New user created:', {
        ...newUser,
        password: '***' // Never log actual passwords
      });
      
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
      
      if (isAdminEmail) {
        console.log('Admin user created with full access');
        // Mark onboarding as completed for admin
        localStorage.setItem('onboardingCompleted', 'true');
      }
      
      navigate('/');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Signup failed';
      console.error('Signup error:', errorMessage);
      setError(new Error(errorMessage));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setError(null);
    setLoading(false);
    toastSuccess('Logged out successfully');
    navigate('/login');
  };

  const upgradeSubscription = (tier: SubscriptionTier) => {
    if (!user) return;
    
    const updatedUser = {
      ...user,
      subscription: tier,
      isDemo: tier === 'demo'
    };
    
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const hasAccess = (requiredTier: SubscriptionTier) => {
    if (!user) return false;
    
    const tierOrder: Record<SubscriptionTier, number> = {
      'demo': 0,
      'basic': 1,
      'pro': 2,
      'enterprise': 3
    };
    
    return tierOrder[user.subscription] >= tierOrder[requiredTier];
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-destructive/10 border border-destructive rounded-lg p-6 max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-destructive mb-2">Authentication Error</h2>
          <p className="text-muted-foreground mb-4">
            {error.message || 'An error occurred during authentication'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      login,
      signup,
      logout,
      upgradeSubscription,
      hasAccess,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new AuthError(
      'useAuth must be used within an AuthProvider',
      'AUTH_CONTEXT_ERROR'
    );
  }
  return context;
};
