import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Phone, Users, Clock } from "lucide-react";

interface Event {
  id: string;
  title: string;
  date: Date;
  time: string;
  type: 'call' | 'meeting' | 'reminder';
  participants: string[];
  status: 'scheduled' | 'completed' | 'cancelled';
}

const eventTypeColors = {
  call: 'bg-blue-100 text-blue-800 border-blue-200',
  meeting: 'bg-purple-100 text-purple-800 border-purple-200',
  reminder: 'bg-yellow-100 text-yellow-800 border-yellow-200'
};

// Generate mock events
const generateMockEvents = (): Event[] => {
  const events: Event[] = [];
  const today = new Date();
  
  // Add some events for the current month
  for (let i = 0; i < 10; i++) {
    const eventDate = new Date(today);
    eventDate.setDate(today.getDate() + Math.floor(Math.random() * 30) - 5);
    
    const eventTypes: ('call' | 'meeting' | 'reminder')[] = ['call', 'meeting', 'reminder'];
    const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    
    events.push({
      id: `event-${i}`,
      title: type === 'call' ? 'Client Call' : type === 'meeting' ? 'Team Meeting' : 'Follow Up',
      date: eventDate,
      time: `${Math.floor(Math.random() * 12) + 1}:${Math.random() > 0.5 ? '00' : '30'} ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
      type,
      participants: type === 'call' ? ['Client'] : ['Team Member 1', 'Team Member 2'],
      status: 'scheduled'
    });
  }
  
  return events;
};

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events] = useState<Event[]>(generateMockEvents());
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Get events for the selected date
  const selectedDateEvents = events.filter(event => 
    isSameDay(event.date, selectedDate)
  );
  
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  };

  return (
    <div className="flex-1 flex flex-col p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold">Call Calendar</h1>
          <p className="text-muted-foreground">Schedule and manage your calls</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Event
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" onClick={prevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-xl font-semibold">
                  {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <Button variant="ghost" size="icon" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                  {day}
                </div>
              ))}
              
              {Array.from({ length: monthStart.getDay() }).map((_, index) => (
                <div key={`empty-${index}`} className="h-24 p-1"></div>
              ))}
              
              {daysInMonth.map((day) => {
                const dayEvents = events.filter(event => isSameDay(event.date, day));
                const isSelected = isSameDay(selectedDate, day);
                const isCurrentDay = isToday(day);
                
                return (
                  <div 
                    key={day.toString()}
                    onClick={() => setSelectedDate(day)}
                    className={`h-24 p-1 border rounded-md transition-colors cursor-pointer ${
                      isSelected 
                        ? 'bg-primary/10 border-primary' 
                        : 'border-transparent hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex justify-between items-center p-1">
                        <span className={`text-sm ${
                          isCurrentDay 
                            ? 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center font-bold'
                            : 'font-medium'
                        }`}>
                          {format(day, 'd')}
                        </span>
                        {dayEvents.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 overflow-hidden space-y-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <div 
                            key={event.id}
                            className={`text-xs truncate px-1 rounded ${eventTypeColors[event.type]}`}
                          >
                            {event.time} {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-muted-foreground px-1">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2 text-primary" />
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedDateEvents.length > 0 ? (
                selectedDateEvents.map((event) => (
                  <div 
                    key={event.id}
                    className="p-3 rounded-lg border bg-card shadow-sm hover:shadow transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium flex items-center">
                          {event.type === 'call' && <Phone className="w-4 h-4 mr-2 text-blue-500" />}
                          {event.type === 'meeting' && <Users className="w-4 h-4 mr-2 text-purple-500" />}
                          {event.type === 'reminder' && <Clock className="w-4 h-4 mr-2 text-yellow-500" />}
                          {event.title}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {event.time} • {event.participants.join(', ')}
                        </div>
                      </div>
                      <Badge 
                        variant={event.status === 'completed' ? 'default' : 'outline'}
                        className={event.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {event.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No events scheduled for this day</p>
                  <Button variant="ghost" size="sm" className="mt-2">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Event
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t border-border/50">
              <Button variant="outline" className="w-full">
                <Clock className="w-4 h-4 mr-2" />
                Schedule a New Event
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle>Upcoming Calls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {events
                .filter(event => event.type === 'call' && new Date(event.date) > new Date())
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 3)
                .map(event => (
                  <div key={event.id} className="flex items-start space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Phone className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {format(event.date, 'MMM d')} • {event.time}
                      </div>
                    </div>
                  </div>
                ))}
              {events.filter(event => event.type === 'call' && new Date(event.date) > new Date()).length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  No upcoming calls
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
