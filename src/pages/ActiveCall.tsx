import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Mic, MicOff, Volume2, VolumeX, PhoneOff, MessageSquare, User, Clock, Calendar } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CallDetails {
  id: string;
  contactName: string;
  phoneNumber: string;
  status: 'ringing' | 'in-progress' | 'on-hold' | 'ended';
  duration: number;
  startTime: string;
  callPurpose?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

const ActiveCall = () => {
  const { callId } = useParams<{ callId: string }>();
  const navigate = useNavigate();
  const [call, setCall] = useState<CallDetails | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<string>("");

  // Mock data - in a real app, this would come from an API
  useEffect(() => {
    // Simulate fetching call details
    const mockCall: CallDetails = {
      id: callId || '123',
      contactName: 'John Doe',
      phoneNumber: '+1 (555) 123-4567',
      status: 'in-progress',
      duration: 0,
      startTime: new Date().toISOString(),
      callPurpose: 'Follow up on product demo',
      sentiment: 'neutral'
    };
    
    setCall(mockCall);
    
    // Start call timer
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    
    // Simulate receiving transcript updates
    const transcriptUpdates = [
      "Hello, this is John.",
      "I'm calling about the product demo we had last week.",
      "I had a few questions about the pricing plans.",
      "Could you explain the difference between the Pro and Enterprise plans?"
    ];
    
    let currentTranscript = "";
    let updateIndex = 0;
    
    const transcriptInterval = setInterval(() => {
      if (updateIndex < transcriptUpdates.length) {
        currentTranscript += (currentTranscript ? "\n" : "") + transcriptUpdates[updateIndex];
        setTranscript(currentTranscript);
        updateIndex++;
      }
    }, 5000);
    
    return () => {
      clearInterval(timer);
      clearInterval(transcriptInterval);
    };
  }, [callId]);
  
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleEndCall = () => {
    // In a real app, this would trigger the end call API
    console.log('Ending call', callId);
    navigate('/');
  };
  
  const toggleMute = () => {
    // In a real app, this would toggle the microphone
    setIsMuted(!isMuted);
    console.log('Microphone', !isMuted ? 'muted' : 'unmuted');
  };
  
  const toggleSpeaker = () => {
    // In a real app, this would toggle the speaker
    setIsSpeakerOn(!isSpeakerOn);
    console.log('Speaker', !isSpeakerOn ? 'on' : 'off');
  };
  
  const toggleRecording = () => {
    // In a real app, this would start/stop call recording
    setIsRecording(!isRecording);
    console.log('Recording', !isRecording ? 'started' : 'stopped');
  };

  if (!call) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Connecting to call...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-background">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Call Header */}
        <header className="bg-gradient-card backdrop-blur-glass border-b border-border/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="text-muted-foreground hover:text-foreground"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="m12 19-7-7 7-7" />
                  <path d="M19 12H5" />
                </svg>
                <span className="sr-only">Back</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Active Call</h1>
                <p className="text-muted-foreground">Call ID: {call.id}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                <span>{formatDuration(callDuration)}</span>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm ${
                call.status === 'in-progress' 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              }`}>
                {call.status === 'in-progress' ? 'In Progress' : 'Call Status'}
              </div>
            </div>
          </div>
        </header>

        {/* Main Call Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Caller Info */}
              <div className="lg:col-span-1">
                <Card className="border-border/50 bg-card/50 backdrop-blur">
                  <CardHeader>
                    <div className="flex flex-col items-center space-y-4">
                      <Avatar className="h-24 w-24 border-4 border-primary/20">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(call.contactName)}`} />
                        <AvatarFallback className="text-2xl">
                          {call.contactName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-center">
                        <h3 className="text-xl font-semibold">{call.contactName}</h3>
                        <p className="text-muted-foreground">{call.phoneNumber}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Started: {new Date(call.startTime).toLocaleTimeString()}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <MessageSquare className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Purpose: {call.callPurpose || 'General inquiry'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Call Controls */}
                <div className="mt-6 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Button
                      variant="outline"
                      size="lg"
                      className={`flex-col h-auto py-4 ${isMuted ? 'bg-destructive/10 hover:bg-destructive/20' : ''}`}
                      onClick={toggleMute}
                    >
                      {isMuted ? (
                        <MicOff className="h-6 w-6 mb-2 text-destructive" />
                      ) : (
                        <Mic className="h-6 w-6 mb-2" />
                      )}
                      <span className="text-xs">{isMuted ? 'Unmute' : 'Mute'}</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="lg"
                      className="flex-col h-auto py-4"
                      onClick={toggleSpeaker}
                    >
                      {isSpeakerOn ? (
                        <Volume2 className="h-6 w-6 mb-2" />
                      ) : (
                        <VolumeX className="h-6 w-6 mb-2" />
                      )}
                      <span className="text-xs">Speaker</span>
                    </Button>
                    
                    <Button
                      variant={isRecording ? 'destructive' : 'outline'}
                      size="lg"
                      className="flex-col h-auto py-4"
                      onClick={toggleRecording}
                    >
                      <div className="relative">
                        <svg
                          className={`h-6 w-6 mb-2 ${isRecording ? 'animate-pulse' : ''}`}
                          fill="none"
                          height="24"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          width="24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                          <line x1="12" x2="12" y1="19" y2="22" />
                        </svg>
                        {isRecording && (
                          <span className="absolute top-0 right-0 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                          </span>
                        )}
                      </div>
                      <span className="text-xs">{isRecording ? 'Stop' : 'Record'}</span>
                    </Button>
                  </div>
                  
                  <Button
                    variant="destructive"
                    size="lg"
                    className="w-full py-6 text-base font-medium"
                    onClick={handleEndCall}
                  >
                    <PhoneOff className="h-5 w-5 mr-2" />
                    End Call
                  </Button>
                </div>
              </div>
              
              {/* Call Transcript */}
              <div className="lg:col-span-2">
                <Card className="h-full border-border/50 bg-card/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                      Call Transcript
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[500px] overflow-y-auto p-4 bg-muted/10 rounded-lg">
                      {transcript ? (
                        <div className="space-y-4">
                          {transcript.split('\n').map((line, i) => (
                            <div key={i} className="flex">
                              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                                <User className="h-4 w-4 text-primary" />
                              </div>
                              <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow-sm">
                                <p className="text-sm">{line}</p>
                              </div>
                            </div>
                          ))}
                          <div className="flex justify-end">
                            <div className="flex items-center">
                              <div className="bg-primary/10 text-primary rounded-lg px-4 py-2 shadow-sm max-w-xs">
                                <p className="text-sm">I'd be happy to help you with that. Let me explain the differences between our Pro and Enterprise plans.</p>
                              </div>
                              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center ml-3">
                                <User className="h-4 w-4" />
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          <p>Waiting for call to begin...</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 flex">
                      <input
                        type="text"
                        placeholder="Type a message..."
                        className="flex-1 rounded-l-md border border-r-0 border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <Button className="rounded-l-none">
                        Send
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Call Analytics */}
            <div className="mt-6">
              <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-lg">Call Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Sentiment</h4>
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></div>
                        <span className="text-sm">Neutral</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Talk/Listen Ratio</h4>
                      <div className="flex items-center">
                        <div className="w-full bg-muted rounded-full h-2.5 mr-2">
                          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '60%' }}></div>
                        </div>
                        <span className="text-sm">60/40</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Keywords</h4>
                      <div className="flex flex-wrap gap-1">
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">pricing</span>
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">demo</span>
                        <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">features</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ActiveCall;
