import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Download, RefreshCw, Calendar, Phone, PhoneIncoming, PhoneOutgoing, Voicemail, Clock, MessageSquare, Loader2, PhoneMissed } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { callService } from "@/services/callService";
import { CallData } from "@/types";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Extend CallData with additional properties for the UI
interface Transcript extends Omit<CallData, 'transcript' | 'sentiment'> {
  contact: string;
  summary: string;
  keywords: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  transcript?: Array<{
    speaker: 'agent' | 'customer';
    text: string;
    timestamp: string;
  }>;
}

const sentimentColors = {
  positive: 'bg-green-100 text-green-800',
  neutral: 'bg-blue-100 text-blue-800',
  negative: 'bg-red-100 text-red-800'
};

const typeColors = {
  inbound: 'bg-blue-100 text-blue-800',
  outbound: 'bg-purple-100 text-purple-800',
  scheduled: 'bg-yellow-100 text-yellow-800',
  'in-progress': 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800',
  missed: 'bg-red-100 text-red-800'
};

const statusIcons = {
  'in-progress': <Clock className="h-3.5 w-3.5" />,
  completed: <PhoneIncoming className="h-3.5 w-3.5" />,
  missed: <PhoneMissed className="h-3.5 w-3.5" />,
  scheduled: <Calendar className="h-3.5 w-3.5" />
};

const formatDuration = (seconds: number): string => {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const getCallType = (call: Transcript) => {
  if (call.status === 'missed') return 'missed';
  return call.from === 'Current User' ? 'outbound' : 'inbound';
};

export default function Transcripts() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTranscript, setSelectedTranscript] = useState<Transcript | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'duration' | 'sentiment'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch call history on component mount
  useEffect(() => {
    const fetchCalls = async () => {
      try {
        setIsLoading(true);
        const calls = await callService.getCallHistory();
        
        // Transform call data to include UI-specific fields
        const transformedCalls: Transcript[] = calls.map(call => ({
          ...call,
          contact: call.from === 'Current User' ? call.to : call.from,
          summary: call.transcript || 'No transcript available',
          keywords: [
            call.status,
            call.duration > 300 ? 'long-call' : 'short-call',
            call.sentiment > 0.3 ? 'positive' : call.sentiment < -0.3 ? 'negative' : 'neutral'
          ],
          sentiment: call.sentiment > 0.3 ? 'positive' : 
                    call.sentiment < -0.3 ? 'negative' : 'neutral',
          transcript: call.transcript ? [{
            speaker: call.from === 'Current User' ? 'agent' : 'customer',
            text: call.transcript,
            timestamp: format(new Date(call.timestamp), 'HH:mm')
          }] : undefined
        }));
        
        setTranscripts(transformedCalls);
      } catch (error) {
        console.error('Failed to fetch call history:', error);
        toast({
          title: 'Error',
          description: 'Failed to load call history. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalls();
  }, [toast]);

  const filteredTranscripts = transcripts.filter(transcript => {
    const matchesSearch = searchTerm === '' || 
      (transcript.contact?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (transcript.summary?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (transcript.keywords || []).some(keyword => 
        keyword.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'inbound' && getCallType(transcript) === 'inbound') ||
      (activeTab === 'outbound' && getCallType(transcript) === 'outbound') ||
      (activeTab === 'voicemail' && transcript.status === 'missed');
    
    return matchesSearch && matchesTab;
  });

  const sortedTranscripts = [...filteredTranscripts].sort((a: Transcript, b: Transcript) => {
    if (sortBy === 'date') {
      return sortOrder === 'asc' 
        ? new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        : new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    } else if (sortBy === 'duration') {
      return sortOrder === 'asc' 
        ? (a.duration || 0) - (b.duration || 0)
        : (b.duration || 0) - (a.duration || 0);
    } else {
      // sentiment
      return sortOrder === 'asc' 
        ? (a.sentiment === 'negative' ? -1 : a.sentiment === 'neutral' ? 0 : 1) - 
          (b.sentiment === 'negative' ? -1 : b.sentiment === 'neutral' ? 0 : 1)
        : (b.sentiment === 'positive' ? 1 : b.sentiment === 'neutral' ? 0 : -1) - 
          (a.sentiment === 'positive' ? 1 : a.sentiment === 'neutral' ? 0 : -1);
    }
  });

  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      const calls = await callService.getCallHistory();
      // Transform calls with proper typing
      const transformedCalls = calls.map(call => ({
        ...call,
        contact: call.from === 'Current User' ? call.to : call.from,
        summary: call.transcript || 'No transcript available',
        keywords: [
          call.status || 'completed',
          (call.duration || 0) > 300 ? 'long-call' : 'short-call',
          (call.sentiment || 0) > 0.3 ? 'positive' : (call.sentiment || 0) < -0.3 ? 'negative' : 'neutral'
        ],
        sentiment: (call.sentiment || 0) > 0.3 ? 'positive' : 
                 (call.sentiment || 0) < -0.3 ? 'negative' : 'neutral' as const,
        transcript: call.transcript ? [{
          speaker: (call.from === 'Current User' ? 'agent' : 'customer') as 'agent' | 'customer',
          text: call.transcript,
          timestamp: format(new Date(call.timestamp), 'HH:mm')
        }] : undefined,
        duration: call.duration || 0,
        status: call.status || 'completed',
        timestamp: call.timestamp
      } as Transcript));
      
      setTranscripts(transformedCalls);
      toast({
        title: 'Refreshed',
        description: 'Call history has been updated.',
      });
    } catch (error) {
      console.error('Failed to refresh call history:', error);
      toast({
        title: 'Error',
        description: 'Failed to refresh call history. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    try {
      // In a real app, this would generate and download a CSV or PDF
      const data = JSON.stringify(selectedTranscript || sortedTranscripts, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = selectedTranscript 
        ? `transcript-${selectedTranscript.id}.json` 
        : 'transcripts-export.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Export successful',
        description: selectedTranscript 
          ? 'Transcript has been exported.' 
          : 'All transcripts have been exported.',
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: 'Export failed',
        description: 'There was an error exporting the transcript(s).',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold">Call Transcripts</h1>
          <p className="text-muted-foreground">Review and manage your call transcripts</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExport}
            disabled={isLoading || (selectedTranscript ? false : sortedTranscripts.length === 0)}
          >
            <Download className="w-4 h-4 mr-2" />
            {selectedTranscript ? 'Export Selected' : 'Export All'}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Transcript List */}
        <Card className="lg:col-span-1 border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search transcripts..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <Tabs 
                defaultValue="all" 
                className="w-full"
                onValueChange={(value) => setActiveTab(value)}
              >
                <TabsList className="w-full grid grid-cols-4 h-10 bg-muted/50 p-1 rounded-lg">
                  <TabsTrigger value="all" className="flex items-center justify-center gap-2">
                    <span>All</span>
                    <Badge variant="secondary" className="px-1.5 h-5 text-xs font-normal">
                      {transcripts.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="inbound" className="flex items-center justify-center gap-2">
                    <PhoneIncoming className="h-3.5 w-3.5" />
                    <span>Inbound</span>
                    <Badge variant="secondary" className="px-1.5 h-5 text-xs font-normal">
                      {transcripts.filter(t => getCallType(t) === 'inbound').length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="outbound" className="flex items-center justify-center gap-2">
                    <PhoneOutgoing className="h-3.5 w-3.5" />
                    <span>Outbound</span>
                    <Badge variant="secondary" className="px-1.5 h-5 text-xs font-normal">
                      {transcripts.filter(t => getCallType(t) === 'outbound').length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="voicemail" className="flex items-center justify-center gap-2">
                    <Voicemail className="h-3.5 w-3.5" />
                    <span>Missed</span>
                    <Badge variant="secondary" className="px-1.5 h-5 text-xs font-normal">
                      {transcripts.filter(t => t.status === 'missed').length}
                    </Badge>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Sort by:</span>
                <Select 
                  value={sortBy} 
                  onValueChange={(value) => setSortBy(value as 'date' | 'duration' | 'sentiment')}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="duration">Duration</SelectItem>
                    <SelectItem value="sentiment">Sentiment</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </Button>
              </div>
            </div>
            
            <div className="mt-4 space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2 -mr-2">
                {isLoading ? (
                  <div className="flex items-center justify-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : sortedTranscripts.length > 0 ? (
                sortedTranscripts.map((transcript) => (
                  <div 
                    key={transcript.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedTranscript?.id === transcript.id 
                        ? 'bg-primary/5 border-primary shadow-sm' 
                        : 'border-border/50 hover:bg-muted/30 hover:border-border/70'
                    }`}
                    onClick={() => setSelectedTranscript(transcript)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 w-full">
                        <div className={`p-1.5 rounded-md ${typeColors[getCallType(transcript)]} mt-0.5`}>
                          {getCallType(transcript) === 'inbound' 
                            ? <PhoneIncoming className="w-4 h-4" />
                            : <PhoneOutgoing className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">{transcript.contact}</p>
                            <Badge 
                              variant="outline" 
                              className={`ml-2 text-xs ${sentimentColors[transcript.sentiment]} border-transparent`}
                            >
                              {transcript.sentiment}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                    {getCallType(transcript) === 'inbound' ? transcript.from : transcript.to}
                  </p>
                          <div className="flex items-center text-xs text-muted-foreground">
                            {statusIcons[transcript.status as keyof typeof statusIcons] || 
                             <Phone className="h-3 w-3 mr-1" />}
                            <span className="ml-1">{formatDuration(transcript.duration || 0)}</span>
                            <span className="mx-1.5">•</span>
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>{format(new Date(transcript.timestamp), 'MMM d')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {transcript.summary}
                    </p>
                    {transcript.keywords && transcript.keywords.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {transcript.keywords.slice(0, 3).map((keyword, i) => (
                          <span 
                            key={i} 
                            className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                          >
                            {keyword}
                          </span>
                        ))}
                        {transcript.keywords.length > 3 && (
                          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                            +{transcript.keywords.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-1">
                    {searchTerm ? 'No matching transcripts' : 'No transcripts yet'}
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm 
                      ? 'Try adjusting your search or filter criteria.'
                      : 'Make some calls to see them appear here.'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Transcript Detail */}
        <div className="lg:col-span-3 space-y-6">
          {selectedTranscript ? (
            <Card className="border-border/50 bg-card/50 backdrop-blur h-full">
              <CardHeader>
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl">{selectedTranscript.contact}</CardTitle>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="w-4 h-4 mr-1" />
                          {selectedTranscript.contact === selectedTranscript.to 
                            ? selectedTranscript.from 
                            : selectedTranscript.to}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 mr-1" />
                          {format(new Date(selectedTranscript.timestamp), 'MMM d, yyyy h:mm a')}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatDuration(selectedTranscript.duration || 0)}
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`${sentimentColors[selectedTranscript.sentiment]} border-transparent`}
                        >
                          {selectedTranscript.sentiment}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleExport}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                      <Button size="sm">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Follow up
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="capitalize">
                      {selectedTranscript.status}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {getCallType(selectedTranscript)}
                    </Badge>
                    {selectedTranscript.recordingUrl && (
                      <a 
                        href={selectedTranscript.recordingUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                        </svg>
                        Listen
                      </a>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {selectedTranscript.summary && selectedTranscript.summary !== 'No transcript available' && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium mb-2">Summary</h3>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="text-sm text-foreground">{selectedTranscript.summary}</p>
                    </div>
                  </div>
                )}
                {selectedTranscript.keywords && selectedTranscript.keywords.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium mb-2">Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedTranscript.keywords.map((keyword, i) => (
                        <Badge 
                          key={i} 
                          variant="outline" 
                          className="text-xs capitalize"
                        >
                          {keyword.replace('-', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium">Full Transcript</h3>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                      {selectedTranscript.transcript ? 'Transcribed' : 'No transcript available'}
                    </div>
                  </div>
                  
                  {selectedTranscript.transcript ? (
                    <div className="space-y-3">
                      {selectedTranscript.transcript.map((line, i) => (
                        <div 
                          key={i} 
                          className={`p-4 rounded-lg ${
                            line.speaker === 'agent' 
                              ? 'bg-primary/5 border border-primary/10' 
                              : 'bg-muted/30 border border-border/30'
                          }`}
                        >
                          <div className="flex items-center justify-between text-sm mb-1.5">
                            <span className={`font-medium ${
                              line.speaker === 'agent' ? 'text-primary' : 'text-foreground'
                            }`}>
                              {line.speaker === 'agent' ? 'Agent' : 'Customer'}
                            </span>
                            <span className="text-muted-foreground text-xs bg-background/80 px-2 py-0.5 rounded">
                              {line.timestamp}
                            </span>
                          </div>
                          <p className="text-sm text-foreground">{line.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 border border-dashed rounded-lg text-center">
                      <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No transcript is available for this call.
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Transcripts are generated automatically for completed calls.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t border-border/50">
                <div className="flex justify-between w-full">
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    Add Note
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                      <polyline points="16 6 12 2 8 6"></polyline>
                      <line x1="12" y1="2" x2="12" y2="15"></line>
                    </svg>
                    Export
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ) : (
            <Card className="border-border/50 bg-card/50 backdrop-blur h-full flex items-center justify-center">
              <div className="text-center p-8">
                <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Transcript Selected</h3>
                <p className="text-muted-foreground mb-4">
                  Select a call from the list to view its transcript
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
