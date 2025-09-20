import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Phone, 
  PhoneIncoming, 
  PhoneOutgoing, 
  Clock, 
  User,
  Play,
  FileText
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const recentCalls = [
  {
    id: 1,
    contact: "Emma Thompson",
    phone: "+1 (555) 234-5678",
    type: "inbound",
    duration: "5:42",
    status: "completed",
    timestamp: "2 minutes ago",
    outcome: "Lead qualified",
    transcriptId: "trans_001"
  },
  {
    id: 2,
    contact: "David Rodriguez",
    phone: "+1 (555) 345-6789",
    type: "outbound",
    duration: "3:18",
    status: "completed",
    timestamp: "8 minutes ago",
    outcome: "Follow-up scheduled",
    transcriptId: "trans_002"
  },
  {
    id: 3,
    contact: "Lisa Chen",
    phone: "+1 (555) 456-7890",
    type: "inbound",
    duration: "7:25",
    status: "completed",
    timestamp: "15 minutes ago",
    outcome: "Demo booked",
    transcriptId: "trans_003"
  },
  {
    id: 4,
    contact: "Robert Johnson",
    phone: "+1 (555) 567-8901",
    type: "outbound",
    duration: "2:03",
    status: "voicemail",
    timestamp: "23 minutes ago",
    outcome: "Left message",
    transcriptId: null
  },
  {
    id: 5,
    contact: "Amanda Wilson",
    phone: "+1 (555) 678-9012",
    type: "inbound",
    duration: "6:14",
    status: "completed",
    timestamp: "31 minutes ago",
    outcome: "Information provided",
    transcriptId: "trans_005"
  }
];

export function RecentCalls() {
  const navigate = useNavigate();
  
  const handleCallClick = (callId: number) => {
    // In a real app, you might want to check call status before navigating
    navigate(`/call/${callId}`);
  };

  const getCallIcon = (type: string) => {
    return type === 'inbound' ? PhoneIncoming : PhoneOutgoing;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'voicemail': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'missed': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'inbound' 
      ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      : 'bg-purple-500/20 text-purple-400 border-purple-500/30';
  };

  return (
    <Card className="bg-gradient-card backdrop-blur-glass border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Phone className="w-5 h-5 text-primary" />
          <span>Recent Calls</span>
          <Badge variant="secondary" className="ml-auto">
            {recentCalls.length} today
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentCalls.map((call) => {
            const CallIcon = getCallIcon(call.type);
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
                      <h4 className="font-semibold text-foreground">{call.contact}</h4>
                      <p className="text-sm text-muted-foreground">{call.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {call.transcriptId && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="hover:bg-accent/50"
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="hover:bg-accent/50"
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{call.duration}</span>
                    </div>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">{call.timestamp}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge className={getTypeColor(call.type)}>
                      {call.type}
                    </Badge>
                    <Badge className={getStatusColor(call.status)}>
                      {call.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="mt-2">
                  <p className="text-sm text-foreground font-medium">
                    Outcome: <span className="text-primary">{call.outcome}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}