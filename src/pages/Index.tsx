import { Sidebar } from "@/components/layout/Sidebar";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { CallCalendar } from "@/components/calendar/CallCalendar";
import { RecentCalls } from "@/components/dashboard/RecentCalls";
import { LiveTranscript } from "@/components/dashboard/LiveTranscript";

const Index = () => {
  return (
    <div className="flex h-screen bg-gradient-background">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gradient-card backdrop-blur-glass border-b border-border/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">AI Caller Dashboard</h1>
              <p className="text-muted-foreground">Monitor calls, manage schedule, and track performance</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-sm">
                🤖 AI Agent Online
              </div>
            </div>
          </div>
        </header>

        {/* Main Dashboard */}
        <main className="flex-1 overflow-auto p-6 space-y-6">
          {/* Stats Overview */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4">Today's Performance</h2>
            <StatsCards />
          </section>

          {/* Calendar Section */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4">Call Scheduling</h2>
            <CallCalendar />
          </section>

          {/* Recent Activity */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Recent Calls</h2>
              <RecentCalls />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Live Call Monitor</h2>
              <LiveTranscript />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Index;
