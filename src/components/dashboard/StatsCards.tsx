import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Phone, CheckCircle, XCircle, Clock } from "lucide-react";
import { CallStats } from "@/types";

interface StatsCardsProps {
  stats?: CallStats;
}

const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
};

export function StatsCards({ stats }: StatsCardsProps) {
  const {
    totalCalls = 0,
    completedCalls = 0,
    missedCalls = 0,
    averageDuration = 0,
    totalDuration = 0
  } = stats || {};

  const completionRate = totalCalls > 0 
    ? Math.round((completedCalls / totalCalls) * 100) 
    : 0;

  const avgDurationFormatted = formatDuration(averageDuration);
  const totalDurationFormatted = formatDuration(totalDuration);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
          <Phone className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCalls.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {totalDurationFormatted} total talk time
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completedCalls.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {completionRate}% completion rate
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Missed</CardTitle>
          <XCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{missedCalls.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {totalCalls > 0 ? Math.round((missedCalls / totalCalls) * 100) : 0}% of calls
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Duration</CardTitle>
          <Clock className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgDurationFormatted}</div>
          <p className="text-xs text-muted-foreground">
            {totalDurationFormatted} total duration
          </p>
        </CardContent>
      </Card>
    </div>
  );
}