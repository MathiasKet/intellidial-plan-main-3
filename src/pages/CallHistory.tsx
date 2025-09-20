import { useState, useEffect } from "react";
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
  MoreVertical
} from "lucide-react";
import { format, parseISO, isToday, isYesterday, isThisWeek } from "date-fns";

interface Call {
  id: string;
  contact: string;
  phone: string;
  type: 'inbound' | 'outbound';
  status: 'completed' | 'missed' | 'voicemail';
  duration: number;
  timestamp: string;
  notes?: string;
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

// Mock data
const mockCalls: Call[] = Array.from({ length: 25 }, (_, i) => {
  const types: ('inbound' | 'outbound')[] = ['inbound', 'outbound'];
  const statuses: ('completed' | 'missed' | 'voicemail')[] = ['completed', 'missed', 'voicemail'];
  const daysAgo = Math.floor(Math.random() * 30);
  const timestamp = new Date();
  timestamp.setDate(timestamp.getDate() - daysAgo);
  
  return {
    id: `call-${i + 1}`,
    contact: `Contact ${i + 1}`,
    phone: `+1 (555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
    type: types[Math.floor(Math.random() * types.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    duration: Math.floor(Math.random() * 600), // up to 10 minutes
    timestamp: timestamp.toISOString(),
    notes: Math.random() > 0.7 ? 'Important follow-up needed' : undefined
  };
}).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

export default function CallHistory() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [filteredCalls, setFilteredCalls] = useState<Call[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    // In a real app, this would be an API call
    setCalls(mockCalls);
    setFilteredCalls(mockCalls);
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

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold">Call History</h1>
          <p className="text-muted-foreground">View and manage your call records</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
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
            <div className="flex space-x-2">
              <div className="relative">
                <select
                  className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="missed">Missed</option>
                  <option value="voicemail">Voicemail</option>
                </select>
              </div>
              <div className="relative">
                <select
                  className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="inbound">Inbound</option>
                  <option value="outbound">Outbound</option>
                </select>
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
                    <tr key={call.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                      <td className="p-4 align-middle font-medium">{call.contact}</td>
                      <td className="p-4 align-middle text-muted-foreground">{call.phone}</td>
                      <td className="p-4 align-middle">
                        <Badge className={typeColors[call.type]}>
                          <div className="flex items-center">
                            {getCallIcon(call.type)}
                            <span className="ml-1">{call.type}</span>
                          </div>
                        </Badge>
                      </td>
                      <td className="p-4 align-middle">
                        <Badge className={statusColors[call.status]}>
                          {call.status}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle text-muted-foreground">
                        {formatDuration(call.duration)}
                      </td>
                      <td className="p-4 align-middle text-muted-foreground">
                        {formatDate(call.timestamp)}
                      </td>
                      <td className="p-4 align-middle text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">More options</span>
                        </Button>
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
    </div>
  );
}
