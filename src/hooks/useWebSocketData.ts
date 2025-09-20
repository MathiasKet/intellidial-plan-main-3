import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { toast } from '@/components/ui/use-toast';

type UseWebSocketDataOptions<T> = {
  event: string;
  initialData: T;
  onMessage?: (data: T) => void;
  autoFetch?: boolean;
  fetchOnMount?: boolean;
};

export function useWebSocketData<T>({
  event,
  initialData,
  onMessage,
  autoFetch = true,
  fetchOnMount = true,
}: UseWebSocketDataOptions<T>) {
  const [data, setData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState(fetchOnMount);
  const [error, setError] = useState<Error | null>(null);
  const { subscribe, sendMessage, isConnected } = useWebSocket();

  const fetchData = useCallback(() => {
    if (!isConnected) return;
    
    setIsLoading(true);
    setError(null);
    
    // In a real app, you would implement the fetch logic here
    // For now, we'll simulate a fetch with a timeout
    const timer = setTimeout(() => {
      try {
        // Simulate successful fetch
        setData(initialData);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch data'));
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [event, initialData, isConnected]);

  // Initial fetch
  useEffect(() => {
    if (fetchOnMount) {
      fetchData();
    }
  }, [fetchData, fetchOnMount]);

  // Subscribe to WebSocket updates
  useEffect(() => {
    if (!autoFetch) return;
    
    const unsubscribe = subscribe(event, (newData: T) => {
      setData(newData);
      onMessage?.(newData);
    });

    return () => {
      unsubscribe?.();
    };
  }, [event, onMessage, subscribe, autoFetch]);

  // Handle connection state changes
  useEffect(() => {
    if (isConnected && fetchOnMount) {
      fetchData();
    }
  }, [isConnected, fetchData, fetchOnMount]);

  // Manual refresh function
  const refresh = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refresh,
    isConnected,
  } as const;
}

// Example usage:
/*
interface YourDataType {
  // Define your data type here
}

const { data, isLoading, error, refresh } = useWebSocketData<YourDataType>({
  event: 'your_event_name',
  initialData: {} as YourDataType,
  onMessage: (data) => {
    // Handle incoming WebSocket messages
    console.log('Received data:', data);
  },
  autoFetch: true,
  fetchOnMount: true,
});
*/
