import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Calendar as CalendarIcon,
  Plus, 
  Phone, 
  Clock, 
  User,
  MapPin,
  Target
} from "lucide-react";
import { CallData } from "@/types";

interface CallCalendarProps {
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

// Helper function to get calls for a specific date
const getCallsForDate = (date: Date, calls: CallData[]) => {
  return calls.filter(call => {
    const callDate = safeCreateDate(call.timestamp);
    return callDate ? callDate.toDateString() === date.toDateString() : false;
  });
};

const formatTime = (dateString: string) => {
  const date = safeCreateDate(dateString);
  return date ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';
};

const formatDuration = (seconds: number): string => {
  if (!seconds) return '0s';
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
};

export function CallCalendar({ calls = [] }: CallCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);

  // Get calls for the selected date
  const callsForSelectedDate = selectedDate ? getCallsForDate(selectedDate, calls) : [];

  const hasCallsOnDate = (date: Date) => {
    return calls.some(call => {
      const callDate = safeCreateDate(call.timestamp);
      return callDate ? callDate.toDateString() === date.toDateString() : false;
    });
  };

  const getCallStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in-progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'scheduled': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'missed': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <Card className="lg:col-span-1 bg-gradient-card backdrop-blur-glass border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              <span>Call Schedule</span>
            </CardTitle>
            <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-gradient-primary hover:opacity-90">
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-gradient-card backdrop-blur-glass border-border/50">
                <DialogHeader>
                  <DialogTitle>Schedule AI Call</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contact-name">Contact Name</Label>
                      <Input id="contact-name" placeholder="John Doe" />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" placeholder="+1 (555) 123-4567" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="call-type">Call Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="outbound">Outbound Sales</SelectItem>
                          <SelectItem value="callback">Callback</SelectItem>
                          <SelectItem value="follow-up">Follow-up</SelectItem>
                          <SelectItem value="survey">Survey</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="time">Time</Label>
                      <Input id="time" type="time" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="purpose">Call Purpose</Label>
                    <Textarea 
                      id="purpose" 
                      placeholder="Describe the goal of this call..."
                      className="resize-none"
                    />
                  </div>

                  <Button className="w-full bg-gradient-primary hover:opacity-90">
                    Schedule AI Call
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
            modifiers={{
              hasCalls: (date) => hasCallsOnDate(date)
            }}
            modifiersClassNames={{
              hasCalls: 'bg-blue-500/10 border-blue-500/30'
            }}
          />
        </CardContent>
      </Card>

      {/* Scheduled Calls for Selected Date */}
      <Card className="lg:col-span-2 bg-gradient-card backdrop-blur-glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Phone className="w-5 h-5 text-primary" />
            <span>
              Calls for {selectedDate?.toLocaleDateString() || 'Today'}
            </span>
            <Badge variant="secondary" className="ml-auto">
              {callsForSelectedDate.length} scheduled
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {callsForSelectedDate.length > 0 ? (
            <div className="space-y-4">
              {callsForSelectedDate.map((call) => (
                <div key={call.id} className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{call.from}</h3>
                      <p className="text-sm text-muted-foreground">To: {call.to}</p>
                    </div>
                    <Badge className={getCallStatusColor(call.status)}>
                      {call.status}
                    </Badge>
                  </div>
                  
                  <div className="mt-2 flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{formatTime(call.timestamp)}</span>
                    {call.duration > 0 && (
                      <span className="mx-2">•</span>
                    )}
                    {call.duration > 0 && (
                      <span>Duration: {formatDuration(call.duration)}</span>
                    )}
                  </div>
                  
                  {call.transcript && (
                    <div className="mt-2 pt-2 border-t border-border/50">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {call.transcript}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No calls scheduled for this date</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}