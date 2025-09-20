import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, User, Mail, Key, Smartphone, Lock } from 'lucide-react';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [isMounted, setIsMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMounted || isLoading) return;
    
    if (password !== confirmPassword) {
      return setError("Passwords don't match");
    }

    if (password.length < 6) {
      return setError('Password should be at least 6 characters');
    }

    setError('');
    setIsLoading(true);

    try {
      await signup(name, email, password);
      setSuccess('Account created successfully! Redirecting...');
      
      // Add a small delay to show success message
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Start transition
      setIsTransitioning(true);
      
      // Wait for the transition to complete
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Navigate to dashboard
      if (isMounted) {
        navigate('/', { replace: true });
      }
    } catch (error) {
      setError('Failed to create an account. Please try again.');
      console.error('Signup error:', error);
      setIsLoading(false);
    }
  };

  // Background matching the dashboard
  const gradientStyle = {
    background: 'hsl(var(--background))',
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-background p-4 md:p-6 text-foreground transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`} style={gradientStyle}>
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left side - Branding and Welcome */}
        <div className="hidden lg:flex flex-col justify-center p-8 rounded-2xl" style={gradientStyle}>
          <div className="max-w-md mx-auto text-center lg:text-left">
            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
              Join <span className="text-primary">IntelliDial</span> Today
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Create your account and start making smarter calls with our intelligent calling platform.
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
        
        {/* Right side - Signup Form */}
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-md border border-border/40 bg-card/80 backdrop-blur-sm shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="bg-card p-8 pb-6 border-b border-border/20">
              <div className="flex justify-center mb-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-center text-foreground">
                Create an account
              </CardTitle>
              <CardDescription className="text-center text-muted-foreground">
                Join us today and get started
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="p-8 pt-6 space-y-4">
                {error && (
                  <Alert variant="destructive" className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">{error}</AlertDescription>
                  </Alert>
                )}
                
                {success && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-sm text-green-700">{success}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-muted-foreground">
                      Full Name
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        className="pl-10"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
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
                    <Label htmlFor="password" className="text-sm font-medium text-muted-foreground">
                      Password
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Key className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Create a password"
                        className="pl-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Must be at least 6 characters
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-sm font-medium text-muted-foreground">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Key className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Confirm your password"
                        className="pl-10"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
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
                  disabled={isLoading || !!success}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating account...
                    </>
                  ) : success ? 'Account Created!' : 'Create Account'}
                </Button>
                
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Already have an account?{' '}
                  <Link 
                    to="/login" 
                    className="font-medium text-primary hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
                
                <p className="text-xs text-center text-muted-foreground mt-2">
                  By signing up, you agree to our Terms of Service and Privacy Policy.
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
