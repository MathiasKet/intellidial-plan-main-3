import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Calendar, Filter, Download, RefreshCw, PhoneIncoming, PhoneOutgoing, PhoneMissed, Clock } from "lucide-react";

// Mock data for charts
const callData = [
  { name: 'Mon', calls: 12, duration: 45 },
  { name: 'Tue', calls: 19, duration: 68 },
  { name: 'Wed', calls: 15, duration: 52 },
  { name: 'Thu', calls: 24, duration: 91 },
  { name: 'Fri', calls: 18, duration: 62 },
  { name: 'Sat', calls: 8, duration: 28 },
  { name: 'Sun', calls: 5, duration: 18 },
];

const callTypes = [
  { name: 'Inbound', value: 65, color: '#3b82f6' },
  { name: 'Outbound', value: 35, color: '#8b5cf6' },
];

const callStatus = [
  { name: 'Completed', value: 75, color: '#10b981' },
  { name: 'Missed', value: 15, color: '#ef4444' },
  { name: 'Voicemail', value: 10, color: '#f59e0b' },
];

const kpiData = [
  { 
    title: 'Total Calls', 
    value: '1,248', 
    change: '+12.5%', 
    isPositive: true,
    icon: <PhoneIncoming className="w-5 h-5 text-blue-500" />
  },
  { 
    title: 'Total Duration', 
    value: '42h 18m', 
    change: '+8.2%', 
    isPositive: true,
    icon: <Clock className="w-5 h-5 text-purple-500" />
  },
  { 
    title: 'Avg. Call Duration', 
    value: '3m 24s', 
    change: '-2.1%', 
    isPositive: false,
    icon: <Clock className="w-5 h-5 text-green-500" />
  },
  { 
    title: 'Missed Calls', 
    value: '124', 
    change: '-5.3%', 
    isPositive: true,
    icon: <PhoneMissed className="w-5 h-5 text-red-500" />
  },
];

const CallVolumeChart = () => (
  <div className="h-80">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={callData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="name" />
        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
        <Tooltip />
        <Legend />
        <Bar yAxisId="left" dataKey="calls" name="Number of Calls" fill="#8884d8" radius={[4, 4, 0, 0]} />
        <Bar yAxisId="right" dataKey="duration" name="Total Minutes" fill="#82ca9d" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

const CallTypeChart = () => (
  <div className="h-64">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={callTypes}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {callTypes.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

const CallStatusChart = () => (
  <div className="h-64">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={callStatus}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {callStatus.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('week');
  const [isLoading, setIsLoading] = useState(false);

  const refreshData = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex-1 flex flex-col p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Key metrics and insights from your calls</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            {timeRange === 'week' ? 'This Week' : timeRange === 'month' ? 'This Month' : 'This Year'}
          </Button>
          <Button variant="outline" size="sm" onClick={refreshData} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi, index) => (
          <Card key={index} className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                {kpi.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className={`text-xs ${kpi.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {kpi.change} from last period
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <Tabs defaultValue="volume" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="volume">Call Volume</TabsTrigger>
            <TabsTrigger value="types">Call Types</TabsTrigger>
            <TabsTrigger value="status">Call Status</TabsTrigger>
          </TabsList>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
        
        <TabsContent value="volume" className="space-y-4">
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle>Call Volume & Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <CallVolumeChart />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="types" className="space-y-4">
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle>Call Types Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <CallTypeChart />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="status" className="space-y-4">
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle>Call Status Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <CallStatusChart />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Activity */}
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle>Recent Call Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-full bg-blue-100">
                    <PhoneIncoming className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Incoming call from John Doe</p>
                    <p className="text-sm text-muted-foreground">+1 (555) 123-4567 • 5 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Completed</span>
                  <span className="text-sm text-muted-foreground">3:42</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="border-t border-border/50">
          <Button variant="ghost" className="w-full">
            View All Activity
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
