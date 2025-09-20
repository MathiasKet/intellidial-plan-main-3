import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocation, useNavigate } from "react-router-dom";
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
  X,
  Lock,
  LogIn,
  LogOut,
  User,
  UserCircle2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type SubscriptionTier = 'demo' | 'basic' | 'pro' | 'enterprise';

interface SidebarItem {
  title: string;
  icon: any;
  href: string;
  requiredSubscription?: SubscriptionTier;
  badge?: string;
}

const sidebarItems: SidebarItem[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
    requiredSubscription: "demo"
  },
  {
    title: "Active Calls",
    icon: PhoneCall,
    href: "/active-calls",
    requiredSubscription: "basic",
    badge: "3"
  },
  {
    title: "Calendar",
    icon: Calendar,
    href: "/calendar",
    requiredSubscription: "demo"
  },
  {
    title: "Call History",
    icon: Phone,
    href: "/call-history",
    requiredSubscription: "demo"
  },
  {
    title: "Transcripts",
    icon: MessageSquare,
    href: "/transcripts",
    requiredSubscription: "demo"
  },
  {
    title: "CRM Contacts",
    icon: Users,
    href: "/contacts",
    requiredSubscription: "basic"
  },
  {
    title: "Analytics",
    icon: BarChart3,
    href: "/analytics",
    requiredSubscription: "pro"
  },
  {
    title: "Data Sync",
    icon: Database,
    href: "/data-sync",
    requiredSubscription: "pro"
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/settings",
    requiredSubscription: "demo"
  }
];

interface SidebarProps {
  className?: string;
}

// Helper function to get user initials
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();
  
  // Sample user data - in a real app, this would come from your auth context
  const currentUser = user || { name: 'Guest User', email: 'guest@example.com', image: null };
  const [activePath, setActivePath] = useState(location.pathname);
  const { hasAccess } = useAuth();

  useEffect(() => {
    setActivePath(location.pathname);
  }, [location]);

  const handleNavigation = (item: SidebarItem) => {
    if (item.requiredSubscription && !hasAccess(item.requiredSubscription)) {
      return; // Don't navigate if user doesn't have access
    }
    navigate(item.href);
  };

  return (
    <div className={cn(
      "relative flex flex-col h-full glass-sidebar transition-all duration-300",
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
          {sidebarItems.map((item) => {
            const isActive = activePath === item.href || 
                           (item.href !== '/' && activePath.startsWith(item.href));
            const hasAccessToItem = item.requiredSubscription ? 
              hasAccess(item.requiredSubscription) : true;
            
            return (
              <div key={item.href} className="relative group">
                <Button
                  key={item.href}
                  variant={isActive ? "secondary" : "ghost"}
                  onClick={() => handleNavigation(item)}
                  className={cn(
                    "w-full justify-start text-sm font-medium transition-all duration-300 group relative overflow-hidden",
                    !collapsed ? "px-3 py-2" : "p-2",
                    isActive 
                      ? "bg-primary/10 text-primary hover:bg-primary/20" 
                      : "hover:bg-accent/50",
                    !hasAccessToItem && "opacity-50 cursor-not-allowed"
                  )}
                  disabled={!hasAccessToItem}
                >
                  <item.icon className={cn("w-4 h-4 flex-shrink-0", collapsed ? "" : "mr-3")} />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.title}</span>
                      {!hasAccessToItem ? (
                        <Lock className="w-3.5 h-3.5 ml-2 text-muted-foreground" />
                      ) : item.badge ? (
                        <span className="ml-auto bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      ) : null}
                    </>
                  )}
                </Button>
                
                {/* Tooltip for locked items */}
                {!hasAccessToItem && !collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                    {item.requiredSubscription} subscription required
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </ScrollArea>

      {/* User Profile / Login Button */}
      <div className="p-4 border-t border-border/50">
        {isAuthenticated ? (
          <div className="space-y-3">
            <Button
              variant="ghost"
              onClick={logout}
              className={cn(
                "w-full justify-start h-auto p-3 hover:bg-accent/50 transition-colors group",
                collapsed && "justify-center"
              )}
            >
              <div className="flex items-center space-x-3">
                {currentUser.image ? (
                  <div className="relative w-8 h-8 rounded-full overflow-hidden">
                    <img 
                      src={currentUser.image} 
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary">
                    <span className="text-xs font-medium">
                      {getInitials(currentUser.name)}
                    </span>
                  </div>
                )}
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col items-start overflow-hidden">
                      <span className="text-sm font-medium text-foreground truncate w-full">
                        {currentUser.name}
                      </span>
                      <span className="text-xs text-muted-foreground truncate w-full">
                        {currentUser.email}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </Button>
            {!collapsed && (
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={logout}
              >
                <LogOut className="w-3.5 h-3.5 mr-2" />
                Sign out
              </Button>
            )}
          </div>
        ) : (
          <Button
            variant="ghost"
            onClick={() => navigate('/login')}
            className={cn(
              "w-full justify-start h-auto p-3 hover:bg-accent/50 transition-colors group",
              collapsed && "justify-center"
            )}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <UserCircle2 className="w-5 h-5" />
              </div>
              {!collapsed && (
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">Sign in</span>
                  <span className="text-xs text-muted-foreground">Access your account</span>
                </div>
              )}
            </div>
          </Button>
        )}
      </div>
    </div>
  );
}