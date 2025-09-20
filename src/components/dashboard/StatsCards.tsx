import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Phone, PhoneCall, Users, TrendingUp, Clock, CheckCircle } from "lucide-react";

const stats = [
  {
    title: "Total Calls Today",
    value: "247",
    change: "+12%",
    changeType: "positive" as const,
    icon: Phone,
    description: "Inbound: 156 • Outbound: 91"
  },
  {
    title: "Active Calls",
    value: "8",
    change: "Live",
    changeType: "neutral" as const,
    icon: PhoneCall,
    description: "Average wait time: 2.3s"
  },
  {
    title: "Leads Generated",
    value: "94",
    change: "+28%",
    changeType: "positive" as const,
    icon: Users,
    description: "Conversion rate: 38%"
  },
  {
    title: "Success Rate",
    value: "94.2%",
    change: "+2.1%",
    changeType: "positive" as const,
    icon: CheckCircle,
    description: "AI confidence: High"
  },
  {
    title: "Avg Call Duration",
    value: "4:32",
    change: "-8s",
    changeType: "positive" as const,
    icon: Clock,
    description: "Efficiency improved"
  },
  {
    title: "Revenue Impact",
    value: "$12,847",
    change: "+18%",
    changeType: "positive" as const,
    icon: TrendingUp,
    description: "Monthly projection: $38k"
  }
];

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat) => (
        <Card key={stat.title} className="relative overflow-hidden bg-gradient-card backdrop-blur-glass border-border/50 hover:shadow-elegant transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-hero opacity-50" />
          <CardHeader className="relative pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className="p-2 bg-primary/20 rounded-lg">
                <stat.icon className="w-4 h-4 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex items-baseline space-x-2">
              <div className="text-2xl font-bold text-foreground">
                {stat.value}
              </div>
              <div className={`text-sm font-medium ${
                stat.changeType === 'positive' 
                  ? 'text-green-400' 
                  : stat.changeType === 'neutral'
                  ? 'text-blue-400'
                  : 'text-red-400'
              }`}>
                {stat.change}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}