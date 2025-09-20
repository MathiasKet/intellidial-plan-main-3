import { Sidebar } from "@/components/layout/Sidebar";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider, Navigate, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { WebSocketProvider } from "@/contexts/WebSocketContext";
import { DashboardDataProvider } from "@/contexts/DashboardDataContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageTransition } from "@/components/transitions/PageTransition";
import { useEffect, useState } from "react";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ActiveCall from "@/pages/ActiveCall";
import NotFound from "@/pages/NotFound";
import CallHistory from "@/pages/CallHistory";
import Transcripts from "@/pages/Transcripts";
import Contacts from "@/pages/Contacts";
import Analytics from "@/pages/Analytics";
import DataSync from "@/pages/DataSync";
import Settings from "@/pages/Settings";
import Calendar from "@/pages/Calendar";
import Onboarding from "@/pages/Onboarding";
import SubscriptionPlans from "@/components/SubscriptionPlans";
import ProtectedRoute from "@/components/ProtectedRoute";

const queryClient = new QueryClient();


const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle auth and onboarding state
  useEffect(() => {
    if (isAuthenticated !== null) {
      const isCompleted = localStorage.getItem('onboardingCompleted') === 'true';
      const shouldShowOnboarding = isAuthenticated ? !isCompleted : false;
      setShowOnboarding(shouldShowOnboarding);
      
      // Only redirect if we're not already on the correct page
      const currentPath = location.pathname;
      const isPublicRoute = ['/login', '/signup', '/onboarding'].includes(currentPath);
      
      if (isAuthenticated) {
        // Force onboarding for all users who haven't completed it
        if (shouldShowOnboarding && currentPath !== '/onboarding') {
          // If onboarding is not completed, redirect to onboarding
          // and save the intended destination
          const from = currentPath === '/' || isPublicRoute ? '/' : currentPath;
          navigate('/onboarding', { 
            state: { from },
            replace: true 
          });
        } else if (!shouldShowOnboarding && currentPath === '/onboarding') {
          // If onboarding is completed and user is on onboarding page, redirect to intended destination or dashboard
          const from = location.state?.from || '/';
          navigate(from, { replace: true });
        }
      } else if (!isPublicRoute) {
        // If not authenticated and not on a public route, redirect to login
        navigate('/login', { 
          state: { from: currentPath },
          replace: true 
        });
      }
    }
  }, [isAuthenticated, navigate, location]);

  // Listen for storage events to update onboarding state
  useEffect(() => {
    const handleStorageChange = () => {
      const isCompleted = localStorage.getItem('onboardingCompleted') === 'true';
      setShowOnboarding(!isCompleted);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (loading || showOnboarding === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-gradient-to-br from-background via-background/95 to-background/90">
      <div className="flex h-screen overflow-hidden">
        {isAuthenticated && <Sidebar className="glass-sidebar" />}
        <main className="flex-1 overflow-y-auto relative">
          {/* Background gradient overlay */}
          <div className="fixed inset-0 -z-10 opacity-10 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
          </div>
          
          <div className="glass-panel mx-4 my-6 p-6 max-w-[2000px] mx-auto">
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                {/* Public Routes */}
                <Route path="/login" element={
                  <PageTransition>
                    {!isAuthenticated ? <Login /> : <Navigate to="/" replace />}
                  </PageTransition>
                } />
                
                <Route path="/signup" element={
                  <PageTransition>
                    {!isAuthenticated ? <Signup /> : <Navigate to="/" replace />}
                  </PageTransition>
                } />
                
                <Route path="/" element={
                  <PageTransition>
                    <ProtectedRoute>
                      {showOnboarding ? (
                        <Navigate to="/onboarding" state={{ from: '/' }} replace />
                      ) : (
                        <div className="glass-panel p-6 rounded-xl">
                          <Index />
                        </div>
                      )}
                    </ProtectedRoute>
                  </PageTransition>
                } />
                
                {/* Protected Routes */}
                <Route path="/onboarding" element={
                  <PageTransition>
                    {isAuthenticated ? (
                      showOnboarding ? (
                        <Onboarding onComplete={() => {
                          localStorage.setItem('onboardingCompleted', 'true');
                          setShowOnboarding(false);
                          const from = location.state?.from || '/';
                          navigate(from, { replace: true });
                        }} />
                      ) : (
                        <Navigate to={location.state?.from || '/'} replace />
                      )
                    ) : (
                      <Navigate to="/login" state={{ from: '/onboarding' }} replace />
                    )}
                  </PageTransition>
                } />
                
                <Route path="/call-history" element={
                  <PageTransition>
                    <ProtectedRoute requiredSubscription="demo">
                      <CallHistory />
                    </ProtectedRoute>
                  </PageTransition>
                } />
                
                <Route path="/calendar" element={
                  <PageTransition>
                    <ProtectedRoute requiredSubscription="demo">
                      <Calendar />
                    </ProtectedRoute>
                  </PageTransition>
                } />
                
                <Route path="/transcripts" element={
                  <PageTransition>
                    <ProtectedRoute requiredSubscription="demo">
                      <Transcripts />
                    </ProtectedRoute>
                  </PageTransition>
                } />
                
                <Route path="/contacts" element={
                  <PageTransition>
                    <ProtectedRoute requiredSubscription="basic">
                      <Contacts />
                    </ProtectedRoute>
                  </PageTransition>
                } />
                
                <Route path="/analytics" element={
                  <PageTransition>
                    <ProtectedRoute requiredSubscription="pro">
                      <Analytics />
                    </ProtectedRoute>
                  </PageTransition>
                } />
                
                <Route path="/data-sync" element={
                  <PageTransition>
                    <ProtectedRoute requiredSubscription="pro">
                      <DataSync />
                    </ProtectedRoute>
                  </PageTransition>
                } />
                
                <Route path="/active-calls" element={
                  <PageTransition>
                    <ProtectedRoute requiredSubscription="basic">
                      <ActiveCall />
                    </ProtectedRoute>
                  </PageTransition>
                } />
                
                <Route path="/call/:callId" element={
                  <PageTransition>
                    <ProtectedRoute requiredSubscription="basic">
                      <ActiveCall />
                    </ProtectedRoute>
                  </PageTransition>
                } />
                
                <Route path="/settings" element={
                  <PageTransition>
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  </PageTransition>
                } />
                
                <Route path="/settings/subscription" element={
                  <PageTransition>
                    <ProtectedRoute>
                      <div className="container mx-auto py-8">
                        <h1 className="text-3xl font-bold mb-8">Subscription Plans</h1>
                        <SubscriptionPlans />
                      </div>
                    </ProtectedRoute>
                  </PageTransition>
                } />
                
                <Route path="*" element={
                  <PageTransition>
                    <NotFound />
                  </PageTransition>
                } />
              </Routes>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

const App = () => {
  // Create a single router instance at the top level
  const router = createBrowserRouter([
    {
      path: "*",
      element: (
        <ThemeProvider>
          <TooltipProvider>
            <QueryClientProvider client={queryClient}>
              <AuthProvider>
                <WebSocketProvider>
                  <DashboardDataProvider>
                    <ErrorBoundary>
                      <AppContent />
                    </ErrorBoundary>
                  </DashboardDataProvider>
                </WebSocketProvider>
              </AuthProvider>
            </QueryClientProvider>
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </ThemeProvider>
      ),
    },
  ], {
    future: {
      v7_relativeSplatPath: true,
      v7_startTransition: true
    } as any
  });

  return <RouterProvider router={router} />;
};

export default App;
