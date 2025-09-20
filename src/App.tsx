import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import ActiveCall from "@/pages/ActiveCall";
import NotFound from "@/pages/NotFound";
import CallHistory from "@/pages/CallHistory";
import Transcripts from "@/pages/Transcripts";
import Contacts from "@/pages/Contacts";
import Analytics from "@/pages/Analytics";
import DataSync from "@/pages/DataSync";
import Settings from "@/pages/Settings";
import Calendar from "@/pages/Calendar";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/active-calls" element={<ActiveCall />} />
          <Route path="/call/:callId" element={<ActiveCall />} />
          <Route path="/call-history" element={<CallHistory />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/transcripts" element={<Transcripts />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/data-sync" element={<DataSync />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
