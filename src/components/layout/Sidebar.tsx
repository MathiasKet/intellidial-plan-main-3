import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  LayoutDashboard, 
  Phone, 
  Calendar, 
  Users, 
  BarChart3, 
  Settings, 
  PhoneCall,
  MessageSquare,
  Database,
  Menu,
  X
} from "lucide-react";

const sidebarItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
    active: true
  },
  {
    title: "Active Calls",
    icon: PhoneCall,
    href: "/calls",
    badge: "3"
  },
  {
    title: "Calendar",
    icon: Calendar,
    href: "/calendar"
  },
  {
    title: "Call History",
    icon: Phone,
    href: "/history"
  },
  {
    title: "Transcripts",
    icon: MessageSquare,
    href: "/transcripts"
  },
  {
    title: "CRM Contacts",
    icon: Users,
    href: "/contacts"
  },
  {
    title: "Analytics",
    icon: BarChart3,
    href: "/analytics"
  },
  {
    title: "Data Sync",
    icon: Database,
    href: "/sync"
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/settings"
  }
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={cn(
      "relative flex flex-col h-full bg-gradient-card backdrop-blur-glass border-r border-border/50 transition-all duration-300",
      collapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Phone className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">AI Caller</span>
              <span className="text-xs text-muted-foreground">CRM Suite</span>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="hover:bg-accent/50"
        >
          {collapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {sidebarItems.map((item) => (
            <Button
              key={item.href}
              variant={item.active ? "default" : "ghost"}
              className={cn(
                "w-full justify-start h-10 transition-all duration-200",
                collapsed ? "px-2" : "px-3",
                item.active 
                  ? "bg-gradient-primary text-primary-foreground shadow-elegant" 
                  : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-4 h-4", collapsed ? "" : "mr-3")} />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{item.title}</span>
                  {item.badge && (
                    <span className="ml-auto bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Button>
          ))}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border/50">
        <div className={cn(
          "flex items-center space-x-3 p-3 rounded-lg bg-gradient-hero border border-border/50",
          collapsed && "justify-center"
        )}>
          <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
            <span className="text-xs font-semibold text-primary-foreground">AI</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">AI Agent Status</span>
              <span className="text-xs text-green-400">● Online & Ready</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}