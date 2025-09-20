import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths, parseISO } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Phone, Users, Clock, X, Pencil, Trash2, Check, Clock as ClockIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { v4 as uuidv4 } from 'uuid';

interface Event {
  id: string;
  title: string;
  date: Date;
  time: string;
  type: 'call' | 'meeting' | 'reminder';
  participants: string[];
  status: 'scheduled' | 'completed' | 'cancelled';
}

// Event type colors mapping
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
  const [events, setEvents] = useState<Event[]>(generateMockEvents());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  
  // Form state for new/edited event
  const [eventForm, setEventForm] = useState({
    title: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '12:00',
    type: 'call' as 'call' | 'meeting' | 'reminder',
    participants: '',
    notes: '',
    status: 'scheduled' as 'scheduled' | 'completed' | 'cancelled'
  });
  
  // Reset form to default values
  const resetEventForm = () => {
    setEventForm({
      title: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      time: '12:00',
      type: 'call',
      participants: '',
      notes: '',
      status: 'scheduled'
    });
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEventForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setEventForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Open dialog to create a new event
  const openNewEventDialog = (date?: Date) => {
    resetEventForm();
    if (date) {
      setEventForm(prev => ({
        ...prev,
        date: format(date, 'yyyy-MM-dd')
      }));
    }
    setCurrentEvent(null);
    setIsDialogOpen(true);
  };
  
  // Open dialog to edit an existing event
  const openEditEventDialog = (event: Event) => {
    setCurrentEvent(event);
    setEventForm({
      title: event.title,
      date: format(event.date, 'yyyy-MM-dd'),
      time: event.time,
      type: event.type,
      participants: event.participants.join(', '),
      notes: '', // Add notes field if needed
      status: event.status
    });
    setIsDialogOpen(true);
  };
  
  // Save event (create or update)
  const saveEvent = () => {
    const newEvent: Event = {
      id: currentEvent?.id || uuidv4(),
      title: eventForm.title,
      date: parseISO(`${eventForm.date}T${eventForm.time}`),
      time: eventForm.time,
      type: eventForm.type,
      participants: eventForm.participants.split(',').map(p => p.trim()).filter(Boolean),
      status: eventForm.status
    };
    
    if (currentEvent) {
      // Update existing event
      setEvents(events.map(evt => evt.id === currentEvent.id ? newEvent : evt));
    } else {
      // Add new event
      setEvents([...events, newEvent]);
    }
    
    setIsDialogOpen(false);
    resetEventForm();
  };
  
  // Delete an event
  const deleteEvent = () => {
    if (eventToDelete) {
      setEvents(events.filter(event => event.id !== eventToDelete));
      setIsDeleteDialogOpen(false);
      setEventToDelete(null);
    }
  };
  
  // Toggle event status
  const toggleEventStatus = (eventId: string, newStatus: 'scheduled' | 'completed' | 'cancelled') => {
    setEvents(events.map(event => 
      event.id === eventId ? { ...event, status: newStatus } : event
    ));
  };
  
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
          <Button onClick={() => openNewEventDialog()}>
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
                    className="p-3 rounded-lg border bg-card shadow-sm hover:shadow transition-shadow group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="font-medium flex items-center">
                            {event.type === 'call' && <Phone className="w-4 h-4 mr-2 text-blue-500" />}
                            {event.type === 'meeting' && <Users className="w-4 h-4 mr-2 text-purple-500" />}
                            {event.type === 'reminder' && <Clock className="w-4 h-4 mr-2 text-yellow-500" />}
                            {event.title}
                          </div>
                          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditEventDialog(event);
                              }}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEventToDelete(event.id);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {event.time} • {event.participants.join(', ')}
                        </div>
                      </div>
                      <div className="flex flex-col items-end ml-2">
                        <Badge 
                          variant={event.status === 'completed' ? 'default' : 'outline'}
                          className={`mb-1 ${
                            event.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            event.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''
                          }`}
                        >
                          {event.status}
                        </Badge>
                        {event.status === 'scheduled' && (
                          <div className="flex space-x-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 px-2 text-xs text-green-600 hover:bg-green-50"
                              onClick={() => toggleEventStatus(event.id, 'completed')}
                            >
                              <Check className="h-3.5 w-3.5 mr-1" />
                              Complete
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 px-2 text-xs text-red-600 hover:bg-red-50"
                              onClick={() => toggleEventStatus(event.id, 'cancelled')}
                            >
                              <X className="h-3.5 w-3.5 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No events scheduled for this day</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => openNewEventDialog(selectedDate)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Event
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t border-border/50">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => openNewEventDialog(selectedDate)}
              >
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
      
      {/* Event Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{currentEvent ? 'Edit Event' : 'New Event'}</DialogTitle>
            <DialogDescription>
              {currentEvent ? 'Update the event details' : 'Fill in the details to schedule a new event'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                name="title"
                value={eventForm.title}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="Event title"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={eventForm.date}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="time" className="text-right">
                Time
              </Label>
              <Input
                id="time"
                name="time"
                type="time"
                value={eventForm.time}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select 
                value={eventForm.type} 
                onValueChange={(value) => handleSelectChange('type', value as any)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="participants" className="text-right">
                Participants
              </Label>
              <Input
                id="participants"
                name="participants"
                value={eventForm.participants}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="Enter emails or names, separated by commas"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select 
                value={eventForm.status} 
                onValueChange={(value) => handleSelectChange('status', value as any)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="notes" className="text-right mt-2">
                Notes
              </Label>
              <Textarea
                id="notes"
                name="notes"
                value={eventForm.notes}
                onChange={handleInputChange}
                className="col-span-3"
                rows={3}
                placeholder="Add any additional notes"
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            {currentEvent && (
              <Button 
                variant="destructive" 
                type="button"
                onClick={() => {
                  setEventToDelete(currentEvent.id);
                  setIsDeleteDialogOpen(true);
                  setIsDialogOpen(false);
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            )}
            <div className="space-x-2">
              <Button 
                variant="outline" 
                type="button"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="button"
                onClick={saveEvent}
                disabled={!eventForm.title}
              >
                {currentEvent ? 'Update' : 'Create'} Event
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setEventToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={deleteEvent}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
