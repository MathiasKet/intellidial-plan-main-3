import { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';
import { useWebSocketData } from '@/hooks/useWebSocketData';
import { CallData, CallStats } from '@/types';
import { callService } from '@/services/callService';

interface DashboardDataContextType {
  calls: CallData[];
  stats: CallStats;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  makeCall: (phoneNumber: string) => Promise<CallData>;
  endCall: (callId: string, duration: number) => Promise<CallData>;
  searchCalls: (query: string) => Promise<CallData[]>;
}

const DashboardDataContext = createContext<DashboardDataContextType | undefined>(undefined);

// Default data shapes
const defaultStats: CallStats = {
  totalCalls: 0,
  completedCalls: 0,
  missedCalls: 0,
  averageDuration: 0,
  totalDuration: 0,
};

export function DashboardDataProvider({ children }: { children: ReactNode }) {
  const [calls, setCalls] = useState<CallData[]>([]);
  const [stats, setStats] = useState<CallStats>(defaultStats);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [callsData, statsData] = await Promise.all([
        callService.getCallHistory(),
        callService.getCallStats(),
      ]);
      
      setCalls(callsData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err instanceof Error ? err : new Error('Failed to load data'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle call updates from WebSocket
  useEffect(() => {
    const handleCallUpdate = (event: CustomEvent<CallData>) => {
      const updatedCall = event.detail;
      setCalls(prevCalls => {
        const existingIndex = prevCalls.findIndex(call => call.id === updatedCall.id);
        
        if (existingIndex >= 0) {
          // Update existing call
          const newCalls = [...prevCalls];
          newCalls[existingIndex] = updatedCall;
          return newCalls;
        } else {
          // Add new call
          return [updatedCall, ...prevCalls];
        }
      });
      
      // Update stats if needed
      if (updatedCall.status === 'completed' || updatedCall.status === 'missed') {
        setStats(prevStats => ({
          ...prevStats,
          totalCalls: prevStats.totalCalls + 1,
          completedCalls: updatedCall.status === 'completed' 
            ? prevStats.completedCalls + 1 
            : prevStats.completedCalls,
          missedCalls: updatedCall.status === 'missed' 
            ? prevStats.missedCalls + 1 
            : prevStats.missedCalls,
          totalDuration: updatedCall.status === 'completed'
            ? prevStats.totalDuration + updatedCall.duration
            : prevStats.totalDuration,
          averageDuration: updatedCall.status === 'completed'
            ? (prevStats.totalDuration + updatedCall.duration) / 
              (prevStats.completedCalls + 1)
            : prevStats.averageDuration,
        }));
      }
    };

    // @ts-ignore - CustomEvent type issue
    window.addEventListener('call:update', handleCallUpdate);
    
    return () => {
      // @ts-ignore - CustomEvent type issue
      window.removeEventListener('call:update', handleCallUpdate);
    };
  }, []);

  // Initial data load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Make a new call
  const makeCall = async (phoneNumber: string): Promise<CallData> => {
    try {
      setIsLoading(true);
      const newCall = await callService.makeCall(phoneNumber);
      return newCall;
    } catch (err) {
      console.error('Failed to make call:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // End an ongoing call
  const endCall = async (callId: string, duration: number): Promise<CallData> => {
    try {
      setIsLoading(true);
      const endedCall = await callService.endCall(callId, duration);
      return endedCall;
    } catch (err) {
      console.error('Failed to end call:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Search calls
  const searchCalls = async (query: string): Promise<CallData[]> => {
    try {
      setIsLoading(true);
      const results = await callService.searchCalls(query);
      return results;
    } catch (err) {
      console.error('Search failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh all data
  const refresh = async () => {
    await loadData();
  };

  return (
    <DashboardDataContext.Provider
      value={{
        calls,
        stats,
        isLoading,
        error,
        refresh,
        makeCall,
        endCall,
        searchCalls,
      }}
    >
      {children}
    </DashboardDataContext.Provider>
  );
}

export const useDashboardData = () => {
  const context = useContext(DashboardDataContext);
  if (!context) {
    throw new Error('useDashboardData must be used within a DashboardDataProvider');
  }
  return context;
};
