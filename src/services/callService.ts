import { toast } from '@/components/ui/use-toast';
import { CallData } from '@/types';

// Simulated API calls
const API_BASE_URL = '/api/calls';

// Simulated delay for API calls
const simulateNetworkDelay = async (ms = 300) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const callService = {
  // Make a new call
  async makeCall(phoneNumber: string): Promise<CallData> {
    await simulateNetworkDelay();
    
    // In a real app, this would be an actual API call
    const newCall: CallData = {
      id: `call-${Date.now()}`,
      from: 'Current User',
      to: phoneNumber,
      status: 'in-progress',
      duration: 0,
      timestamp: new Date().toISOString(),
      sentiment: 0,
    };

    // Simulate WebSocket update
    window.dispatchEvent(new CustomEvent('call:update', { detail: newCall }));
    
    return newCall;
  },

  // End an ongoing call
  async endCall(callId: string, duration: number): Promise<CallData> {
    await simulateNetworkDelay();
    
    // In a real app, this would be an actual API call
    const updatedCall: CallData = {
      id: callId,
      from: 'Current User',
      to: '123-456-7890', // Would be the actual number
      status: 'completed',
      duration,
      timestamp: new Date().toISOString(),
      sentiment: Math.random() * 2 - 1, // Random sentiment for demo
    };

    // Simulate WebSocket update
    window.dispatchEvent(new CustomEvent('call:update', { detail: updatedCall }));
    
    return updatedCall;
  },

  // Get call history
  async getCallHistory(): Promise<CallData[]> {
    await simulateNetworkDelay(500);
    
    // Return sample data for demo
    const now = new Date();
    const calls: CallData[] = [];
    
    // Generate sample calls for the past week
    for (let i = 0; i < 20; i++) {
      const callDate = new Date(now);
      callDate.setDate(now.getDate() - Math.floor(i / 3));
      callDate.setHours(9 + (i % 8), (i * 7) % 60);
      
      const statuses: Array<'completed' | 'missed' | 'in-progress' | 'scheduled'> = 
        ['completed', 'missed', 'in-progress', 'scheduled'];
      
      calls.push({
        id: `call-${i}`,
        from: i % 2 === 0 ? `+1${Math.floor(1000000000 + Math.random() * 9000000000)}` : 'Current User',
        to: i % 2 === 0 ? 'Current User' : `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        status: statuses[i % statuses.length],
        duration: Math.floor(Math.random() * 600),
        timestamp: callDate.toISOString(),
        sentiment: Math.random() * 2 - 1,
        recordingUrl: Math.random() > 0.5 ? 'https://example.com/recording' : undefined,
        transcript: Math.random() > 0.5 ? 'Sample transcript text...' : undefined,
      });
    }
    
    return calls;
  },

  // Get call statistics
  async getCallStats(): Promise<{
    totalCalls: number;
    completedCalls: number;
    missedCalls: number;
    averageDuration: number;
    totalDuration: number;
  }> {
    await simulateNetworkDelay(300);
    
    // In a real app, this would be an actual API call
    return {
      totalCalls: 124,
      completedCalls: 89,
      missedCalls: 35,
      averageDuration: 165, // in seconds
      totalDuration: 20460, // in seconds
    };
  },

  // Search calls
  async searchCalls(query: string): Promise<CallData[]> {
    await simulateNetworkDelay(200);
    const calls = await this.getCallHistory();
    const searchTerm = query.toLowerCase();
    
    return calls.filter(call => 
      call.from.toLowerCase().includes(searchTerm) ||
      call.to.toLowerCase().includes(searchTerm) ||
      call.status.toLowerCase().includes(searchTerm)
    );
  },
};
