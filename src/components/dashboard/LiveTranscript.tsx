import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Phone,
  PhoneOff,
  User,
  Bot
} from "lucide-react";

// Mock live transcript data
const mockTranscript = [
  {
    id: 1,
    speaker: "AI Agent",
    type: "ai",
    text: "Hello! Thank you for calling. My name is Sarah, your AI assistant. How can I help you today?",
    timestamp: "10:30:15",
    confidence: 0.98
  },
  {
    id: 2,
    speaker: "Customer",
    type: "human",
    text: "Hi, I'm interested in learning more about your software solutions for small businesses.",
    timestamp: "10:30:22",
    confidence: 0.94
  },
  {
    id: 3,
    speaker: "AI Agent", 
    type: "ai",
    text: "That's wonderful! I'd be happy to tell you about our small business solutions. Can you tell me a bit about your current business and what challenges you're facing?",
    timestamp: "10:30:28",
    confidence: 0.97
  },
  {
    id: 4,
    speaker: "Customer",
    type: "human",
    text: "We're a marketing agency with about 15 employees. We're struggling with project management and client communication.",
    timestamp: "10:30:35",
    confidence: 0.91
  },
  {
    id: 5,
    speaker: "AI Agent",
    type: "ai",
    text: "I understand. Those are common challenges for growing agencies. Our platform includes integrated project management tools and a client portal that can streamline your workflows. Would you like me to schedule a demo for you?",
    timestamp: "10:30:42",
    confidence: 0.96
  }
];

interface LiveCallData {
  callId: string;
  contact: string;
  phone: string;
  duration: string;
  status: 'active' | 'on-hold' | 'ended';
}

export function LiveTranscript() {
  const [callData] = useState<LiveCallData>({
    callId: "call_456789",
    contact: "Michael Thompson",
    phone: "+1 (555) 123-4567",
    duration: "05:23",
    status: 'active'
  });

  const [isMuted, setIsMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(true);

  return (
    <Card className="bg-gradient-card backdrop-blur-glass border-border/50 h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Phone className="w-5 h-5 text-primary" />
            <span>Live Call Transcript</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge 
              variant={callData.status === 'active' ? 'default' : 'secondary'}
              className={callData.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' : ''}
            >
              ● {callData.status}
            </Badge>
            <Badge variant="outline" className="font-mono">
              {callData.duration}
            </Badge>
          </div>
        </div>
        
        {/* Call Info */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{callData.contact}</p>
              <p className="text-xs text-muted-foreground">{callData.phone}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant={isMuted ? "destructive" : "ghost"}
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            <Button
              size="sm"
              variant={isRecording ? "default" : "ghost"}
              onClick={() => setIsRecording(!isRecording)}
            >
              {isRecording ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30"
            >
              <PhoneOff className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="h-80">
        <ScrollArea className="h-full">
          <div className="space-y-4">
            {mockTranscript.map((message) => (
              <div 
                key={message.id}
                className={`flex ${message.type === 'ai' ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`max-w-[80%] p-3 rounded-lg ${
                  message.type === 'ai' 
                    ? 'bg-gradient-primary text-primary-foreground' 
                    : 'bg-gradient-hero border border-border/50'
                }`}>
                  <div className="flex items-center space-x-2 mb-1">
                    {message.type === 'ai' ? (
                      <Bot className="w-4 h-4" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                    <span className="text-xs font-medium">{message.speaker}</span>
                    <span className="text-xs opacity-70">{message.timestamp}</span>
                  </div>
                  <p className="text-sm">{message.text}</p>
                  <div className="flex items-center justify-between mt-2">
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${
                        message.type === 'ai' 
                          ? 'bg-white/20 text-white' 
                          : 'bg-primary/20 text-primary'
                      }`}
                    >
                      {Math.round(message.confidence * 100)}% confidence
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Real-time indicator */}
            <div className="flex justify-center">
              <div className="flex items-center space-x-2 px-3 py-1 bg-primary/20 rounded-full text-primary text-xs">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span>Listening...</span>
              </div>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}