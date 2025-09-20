import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, PhoneIncoming, PhoneOutgoing } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { useDashboardData } from '@/contexts/DashboardDataContext';
import { toast } from '@/components/ui/use-toast';

interface CallControlsProps {
  onCallStart?: (callId: string) => void;
  onCallEnd?: (callId: string, duration: number) => void;
}

export function CallControls({ onCallStart, onCallEnd }: CallControlsProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [volume, setVolume] = useState(80);
  
  const { makeCall, endCall } = useDashboardData();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle call timer
  useEffect(() => {
    if (isInCall) {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isInCall]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCall = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a phone number',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (!isInCall) {
        // Start a new call
        const call = await makeCall(phoneNumber);
        setActiveCallId(call.id);
        setIsInCall(true);
        setCallDuration(0);
        onCallStart?.(call.id);
        
        toast({
          title: 'Call started',
          description: `Calling ${phoneNumber}...`,
        });
      } else {
        // End the current call
        if (activeCallId) {
          const endedCall = await endCall(activeCallId, callDuration);
          onCallEnd?.(activeCallId, callDuration);
          
          toast({
            title: 'Call ended',
            description: `Call with ${phoneNumber} lasted ${formatTime(callDuration)}`,
          });
        }
        
        setIsInCall(false);
        setActiveCallId(null);
      }
    } catch (error) {
      console.error('Call operation failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to process call. Please try again.',
        variant: 'destructive',
      });
      
      if (isInCall && activeCallId) {
        // If ending the call failed, force end it
        await endCall(activeCallId, callDuration).catch(console.error);
      }
      
      setIsInCall(false);
      setActiveCallId(null);
    }
  };

  return (
    <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-2">
          <Input
            type="tel"
            placeholder="Enter phone number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={isInCall}
            className="flex-1"
          />
          <Button 
            onClick={handleCall}
            variant={isInCall ? 'destructive' : 'default'}
            size="icon"
          >
            {isInCall ? <PhoneOff className="h-5 w-5" /> : <Phone className="h-5 w-5" />}
          </Button>
        </div>

        {isInCall && (
          <>
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <div className="flex items-center">
                {activeCallId && (
                  <span className="inline-flex items-center mr-2">
                    {phoneNumber.startsWith('+') ? (
                      <PhoneIncoming className="h-4 w-4 mr-1 text-green-500" />
                    ) : (
                      <PhoneOutgoing className="h-4 w-4 mr-1 text-blue-500" />
                    )}
                    {phoneNumber}
                  </span>
                )}
              </div>
              <div className="font-mono">{formatTime(callDuration)}</div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMuted(!isMuted)}
                className={isMuted ? 'bg-muted' : ''}
              >
                {isMuted ? (
                  <MicOff className="h-5 w-5 text-destructive" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
                <span className="sr-only">{isMuted ? 'Unmute' : 'Mute'}</span>
              </Button>

              <div className="flex items-center space-x-2 w-32">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                >
                  {isSpeakerOn ? (
                    <Volume2 className="h-5 w-5" />
                  ) : (
                    <VolumeX className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className="sr-only">
                    {isSpeakerOn ? 'Speaker On' : 'Speaker Off'}
                  </span>
                </Button>
                <Slider
                  value={[volume]}
                  onValueChange={([value]) => setVolume(value)}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                  disabled={!isSpeakerOn}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
