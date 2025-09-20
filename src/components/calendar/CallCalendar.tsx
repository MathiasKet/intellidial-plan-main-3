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
  CalendarDays, 
  Plus, 
  Phone, 
  Clock, 
  User,
  MapPin,
  Target
} from "lucide-react";

// Mock data for scheduled calls
const scheduledCalls = [
  {
    id: 1,
    date: new Date(2024, 2, 15),
    time: "09:00",
    contact: "John Smith",
    phone: "+1 (555) 123-4567",
    type: "outbound",
    purpose: "Follow-up",
    status: "scheduled"
  },
  {
    id: 2,
    date: new Date(2024, 2, 15),
    time: "14:30",
    contact: "Sarah Johnson",
    phone: "+1 (555) 987-6543",
    type: "outbound", 
    purpose: "Lead qualification",
    status: "scheduled"
  },
  {
    id: 3,
    date: new Date(2024, 2, 18),
    time: "11:15",
    contact: "Mike Wilson",
    phone: "+1 (555) 456-7890",
    type: "callback",
    purpose: "Product demo",
    status: "confirmed"
  }
];

export function CallCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);

  const callsForSelectedDate = scheduledCalls.filter(call => 
    selectedDate && 
    call.date.toDateString() === selectedDate.toDateString()
  );

  const getCallTypeColor = (type: string) => {
    switch (type) {
      case 'outbound': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'callback': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'follow-up': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
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
              <CalendarDays className="w-5 h-5 text-primary" />
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
            className="rounded-md border border-border/50"
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
          {callsForSelectedDate.length === 0 ? (
            <div className="text-center py-8">
              <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No calls scheduled for this date</p>
              <Button 
                className="mt-4 bg-gradient-primary hover:opacity-90"
                onClick={() => setIsScheduleDialogOpen(true)}
              >
                Schedule First Call
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {callsForSelectedDate.map((call) => (
                <div 
                  key={call.id}
                  className="p-4 rounded-lg bg-gradient-hero border border-border/50 hover:shadow-card transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{call.contact}</h4>
                          <p className="text-sm text-muted-foreground">{call.phone}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{call.time}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Target className="w-4 h-4" />
                          <span>{call.purpose}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2">
                      <Badge className={getCallTypeColor(call.type)}>
                        {call.type}
                      </Badge>
                      <Badge 
                        variant={call.status === 'confirmed' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {call.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}