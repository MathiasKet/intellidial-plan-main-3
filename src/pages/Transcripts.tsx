import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Download, RefreshCw, Calendar, Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, User, Clock, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Transcript {
  id: string;
  contact: string;
  phone: string;
  type: 'inbound' | 'outbound';
  status: 'completed' | 'missed' | 'voicemail';
  duration: string;
  date: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  summary: string;
  transcript: Array<{
    speaker: 'agent' | 'customer';
    text: string;
    timestamp: string;
  }>;
  keywords: string[];
}

// Mock data
const mockTranscripts: Transcript[] = [
  {
    id: 'trans-001',
    contact: 'John Smith',
    phone: '+1 (555) 123-4567',
    type: 'inbound',
    status: 'completed',
    duration: '5:42',
    date: '2023-06-15T14:30:00Z',
    sentiment: 'positive',
    summary: 'Customer called to inquire about product pricing and features. Showed strong interest in the premium plan.',
    keywords: ['pricing', 'features', 'premium plan'],
    transcript: [
      { speaker: 'customer', text: 'Hi, I was looking at your website and wanted to learn more about your pricing plans.', timestamp: '00:05' },
      { speaker: 'agent', text: 'Hello! I\'d be happy to help with that. We have three main plans: Basic, Pro, and Premium. What are you looking for in a plan?', timestamp: '00:12' },
      { speaker: 'customer', text: 'I need something that can handle multiple users and has advanced analytics.', timestamp: '00:20' },
      { speaker: 'agent', text: 'In that case, I\'d recommend our Premium plan. It includes up to 10 users and our full analytics suite.', timestamp: '00:28' },
      { speaker: 'customer', text: 'That sounds perfect. Can you send me more details about the analytics features?', timestamp: '00:35' },
      { speaker: 'agent', text: 'Absolutely! I\'ll email you a detailed comparison of all our plans with a focus on the analytics capabilities.', timestamp: '00:42' },
    ]
  },
  {
    id: 'trans-002',
    contact: 'Sarah Johnson',
    phone: '+1 (555) 987-6543',
    type: 'outbound',
    status: 'completed',
    duration: '8:15',
    date: '2023-06-14T11:15:00Z',
    sentiment: 'neutral',
    summary: 'Follow-up call regarding recent support ticket. Customer had questions about API integration.',
    keywords: ['support', 'API', 'integration'],
    transcript: [
      { speaker: 'agent', text: 'Hi Sarah, this is Alex calling from Support. I\'m following up on your recent ticket about API integration.', timestamp: '00:05' },
      { speaker: 'customer', text: 'Oh yes, thanks for calling back. I was having issues with the authentication part of the API.', timestamp: '00:12' },
      { speaker: 'agent', text: 'I see. Could you tell me which authentication method you\'re trying to use?', timestamp: '00:20' },
      { speaker: 'customer', text: 'I was using OAuth 2.0 but kept getting a 401 unauthorized error.', timestamp: '00:28' },
      { speaker: 'agent', text: 'I understand. Let\'s go through the setup together to identify where the issue might be.', timestamp: '00:35' },
    ]
  },
  {
    id: 'trans-003',
    contact: 'Michael Brown',
    phone: '+1 (555) 456-7890',
    type: 'inbound',
    status: 'voicemail',
    duration: '1:22',
    date: '2023-06-13T16:45:00Z',
    sentiment: 'negative',
    summary: 'Customer left a voicemail about a billing discrepancy on their latest invoice.',
    keywords: ['billing', 'invoice', 'discrepancy'],
    transcript: [
      { speaker: 'customer', text: 'Hi, this is Michael Brown calling about my latest invoice. There seems to be a discrepancy in the amount I was charged. I was expecting $99 but was charged $149. Could someone please call me back at 555-456-7890 to resolve this? Thanks.', timestamp: '00:00' }
    ]
  }
];

const sentimentColors = {
  positive: 'bg-green-100 text-green-800',
  neutral: 'bg-blue-100 text-blue-800',
  negative: 'bg-red-100 text-red-800'
};

const typeColors = {
  inbound: 'bg-blue-100 text-blue-800',
  outbound: 'bg-purple-100 text-purple-800'
};

export default function Transcripts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTranscript, setSelectedTranscript] = useState<Transcript | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  const filteredTranscripts = mockTranscripts.filter(transcript => {
    const matchesSearch = searchTerm === '' || 
      transcript.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transcript.phone.includes(searchTerm) ||
      transcript.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transcript.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'inbound' && transcript.type === 'inbound') ||
      (activeTab === 'outbound' && transcript.type === 'outbound') ||
      (activeTab === 'voicemail' && transcript.status === 'voicemail');
    
    return matchesSearch && matchesTab;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCallIcon = (type: string) => {
    return type === 'inbound' 
      ? <PhoneIncoming className="w-4 h-4" /> 
      : <PhoneOutgoing className="w-4 h-4" />;
  };

  return (
    <div className="flex-1 flex flex-col p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold">Call Transcripts</h1>
          <p className="text-muted-foreground">Review and manage your call transcripts</p>
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
            <Tabs 
              defaultValue="all" 
              className="w-full"
              onValueChange={(value) => setActiveTab(value)}
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="inbound">Inbound</TabsTrigger>
                <TabsTrigger value="outbound">Outbound</TabsTrigger>
                <TabsTrigger value="voicemail">Voicemail</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="mt-4 space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
              {filteredTranscripts.length > 0 ? (
                filteredTranscripts.map((transcript) => (
                  <div 
                    key={transcript.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedTranscript?.id === transcript.id 
                        ? 'bg-primary/10 border-primary' 
                        : 'border-border hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedTranscript(transcript)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`p-1 rounded ${typeColors[transcript.type]}`}>
                          {getCallIcon(transcript.type)}
                        </div>
                        <div>
                          <p className="font-medium">{transcript.contact}</p>
                          <p className="text-sm text-muted-foreground">{transcript.phone}</p>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={sentimentColors[transcript.sentiment]}
                      >
                        {transcript.sentiment}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm line-clamp-2">{transcript.summary}</p>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatDate(transcript.date)}</span>
                      <span>{transcript.duration}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No transcripts found
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
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{selectedTranscript.contact}</CardTitle>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="w-4 h-4 mr-1" />
                        {selectedTranscript.phone}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(selectedTranscript.date)}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 mr-1" />
                        {selectedTranscript.duration}
                      </div>
                      <Badge 
                        variant="outline" 
                        className={sentimentColors[selectedTranscript.sentiment]}
                      >
                        {selectedTranscript.sentiment}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button size="sm">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Create Follow-up
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-2">Summary</h3>
                  <p className="text-sm text-muted-foreground">{selectedTranscript.summary}</p>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-2">Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTranscript.keywords.map((keyword, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Full Transcript</h3>
                  <div className="space-y-4">
                    {selectedTranscript.transcript.map((line, i) => (
                      <div 
                        key={i} 
                        className={`p-3 rounded-lg ${
                          line.speaker === 'agent' 
                            ? 'bg-primary/10' 
                            : 'bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="font-medium">
                            {line.speaker === 'agent' ? 'Agent' : 'Customer'}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {line.timestamp}
                          </span>
                        </div>
                        <p className="text-sm">{line.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-border/50">
                <Button variant="ghost" className="w-full">
                  Show More Details
                </Button>
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
