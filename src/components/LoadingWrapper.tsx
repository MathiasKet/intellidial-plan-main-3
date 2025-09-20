import { ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

type LoadingWrapperProps = {
  isLoading: boolean;
  loadingComponent?: ReactNode;
  error?: Error | null;
  errorComponent?: (error: Error) => ReactNode;
  children: ReactNode;
  className?: string;
};

export function LoadingWrapper({
  isLoading,
  loadingComponent,
  error,
  errorComponent,
  children,
  className = '',
}: LoadingWrapperProps) {
  if (error) {
    return errorComponent ? (
      <>{errorComponent(error)}</>
    ) : (
      <div className={`p-4 text-destructive ${className}`}>
        Error: {error.message}
      </div>
    );
  }

  if (isLoading) {
    return loadingComponent ? (
      <>{loadingComponent}</>
    ) : (
      <div className={`space-y-4 ${className}`}>
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  return <>{children}</>;
}
