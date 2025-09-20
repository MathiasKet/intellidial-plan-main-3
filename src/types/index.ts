// User types
export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  subscription: SubscriptionTier;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SubscriptionTier = 'free' | 'basic' | 'pro' | 'enterprise';

// Call types
export interface CallData {
  id: string;
  from: string;
  to: string;
  status: 'completed' | 'missed' | 'in-progress' | 'scheduled';
  duration: number; // in seconds
  timestamp: string;
  recordingUrl?: string;
  transcript?: string;
  sentiment?: number; // -1 to 1
}

export interface CallStats {
  totalCalls: number;
  completedCalls: number;
  missedCalls: number;
  averageDuration: number;
  totalDuration: number;
}

// WebSocket types
export interface WebSocketMessage<T = any> {
  type: string;
  data: T;
  timestamp: string;
}

// Theme types
export type Theme = 'light' | 'dark' | 'system';

// Form types
export interface FormField<T> {
  value: T;
  error?: string;
  touched: boolean;
  validate: (value: T) => string | undefined;
}

// API Response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  success: boolean;
}
