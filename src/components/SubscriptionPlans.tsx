import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Check, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type SubscriptionTier = 'demo' | 'basic' | 'pro' | 'enterprise';

interface Plan {
  id: SubscriptionTier;
  name: string;
  price: string;
  description: string;
  features: string[];
  featured?: boolean;
  action: string;
  mostPopular?: boolean;
}

const plans: Plan[] = [
  {
    id: 'demo',
    name: 'Demo',
    price: '$0',
    description: 'Try out basic features',
    features: [
      'Basic calling features',
      'Up to 10 calls/month',
      'Email support',
      'Basic analytics',
    ],
    action: 'Current Plan',
  },
  {
    id: 'basic',
    name: 'Basic',
    price: '$19',
    description: 'For small businesses',
    features: [
      'Everything in Demo',
      'Up to 100 calls/month',
      'Priority support',
      'Advanced analytics',
    ],
    action: 'Upgrade to Basic',
    mostPopular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$49',
    description: 'For growing teams',
    features: [
      'Everything in Basic',
      'Unlimited calls',
      '24/7 support',
      'Advanced analytics',
      'API access',
    ],
    action: 'Upgrade to Pro',
    mostPopular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large organizations',
    features: [
      'Everything in Pro',
      'Custom call volume',
      'Dedicated account manager',
      'Custom integrations',
      'SLA 99.9%',
    ],
    action: 'Contact Sales',
  },
];

export default function SubscriptionPlans() {
  const { user, upgradeSubscription } = useAuth();
  const currentPlan = user?.subscription || 'demo';

  const handleUpgrade = (planId: SubscriptionTier) => {
    if (planId === 'enterprise') {
      // Open contact form or redirect to contact page
      window.location.href = 'mailto:sales@intellidial.com';
      return;
    }
    upgradeSubscription(planId);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
      {plans.map((plan) => {
        const isCurrentPlan = currentPlan === plan.id;
        const isLocked = 
          (plan.id === 'pro' && !['pro', 'enterprise'].includes(currentPlan)) ||
          (plan.id === 'enterprise' && currentPlan !== 'enterprise');

        return (
          <Card 
            key={plan.id}
            className={cn(
              'relative flex flex-col',
              plan.mostPopular ? 'border-primary' : ''
            )}
          >
            {plan.mostPopular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                Most Popular
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <div className="text-3xl font-bold">
                {plan.price}
                <span className="text-sm font-normal text-muted-foreground">
                  {plan.price !== 'Custom' ? '/month' : ''}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="mt-auto">
              <Button 
                className="w-full"
                variant={isCurrentPlan ? 'outline' : plan.mostPopular ? 'default' : 'outline'}
                disabled={isCurrentPlan || isLocked}
                onClick={() => handleUpgrade(plan.id)}
              >
                {isCurrentPlan ? 'Current Plan' : isLocked ? <Lock className="w-4 h-4 mr-2" /> : null}
                {isCurrentPlan ? plan.action : isLocked ? 'Upgrade Required' : plan.action}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
