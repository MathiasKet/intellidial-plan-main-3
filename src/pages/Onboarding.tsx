import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, ChevronLeft, ChevronRight, Smartphone, Phone, MessageSquare, BarChart2, Settings, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const features = [
  {
    title: "AI-Powered Calling",
    description: "Let our AI handle your calls with natural, human-like conversations.",
    icon: <Phone className="w-6 h-6 text-foreground" />,
  },
  {
    title: "Smart Messaging",
    description: "Automated responses and intelligent message routing for better communication.",
    icon: <MessageSquare className="w-6 h-6 text-foreground" />,
  },
  {
    title: "Advanced Analytics",
    description: "Track call performance and gain valuable insights with our analytics dashboard.",
    icon: <BarChart2 className="w-6 h-6 text-foreground" />,
  },
  {
    title: "Easy Setup",
    description: "Get started in minutes with our intuitive setup process.",
    icon: <Settings className="w-6 h-6 text-foreground" />,
  },
];

interface OnboardingProps {
  onComplete?: () => void;
}

const Onboarding = ({ onComplete }: OnboardingProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const navigate = useNavigate();

  const steps = [
    {
      title: "Welcome to AI Caller CRM",
      description: "Transform your business communications with our AI-powered calling solution.",
      content: (
        <div className="space-y-6">
          <div className="relative h-48 w-full bg-card border border-border/40 rounded-lg flex items-center justify-center">
            <div className="p-6 bg-primary/10 rounded-full">
              <Smartphone className="w-12 h-12 text-foreground" />
            </div>
            <div className="absolute -bottom-4 -right-4 bg-primary text-primary-foreground p-3 rounded-full shadow-md">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ),
    },
    {
      title: "How It Works",
      description: "See how AI Caller can transform your business communications.",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div key={feature.title} className="flex items-start space-x-4 p-4 rounded-lg border border-border/20 hover:bg-muted/20 transition-colors">
                <div className="bg-primary/10 p-2 rounded-lg text-foreground">
                  {feature.icon}
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "Get Started",
      description: "Set up your account and start making smarter calls today.",
      content: (
        <div className="space-y-6 text-center">
          <div className="mx-auto w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center">
            <Zap className="w-16 h-16 text-primary" />
          </div>
          <h3 className="text-2xl font-bold">You're all set!</h3>
          <p className="text-muted-foreground">
            Ready to transform your business communications? Let's get started with setting up your first campaign.
          </p>
        </div>
      ),
    },
  ];

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      // Move to next step
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps(prev => [...prev, currentStep]);
      }
      setCurrentStep(prev => prev + 1);
    } else {
      // Onboarding completed
      try {
        // Update local storage and trigger a storage event
        localStorage.setItem('onboardingCompleted', 'true');
        window.dispatchEvent(new Event('storage'));
        
        // Call the onComplete callback if provided
        if (onComplete) {
          onComplete();
        } else {
          // Fallback navigation if no callback provided
          window.location.href = '/';
        }
      } catch (error) {
        console.error('Error completing onboarding:', error);
        if (onComplete) {
          onComplete();
        } else {
          window.location.href = '/';
        }
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  // Check if onboarding is already completed
  useEffect(() => {
    try {
      const isCompleted = localStorage.getItem('onboardingCompleted');
      if (isCompleted === 'true') {
        // Use setTimeout to ensure component is mounted before navigation
        const timer = setTimeout(() => {
          navigate('/', { replace: true });
        }, 0);
        return () => clearTimeout(timer);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-gradient-to-br from-background via-background/95 to-background/90">
      {/* Background gradient overlay */}
      <div className="fixed inset-0 -z-10 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
      </div>

      <Card className="glass-panel w-full max-w-2xl overflow-hidden border-0 shadow-xl">
        <CardHeader className="bg-card/30 backdrop-blur-sm border-b border-border/30">
          <div className="flex flex-col items-center space-y-2">
            <div className="p-3 rounded-full bg-primary/10 backdrop-blur-md border border-primary/20">
              <Smartphone className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {steps[currentStep].title}
            </CardTitle>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              {steps[currentStep].description}
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-8 pt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {steps[currentStep].content}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={cn(
                "transition-all duration-200 text-muted-foreground hover:text-foreground",
                currentStep === 0 ? "opacity-0" : "opacity-100"
              )}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <Button 
              onClick={handleNext} 
              className="ml-auto glass-button"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  Get Started <Zap className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Next <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
