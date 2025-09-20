import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { Button } from './ui/button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredSubscription?: 'demo' | 'basic' | 'pro' | 'enterprise';
}

export default function ProtectedRoute({ children, requiredSubscription }: ProtectedRouteProps) {
  const { user, isAuthenticated, hasAccess } = useAuth();
  const location = useLocation();

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Allow access to the dashboard even in demo mode
  const isDashboardPath = location.pathname === '/';
  
  if (requiredSubscription && !hasAccess(requiredSubscription) && !isDashboardPath) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-background border rounded-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4">Upgrade Required</h2>
          <p className="text-muted-foreground mb-6">
            This feature requires a {requiredSubscription} subscription or higher. 
            {isDashboardPath ? 'Some features may be limited in demo mode.' : 'Please upgrade your plan to access this content.'}
          </p>
          <div className="space-y-4">
            <Button
              onClick={() => window.location.href = '/settings/subscription'}
              className="w-full"
            >
              View Subscription Plans
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.history.back()}
              className="w-full"
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
