import { toast } from "@/components/ui/use-toast";

type ToastType = 'success' | 'error' | 'warning' | 'info';

export const showToast = ({
  title,
  description,
  type = 'info',
  duration = 3000,
}: {
  title: string;
  description?: string;
  type?: ToastType;
  duration?: number;
}) => {
  const baseClasses = {
    success: {
      variant: 'default',
      className: 'bg-green-500 text-white border-green-600',
    },
    error: {
      variant: 'destructive',
      className: 'bg-red-500 text-white border-red-600',
    },
    warning: {
      variant: 'default',
      className: 'bg-amber-500 text-white border-amber-600',
    },
    info: {
      variant: 'default',
      className: 'bg-blue-500 text-white border-blue-600',
    },
  };

  const { variant, className } = baseClasses[type];

  toast({
    title,
    description,
    variant: variant as any,
    className,
    duration,
  });
};

// Convenience methods
export const toastSuccess = (title: string, description?: string) =>
  showToast({ title, description, type: 'success' });

export const toastError = (title: string, description?: string) =>
  showToast({ title, description, type: 'error' });

export const toastWarning = (title: string, description?: string) =>
  showToast({ title, description, type: 'warning' });

export const toastInfo = (title: string, description?: string) =>
  showToast({ title, description, type: 'info' });
