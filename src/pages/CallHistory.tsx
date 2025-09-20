import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Phone, 
  PhoneIncoming, 
  PhoneOutgoing, 
  PhoneMissed, 
  Voicemail, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  X,
  Plus,
  Trash2,
  MessageSquare,
  Clock,
  Calendar as CalendarIcon,
  User,
  PhoneCall,
  ChevronDown,
  Check
} from "lucide-react";
import { format, parseISO, isToday, isYesterday, isThisWeek } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

interface Call {
  id: string;
  contact: string;
  phone: string;
  type: 'inbound' | 'outbound';
  status: 'completed' | 'missed' | 'voicemail';
  duration: number;
  timestamp: string;
  notes?: string;
  tags?: string[];
  callRecording?: string;
}

const statusColors = {
  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  missed: 'bg-red-500/20 text-red-400 border-red-500/30',
  voicemail: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
};

const typeColors = {
  inbound: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  outbound: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
};

// Mock data with more realistic call data
const mockCalls: Call[] = Array.from({ length: 25 }, (_, i) => {
  const types: ('inbound' | 'outbound')[] = ['inbound', 'outbound'];
  const statuses: ('completed' | 'missed' | 'voicemail')[] = ['completed', 'missed', 'voicemail'];
  const daysAgo = Math.floor(Math.random() * 30);
  const timestamp = new Date();
  timestamp.setDate(timestamp.getDate() - daysAgo);
  const callType = types[Math.floor(Math.random() * types.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const duration = Math.floor(Math.random() * 600);
  
  // More realistic contact names
  const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia'];
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  // Add some tags based on call status/type
  const tags = [];
  if (callType === 'inbound' && status === 'completed') tags.push('Follow Up');
  if (callType === 'outbound' && status === 'missed') tags.push('Callback');
  if (status === 'voicemail') tags.push('Voicemail Left');
  
  return {
    id: `call-${i + 1}`,
    contact: `${firstName} ${lastName}`,
    phone: `+1 (${Math.floor(200 + Math.random() * 800)}) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
    type: callType,
    status: status,
    duration: duration,
    timestamp: timestamp.toISOString(),
    notes: Math.random() > 0.7 ? 'Important follow-up needed' : undefined,
    tags: tags.length > 0 ? tags : undefined,
    callRecording: status === 'completed' && Math.random() > 0.5 ? 'recording.mp3' : undefined
  };
}).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

// Call Detail Component
const CallDetailDialog = ({ call, isOpen, onClose, onSaveNote, onDelete }: {
  call: Call | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveNote: (callId: string, note: string) => void;
  onDelete: (callId: string) => void;
}) => {
  const [note, setNote] = useState(call?.notes || '');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (call) {
      setNote(call.notes || '');
      setIsEditing(false);
    }
  }, [call]);

  if (!call) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={`p-2 rounded-full ${call.type === 'inbound' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
              {call.type === 'inbound' ? <PhoneIncoming className="h-5 w-5" /> : <PhoneOutgoing className="h-5 w-5" />}
            </div>
            <div>
              <div className="text-lg font-semibold">{call.contact}</div>
              <div className="text-sm text-muted-foreground">{call.phone}</div>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Status</div>
              <div className="flex items-center">
                <Badge className={statusColors[call.status]}>
                  {call.status.charAt(0).toUpperCase() + call.status.slice(1)}
                </Badge>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Duration</div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                <span>{formatDuration(call.duration)}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">Date & Time</div>
              <div className="text-sm">
                {format(parseISO(call.timestamp), 'MMM d, yyyy h:mm a')}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">Notes</div>
              {!isEditing && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2 text-xs"
                  onClick={() => setIsEditing(true)}
                >
                  {note ? 'Edit' : 'Add Note'}
                </Button>
              )}
            </div>
            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add notes about this call..."
                  rows={3}
                />
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setIsEditing(false);
                      setNote(call.notes || '');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => {
                      onSaveNote(call.id, note);
                      setIsEditing(false);
                    }}
                  >
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div className="min-h-[60px] rounded-md border border-input p-3 text-sm">
                {note || 'No notes for this call.'}
              </div>
            )}
          </div>
          
          {call.callRecording && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Recording</div>
              <div className="flex items-center space-x-2 p-2 bg-muted/50 rounded-md">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Call Recording</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDuration(call.duration)} • {format(parseISO(call.timestamp), 'MMM d, yyyy')}
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="sm:justify-between">
          <Button 
            variant="destructive" 
            className="mr-auto"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this call record?')) {
                onDelete(call.id);
                onClose();
              }
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button>
              <Phone className="h-4 w-4 mr-2" />
              Call Back
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function CallHistory() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [filteredCalls, setFilteredCalls] = useState<Call[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const itemsPerPage = 10;
  const filterRef = useRef<HTMLDivElement>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Simulate loading data
  const loadCalls = async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    setCalls(mockCalls);
    setFilteredCalls(mockCalls);
    if (isRefresh) {
      setIsRefreshing(false);
      toast({
        title: "Call history refreshed",
        description: `Updated with ${mockCalls.length} calls`,
      });
    }
  };

  // Load initial data
  useEffect(() => {
    loadCalls();
  }, []);

  useEffect(() => {
    let result = [...calls];
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(call => 
        call.contact.toLowerCase().includes(term) || 
        call.phone.includes(term) ||
        (call.notes && call.notes.toLowerCase().includes(term))
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(call => call.status === statusFilter);
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
      result = result.filter(call => call.type === typeFilter);
    }
    
    setFilteredCalls(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, statusFilter, typeFilter, calls]);

  // Get current calls for pagination
  const indexOfLastCall = currentPage * itemsPerPage;
  const indexOfFirstCall = indexOfLastCall - itemsPerPage;
  const currentCalls = filteredCalls.slice(indexOfFirstCall, indexOfLastCall);
  const totalPages = Math.ceil(filteredCalls.length / itemsPerPage);

  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    if (isThisWeek(date)) return format(date, 'EEEE'); // Day of the week
    return format(date, 'MMM d, yyyy');
  };

  // Handle call back
  const handleCallBack = (phone: string) => {
    toast({
      title: "Initiating call",
      description: `Calling ${phone}...`,
    });
    // In a real app, this would trigger a call via your telephony API
    console.log("Calling:", phone);
  };

  // Handle save note
  const handleSaveNote = (callId: string, note: string) => {
    setCalls(calls.map(call => 
      call.id === callId ? { ...call, notes: note } : call
    ));
    toast({
      title: "Note saved",
      description: "Your note has been saved successfully.",
    });
  };

  // Handle delete call
  const handleDeleteCall = (callId: string) => {
    setCalls(calls.filter(call => call.id !== callId));
    setFilteredCalls(filteredCalls.filter(call => call.id !== callId));
    toast({
      title: "Call deleted",
      description: "The call has been removed from your history.",
    });
  };

  // Handle export
  const handleExport = () => {
    setIsExporting(true);
    // Simulate export delay
    setTimeout(() => {
      const csvContent = [
        ["Contact", "Phone", "Type", "Status", "Duration", "Date", "Notes"],
        ...filteredCalls.map(call => [
          call.contact,
          call.phone,
          call.type,
          call.status,
          formatDuration(call.duration),
          format(parseISO(call.timestamp), 'yyyy-MM-dd HH:mm'),
          call.notes || ''
        ])
      ].map(row => row.join(",")).join("\n");

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `call-history-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setIsExporting(false);
      toast({
        title: "Export complete",
        description: `Exported ${filteredCalls.length} calls to CSV`,
      });
    }, 1000);
  };

  // Open call detail
  const openCallDetail = (call: Call) => {
    setSelectedCall(call);
    setIsDetailOpen(true);
  };

  const getCallIcon = (type: string) => {
    switch (type) {
      case 'inbound':
        return <PhoneIncoming className="w-4 h-4" />;
      case 'outbound':
        return <PhoneOutgoing className="w-4 h-4" />;
      default:
        return <Phone className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Call History</h1>
          <p className="text-muted-foreground">
            View and manage your call history
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExport}
            disabled={isExporting || filteredCalls.length === 0}
          >
            {isExporting ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => loadCalls(true)}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader className="pb-0">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search calls..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative" ref={filterRef}>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-10 px-3"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                </Button>
                
                {isFilterOpen && (
                  <div className="absolute right-0 z-10 mt-2 w-64 rounded-md border bg-popover p-4 shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Filters</h4>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 px-2 text-xs"
                        onClick={() => {
                          setStatusFilter('all');
                          setTypeFilter('all');
                        }}
                      >
                        Reset
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="mb-1 block text-sm font-medium">Call Type</label>
                        <Select 
                          value={typeFilter} 
                          onValueChange={setTypeFilter}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="All Types" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="inbound">Inbound</SelectItem>
                            <SelectItem value="outbound">Outbound</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="mb-1 block text-sm font-medium">Status</label>
                        <Select 
                          value={statusFilter} 
                          onValueChange={setStatusFilter}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="All Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="missed">Missed</SelectItem>
                            <SelectItem value="voicemail">Voicemail</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Contact</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Phone</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Type</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Duration</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentCalls.length > 0 ? (
                  currentCalls.map((call) => (
                    <tr 
                      key={call.id} 
                      className="border-b border-border/50 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => openCallDetail(call)}
                    >
                      <td className="p-4 align-middle">
                        <div className="font-medium">{call.contact}</div>
                        {call.tags && call.tags.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {call.tags.map((tag, i) => (
                              <span key={i} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-secondary text-secondary-foreground">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="p-4 align-middle text-muted-foreground">{call.phone}</td>
                      <td className="p-4 align-middle">
                        <Badge className={`${typeColors[call.type]} hover:opacity-80`}>
                          <div className="flex items-center">
                            {getCallIcon(call.type)}
                            <span className="ml-1">
                              {call.type === 'inbound' ? 'Incoming' : 'Outgoing'}
                            </span>
                          </div>
                        </Badge>
                      </td>
                      <td className="p-4 align-middle">
                        <Badge className={`${statusColors[call.status]} hover:opacity-80`}>
                          {call.status.charAt(0).toUpperCase() + call.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle text-muted-foreground">
                        {formatDuration(call.duration)}
                      </td>
                      <td className="p-4 align-middle text-muted-foreground">
                        <div className="text-sm">{formatDate(call.timestamp)}</div>
                        <div className="text-xs opacity-70">
                          {format(parseISO(call.timestamp), 'h:mm a')}
                        </div>
                      </td>
                      <td className="p-4 align-middle text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">More options</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCallBack(call.phone);
                              }}
                            >
                              <Phone className="mr-2 h-4 w-4" />
                              <span>Call Back</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCall(call);
                                setIsDetailOpen(true);
                              }}
                            >
                              <MessageSquare className="mr-2 h-4 w-4" />
                              <span>View Details</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm('Are you sure you want to delete this call record?')) {
                                  handleDeleteCall(call.id);
                                }
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No calls found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
        {filteredCalls.length > 0 && (
          <CardFooter className="flex items-center justify-between border-t border-border/50 px-6 py-4">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{indexOfFirstCall + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(indexOfLastCall, filteredCalls.length)}
              </span>{' '}
              of <span className="font-medium">{filteredCalls.length}</span> results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous</span>
              </Button>
              <div className="text-sm">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next</span>
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
      
      {/* Call Detail Dialog */}
      <CallDetailDialog 
        call={selectedCall}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onSaveNote={handleSaveNote}
        onDelete={handleDeleteCall}
      />
    </div>
  );
}
