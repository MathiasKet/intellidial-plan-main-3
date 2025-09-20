import { Skeleton } from "@/components/ui/skeleton";

interface DashboardSkeletonProps {
  statsOnly?: boolean;
  calendarOnly?: boolean;
  recentCallsOnly?: boolean;
}

export function DashboardSkeleton({ 
  statsOnly = false, 
  calendarOnly = false, 
  recentCallsOnly = false 
}: DashboardSkeletonProps = {}) {
  if (statsOnly) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  if (calendarOnly) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[500px] rounded-xl" />
      </div>
    );
  }

  if (recentCallsOnly) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Calendar */}
        <div className="lg:col-span-4 space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-[500px] rounded-xl" />
        </div>

        {/* Recent Calls */}
        <div className="lg:col-span-3 space-y-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-32 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const StatCardSkeleton = () => (
  <div className="space-y-2">
    <Skeleton className="h-4 w-24" />
    <Skeleton className="h-8 w-32" />
    <Skeleton className="h-3 w-20" />
  </div>
);
