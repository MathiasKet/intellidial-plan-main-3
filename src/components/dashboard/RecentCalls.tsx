import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Phone, 
  PhoneIncoming, 
  PhoneOutgoing, 
  Clock, 
  Play,
  FileText
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CallData } from "@/types";

interface RecentCallsProps {
  calls: CallData[];
}

// Helper function to safely create a date from a string
const safeCreateDate = (dateString: string): Date | null => {
  try {
    const date = new Date(dateString);
    // Check if the date is valid
    return isNaN(date.getTime()) ? null : date;
  } catch (e) {
    console.error('Error creating date:', e);
    return null;
  }
};

const formatTimeAgo = (dateString: string) => {
  const date = safeCreateDate(dateString);
  if (!date) return '--';
  
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

const formatDuration = (seconds: number): string => {
  if (!seconds) return '0s';
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
};

export function RecentCalls({ calls = [] }: RecentCallsProps) {
  const navigate = useNavigate();

  const handleCallClick = (callId: string) => {
    // In a real app, you might want to check call status before navigating
    navigate(`/call/${callId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in-progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'scheduled': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'missed': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'voicemail': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getCallType = (call: CallData) => {
    // Determine if the call was inbound or outbound based on the from/to numbers
    // This is a simple example - you might need to adjust based on your actual data
    return call.from.startsWith('+1') ? 'outbound' : 'inbound';
  };

  const getCallIcon = (call: CallData) => {
    return getCallType(call) === 'inbound' ? PhoneIncoming : PhoneOutgoing;
  };

  return (
    <Card className="bg-gradient-card backdrop-blur-glass border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Phone className="w-5 h-5 text-primary" />
          <span>Recent Calls</span>
          <Badge variant="secondary" className="ml-auto">
            {calls.length} today
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {calls.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No recent calls found</p>
            </div>
          ) : (
            calls.slice(0, 5).map((call) => {
              const callType = getCallType(call);
              const CallIcon = getCallIcon(call);
              
              return (
                <div 
                  key={call.id}
                  onClick={() => handleCallClick(call.id)}
                  className="p-4 rounded-lg bg-gradient-hero border border-border/50 hover:shadow-card transition-all duration-200 cursor-pointer hover:border-primary/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                        <CallIcon className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{call.from}</h4>
                        <p className="text-sm text-muted-foreground">To: {call.to}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {call.recordingUrl && (
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="hover:bg-accent/50"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle play recording
                            window.open(call.recordingUrl, '_blank');
                          }}
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{formatDuration(call.duration || 0)}</span>
                      </div>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">{formatTimeAgo(call.timestamp)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(call.status)}>
                        {call.status}
                      </Badge>
                      <Badge variant="outline">
                        {callType}
                      </Badge>
                    </div>
                  </div>
                  
                  {call.transcript && (
                    <div className="mt-2 pt-2 border-t border-border/50">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {call.transcript}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}