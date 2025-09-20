import { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { toast } from '@/components/ui/use-toast';

type WebSocketMessage = {
  type: string;
  data: any;
};

type WebSocketContextType = {
  subscribe: (event: string, callback: (data: any) => void) => () => void;
  sendMessage: (event: string, data: any) => void;
  isConnected: boolean;
};

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, user } = useAuth();
  const ws = useRef<WebSocket | null>(null);
  const eventListeners = useRef<Map<string, Set<(data: any) => void>>>(new Map());
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectTimeout = useRef<NodeJS.Timeout>();

  const connect = () => {
    if (ws.current?.readyState === WebSocket.OPEN) return;

    // In a real app, you would get this from your environment config
    const wsUrl = `wss://your-api-url/ws?token=${user?.id}`;
    
    try {
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        reconnectAttempts.current = 0;
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          const listeners = eventListeners.current.get(message.type);
          if (listeners) {
            listeners.forEach(callback => callback(message.data));
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
        attemptReconnect();
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        ws.current?.close();
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
      attemptReconnect();
    }
  };

  const attemptReconnect = () => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      toast({
        title: 'Connection lost',
        description: 'Unable to connect to the server. Please refresh the page.',
        variant: 'destructive',
      });
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
    reconnectAttempts.current++;

    reconnectTimeout.current = setTimeout(() => {
      console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})`);
      connect();
    }, delay);
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      connect();
    }

    return () => {
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };
  }, [isAuthenticated, user?.id]);

  const subscribe = (event: string, callback: (data: any) => void) => {
    if (!eventListeners.current.has(event)) {
      eventListeners.current.set(event, new Set());
    }
    const listeners = eventListeners.current.get(event)!;
    listeners.add(callback);

    return () => {
      listeners.delete(callback);
      if (listeners.size === 0) {
        eventListeners.current.delete(event);
      }
    };
  };

  const sendMessage = (event: string, data: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: event, data }));
      return true;
    }
    console.warn('WebSocket is not connected');
    return false;
  };

  return (
    <WebSocketContext.Provider
      value={{
        subscribe,
        sendMessage,
        isConnected: ws.current?.readyState === WebSocket.OPEN,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
