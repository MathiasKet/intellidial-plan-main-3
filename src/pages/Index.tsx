import { useState, useEffect, useCallback } from "react";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { CallCalendar } from "@/components/calendar/CallCalendar";
import { RecentCalls } from "@/components/dashboard/RecentCalls";
import { LiveTranscript } from "@/components/dashboard/LiveTranscript";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardData } from "@/contexts/DashboardDataContext";
import { Button } from "@/components/ui/button";
import { LoadingWrapper } from "@/components/LoadingWrapper";
import { Lock, RefreshCw, Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Calendar, BarChart2, MessageSquare, X, Search } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CallData } from "@/types";

// Extend CallData to include UI-specific fields
interface UICallData extends Omit<CallData, 'status'> {
  name: string;
  duration: number;
  status: 'completed' | 'missed' | 'in-progress' | 'scheduled';
  type: 'inbound' | 'outbound';
}

interface UICallStats {
  totalCalls: number;
  completedCalls: number;
  missedCalls: number;
  averageDuration: number;
  totalDuration: number;
  avgDuration: string;
  satisfaction: number;
}

export { Index as default };
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const Index = () => {
  // State for search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [filteredCalls, setFilteredCalls] = useState<UICallData[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  
  // State for quick action dialogs
  const [isNewCallDialogOpen, setIsNewCallDialogOpen] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  
  // Generate sample stats for demo purposes
  const generateSampleStats = (): UICallStats => ({
    totalCalls: 42,
    completedCalls: 35,
    missedCalls: 7,
    averageDuration: 180,
    totalDuration: 7560,
    avgDuration: '3:00',
    satisfaction: 4.2
  });

  // Get data from context
  const context = useDashboardData();
  const { 
    stats: apiStats, 
    calls: recentCalls = [], 
    isLoading, 
    error, 
    refresh,
    searchCalls: searchCallsApi
  } = context;
  
  // Handle upcomingCalls separately since it might not exist in the context
  const upcomingCalls = 'upcomingCalls' in context ? (context as any).upcomingCalls : [];
  
  const { hasRole } = useAuth();
  
  // Format stats from API
  const formatApiStats = useCallback((stats: any): UICallStats | null => {
    if (!stats) return null;
    
    return {
      totalCalls: stats.totalCalls || 0,
      completedCalls: stats.completedCalls || 0,
      missedCalls: stats.missedCalls || 0,
      averageDuration: stats.averageDuration || 0,
      totalDuration: stats.totalDuration || 0,
      avgDuration: stats.avgDuration || '0:00',
      satisfaction: stats.satisfaction || 0
    };
  }, []);
  
  // Format duration in seconds to MM:SS format
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Process and filter calls
  const processCalls = useCallback((callsData: CallData[] = []): UICallData[] => {
    return callsData.map(call => {
      const callType = call.from === 'Current User' ? 'outbound' as const : 'inbound' as const;
      // Create a new object with all required properties
      const processedCall: UICallData = {
        ...call,
        type: callType,
        status: call.status as UICallData['status'],
        duration: call.duration || 0,
        name: 'name' in call ? String(call.name) : call.from || 'Unknown',
        id: call.id,
        from: call.from,
        to: call.to || '',
        timestamp: call.timestamp || new Date().toISOString(),
        recordingUrl: 'recordingUrl' in call ? call.recordingUrl : undefined,
        transcript: 'transcript' in call ? call.transcript : undefined,
        sentiment: 'sentiment' in call ? Number(call.sentiment) : undefined
      };
      return processedCall;
    });
  }, []);
  
  // Handle search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await searchCallsApi(searchQuery);
      setFilteredCalls(processCalls(results));
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Reset search
  const resetSearch = () => {
    setSearchQuery('');
    setFilteredCalls([]);
  };
  
  // Use sample data if API data is not available
  const stats: UICallStats = isLoading || error ? generateSampleStats() : formatApiStats(apiStats) || generateSampleStats();
  
  // Get calls to display (filtered or all)
  const displayCalls = filteredCalls.length > 0 ? filteredCalls : processCalls(recentCalls);
  
  // Handle call actions
  const handleCallStart = (callId: string) => {
    console.log('Starting call:', callId);
    // Here you would typically integrate with your calling API
    toast({
      title: 'Call started',
      description: `Initiating call with ID: ${callId}`,
    });
  };
  
  const handleCallEnd = (callId: string, duration: number) => {
    console.log('Ending call:', callId, 'Duration:', duration);
    // Here you would typically end the call via your API
    toast({
      title: 'Call ended',
      description: `Call duration: ${formatDuration(duration)}`,
    });
  };
  
  // Quick action handlers
  const handleNewCall = () => {
    // In a real app, this would open a dialer or contact picker
    toast({
      title: 'New Call',
      description: 'Opening dialer...',
    });
    // For demo, we'll simulate starting a new call
    const newCallId = `call_${Date.now()}`;
    handleCallStart(newCallId);
    
    // In a real app, you would integrate with your calling API here
    // e.g., startCall(newCallId);
  };
  
  const handleSendMessage = () => {
    // In a real app, this would open a message composer
    toast({
      title: 'New Message',
      description: 'Opening message composer...',
    });
    setIsMessageDialogOpen(true);
  };
  
  const handleScheduleCall = () => {
    // In a real app, this would open a scheduling dialog
    toast({
      title: 'Schedule Call',
      description: 'Opening calendar...',
    });
    setIsScheduleDialogOpen(true);
  };

  // Stats for the stats cards
  const statsData = [
    {
      title: "Total Calls",
      value: stats?.totalCalls || 0,
      description: "+20.1% from last month",
      icon: <Phone className="h-4 w-4" />,
    },
    {
      title: "Avg. Call Duration",
      value: stats?.avgDuration || '0:00',
      description: "+2.3% from last month",
      icon: <BarChart2 className="h-4 w-4" />,
    },
    {
      title: "Call Completion",
      value: stats ? `${Math.round((stats.completedCalls / stats.totalCalls) * 100)}%` : '0%',
      description: "+5% from last month",
      icon: <BarChart2 className="h-4 w-4" />,
    },
    {
      title: "Satisfaction",
      value: stats?.satisfaction ? `${stats.satisfaction.toFixed(1)}/5` : 'N/A',
      description: "+0.3 from last month",
      icon: <BarChart2 className="h-4 w-4" />,
    },
  ];
  
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-red-100 p-4 rounded-full mb-4">
          <X className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Error Loading Data</h2>
        <p className="text-muted-foreground mb-6">{errorMessage}</p>
        <Button onClick={refresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  const renderDashboard = () => (
    <div className="h-full bg-muted/20">
      <div className="flex flex-col h-full">
        <header className="bg-card backdrop-blur-glass border-b border-border/50 px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={refresh} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </header>
        
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search calls..."
            className="w-full pl-10 bg-background/50 backdrop-blur-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(e as any)}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
              onClick={resetSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <main className="flex-1 overflow-auto p-6">
          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            {statsData.map((stat, i) => (
              <Card key={i} className="glass-panel hover:bg-card/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className="h-4 w-4 text-muted-foreground">
                    {stat.icon}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            {/* Recent Activity */}
            <div className="lg:col-span-5 space-y-6">
              <Card className="glass-panel">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Recent Activity</CardTitle>
                      <CardDescription>Your most recent calls and interactions</CardDescription>
                    </div>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="calls">Calls</TabsTrigger>
                        <TabsTrigger value="transcripts">Transcripts</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {displayCalls.map((call) => (
                      <div key={call.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${
                            call.status === 'completed' ? 'bg-green-100 text-green-600' : 
                            call.status === 'missed' ? 'bg-red-100 text-red-600' : 
                            'bg-blue-100 text-blue-600'
                          }`}>
                            {call.status === 'completed' ? (
                              <Phone className="h-4 w-4" />
                            ) : call.status === 'missed' ? (
                              <PhoneMissed className="h-4 w-4" />
                            ) : call.status === 'in-progress' ? (
                              <PhoneIncoming className="h-4 w-4 animate-pulse" />
                            ) : (
                              <PhoneOutgoing className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{call.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(call.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {call.status === 'completed' ? formatDuration(call.duration) : call.status}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {call.type === 'inbound' ? 'Incoming' : 'Outgoing'}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {upcomingCalls.length > 0 && (
                      <div className="mt-8">
                        <h3 className="text-lg font-semibold mb-4">Upcoming Calls</h3>
                        <div className="space-y-4">
                          {upcomingCalls.map((call: any) => (
                            <div key={call.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                                  <Calendar className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="font-medium">{call.title || 'Scheduled Call'}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(call.scheduledTime).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              <Button variant="outline" size="sm">
                                Join Call
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Actions */}
              <Card className="glass-panel">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={handleNewCall}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    New Call
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={handleSendMessage}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={handleScheduleCall}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Call
                  </Button>
                </CardContent>
              </Card>
              
              {/* Performance Metrics */}
              <Card className="glass-panel">
                <CardHeader>
                  <CardTitle>Performance</CardTitle>
                  <CardDescription>Your call metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Call Completion</span>
                      <span className="font-medium">
                        {stats ? Math.round((stats.completedCalls / stats.totalCalls) * 100) : 0}%
                      </span>
                    </div>
                    <Progress 
                      value={stats ? (stats.completedCalls / stats.totalCalls) * 100 : 0} 
                      className="h-2" 
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Avg. Duration</span>
                      <span className="font-medium">{stats?.avgDuration || '0:00'}</span>
                    </div>
                    <Progress 
                      value={stats ? (parseInt(stats.avgDuration) / 10) * 100 : 0} 
                      className="h-2" 
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Satisfaction</span>
                      <span className="font-medium">
                        {stats?.satisfaction ? `${stats.satisfaction.toFixed(1)}/5` : 'N/A'}
                      </span>
                    </div>
                    <Progress 
                      value={stats ? (stats.satisfaction / 5) * 100 : 0} 
                      className="h-2" 
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
  
  // Message Dialog Component
  const MessageDialog = () => (
    <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
          <DialogDescription>
            Send a message to a contact. Click send when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="recipient" className="text-right">
              To
            </Label>
            <Input
              id="recipient"
              placeholder="Enter phone number or email"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="message" className="text-right">
              Message
            </Label>
            <Textarea
              id="message"
              placeholder="Type your message here"
              className="col-span-3"
              rows={4}
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setIsMessageDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => {
              toast({
                title: 'Message sent',
                description: 'Your message has been sent successfully.',
              });
              setIsMessageDialogOpen(false);
            }}
          >
            Send Message
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
  
  // Schedule Call Dialog Component
  const ScheduleCallDialog = () => (
    <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Schedule a Call</DialogTitle>
          <DialogDescription>
            Schedule a call for a later time.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="contact" className="text-right">
              Contact
            </Label>
            <Input
              id="contact"
              placeholder="Enter contact name or number"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="datetime" className="text-right">
              Date & Time
            </Label>
            <Input
              id="datetime"
              type="datetime-local"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">
              Notes
            </Label>
            <Input
              id="notes"
              placeholder="Add any notes about the call"
              className="col-span-3"
              multiline
              rows={3}
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => {
              toast({
                title: 'Call scheduled',
                description: 'Your call has been scheduled successfully.',
              });
              setIsScheduleDialogOpen(false);
            }}
          >
            Schedule Call
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
  
  return (
    <>
      {renderDashboard()}
      <MessageDialog />
      <ScheduleCallDialog />
    </>
  );
};
