import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Lock, Mail, Key, Smartphone } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMounted || isLoading) return;
    
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      
      // Add a small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Start transition
      setIsTransitioning(true);
      
      // Wait for the transition to complete
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Navigate to dashboard
      if (isMounted) {
        navigate('/', { replace: true });
      }
    } catch (error) {
      setError('Failed to log in. Please check your credentials.');
      console.error('Login error:', error);
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    if (!isMounted || isLoading) return;
    
    setEmail('demo@example.com');
    setPassword('demo123');
    setIsLoading(true);
    
    try {
      await login('demo@example.com', 'demo123');
      
      // Add a small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Start transition
      setIsTransitioning(true);
      
      // Wait for the transition to complete
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Navigate to dashboard
      if (isMounted) {
        navigate('/', { replace: true });
      }
    } catch (error) {
      setError('Failed to log in with demo account.');
      console.error('Demo login error:', error);
      setIsLoading(false);
    }
  };

  // Background matching the dashboard
  const gradientStyle = {
    background: 'hsl(var(--background))',
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 md:p-6 text-foreground transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
      {/* Background gradient overlay */}
      <div className="fixed inset-0 -z-10 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
      </div>
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left side - Branding and Welcome */}
        <div className="hidden lg:flex flex-col justify-center p-12 rounded-2xl glass-panel border border-border/20 shadow-xl">
          <div className="max-w-md mx-auto text-center lg:text-left">
            <div className="inline-block p-3 mb-6 rounded-xl bg-primary/10 backdrop-blur-sm border border-primary/20">
              <Smartphone className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-4">
              Welcome to <span className="text-foreground">IntelliDial</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              The intelligent calling platform that helps you connect with your customers more effectively.
            </p>
            
            <div className="space-y-4 text-left">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Smartphone className="h-4 w-4 text-foreground" />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Smart Calling</h3>
                  <p className="text-sm text-muted-foreground">Make and receive calls with advanced features</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Lock className="h-4 w-4 text-foreground" />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Secure & Private</h3>
                  <p className="text-sm text-muted-foreground">Your data is always protected</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right side - Login Form */}
        <div className="flex items-center justify-center">
          <Card className="glass-panel w-full max-w-md mx-auto border-0 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-card/30 backdrop-blur-sm" />
            <div className="relative">
              <CardHeader className="space-y-1 p-8 pb-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 backdrop-blur-md flex items-center justify-center border border-primary/20">
                    <Key className="h-7 w-7 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Welcome back
                </CardTitle>
                <CardDescription className="text-center text-muted-foreground">
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              
              <form onSubmit={handleSubmit}>
                <CardContent className="p-8 pt-2 space-y-4">
                {error && (
                  <Alert variant="destructive" className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-muted-foreground">
                      Email address
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-sm font-medium text-muted-foreground">
                        Password
                      </Label>
                      <Link 
                        to="/forgot-password" 
                        className="text-xs text-primary hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Key className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="p-8 pt-0 flex flex-col space-y-4">
                <Button 
                  type="submit" 
                  className="w-full h-11 bg-primary hover:bg-primary/90 transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </>
                  ) : 'Sign in'}
                </Button>
                
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-background text-muted-foreground">
                      OR CONTINUE WITH
                    </span>
                  </div>
                </div>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full h-11 border-border hover:bg-accent/50 transition-colors" 
                  onClick={handleDemoLogin}
                  disabled={isLoading}
                >
                  <span className="text-foreground">Demo Account</span>
                </Button>
                
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Don't have an account?{' '}
                  <Link 
                    to="/signup" 
                    className="font-medium text-primary hover:underline"
                  >
                    Sign up
                  </Link>
                </p>
              </CardFooter>
            </form>
          </div>
        </Card>
      </div>
    </div>
  </div>
);
}
