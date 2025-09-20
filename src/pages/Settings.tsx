import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Bell, User, Lock, Mail, Phone, Globe, Palette, Moon, Sun, Clock, MessageSquare, Headphones, Database, BellRing, Monitor } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

interface ThemeOptionProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  previewTheme: 'light' | 'dark';
}

const ThemeOption = ({ icon, label, isActive, onClick, previewTheme }: ThemeOptionProps) => {
  return (
    <div 
      className={cn(
        "border rounded-lg p-4 cursor-pointer transition-colors flex flex-col h-full",
        isActive 
          ? "border-primary ring-2 ring-primary/20" 
          : "hover:border-muted-foreground/30"
      )}
      onClick={onClick}
    >
      <div className="flex items-center space-x-2 mb-2">
        {icon}
        <span>{label}</span>
      </div>
      <div className={cn(
        "flex-1 rounded-md border shadow-sm mt-2 overflow-hidden",
        previewTheme === 'dark' ? 'bg-neutral-900' : 'bg-white'
      )}>
        <div className="grid grid-cols-2 gap-1 p-1.5">
          <div className={cn("h-2 rounded-sm", isActive ? 'bg-primary' : 'bg-blue-500')}></div>
          <div className={cn("h-2 rounded-sm", previewTheme === 'dark' ? 'bg-neutral-700' : 'bg-muted')}></div>
          <div className={cn("h-2 rounded-sm", previewTheme === 'dark' ? 'bg-neutral-700' : 'bg-muted')}></div>
          <div className={cn("h-2 rounded-sm", previewTheme === 'dark' ? 'bg-neutral-700' : 'bg-muted')}></div>
        </div>
      </div>
    </div>
  );
};

export default function Settings() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sound: true,
    marketing: false,
  });

  // Only render the theme-dependent UI after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    
    // Load saved font size from localStorage or use default
    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize) {
      setFontSize(Number(savedFontSize));
      document.documentElement.style.setProperty('--font-size', `${savedFontSize}px`);
    } else {
      document.documentElement.style.setProperty('--font-size', `${fontSize}px`);
    }
  }, []);

  const handleNotificationChange = (key: keyof typeof notifications) => {
    const newNotifications = {
      ...notifications,
      [key]: !notifications[key]
    };
    setNotifications(newNotifications);
    // Here you would typically save to your backend or local storage
    localStorage.setItem('notifications', JSON.stringify(newNotifications));
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
  };

  const handleFontSizeChange = (value: number[]) => {
    const newSize = value[0];
    setFontSize(newSize);
    document.documentElement.style.setProperty('--font-size', `${newSize}px`);
    localStorage.setItem('fontSize', newSize.toString());
  };

  const resetToDefaults = () => {
    setTheme('system');
    setFontSize(16);
    document.documentElement.style.setProperty('--font-size', '16px');
    localStorage.removeItem('fontSize');
    
    // Reset notifications to default
    const defaultNotifications = {
      email: true,
      push: true,
      sound: true,
      marketing: false,
    };
    setNotifications(defaultNotifications);
    localStorage.setItem('notifications', JSON.stringify(defaultNotifications));
  };

  return (
    <div className="flex-1 flex flex-col p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your application preferences and account settings
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Privacy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue="Doe" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="john.doe@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex">
                  <Select defaultValue="+1">
                    <SelectTrigger className="w-[120px] rounded-r-none border-r-0">
                      <SelectValue placeholder="+1" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="+1">+1 (US)</SelectItem>
                      <SelectItem value="+44">+44 (UK)</SelectItem>
                      <SelectItem value="+61">+61 (AU)</SelectItem>
                      <SelectItem value="+81">+81 (JP)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input id="phone" type="tel" className="rounded-l-none" defaultValue="(555) 123-4567" />
                </div>
              </div>
              <div className="pt-2">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Working Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Monday - Friday</Label>
                  <p className="text-sm text-muted-foreground">9:00 AM - 6:00 PM</p>
                </div>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Saturday - Sunday</Label>
                  <p className="text-sm text-muted-foreground">Weekend (Closed)</p>
                </div>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BellRing className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications for important updates
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.email} 
                    onCheckedChange={() => handleNotificationChange('email')} 
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive push notifications on this device
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.push} 
                    onCheckedChange={() => handleNotificationChange('push')} 
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Sound Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Play sound for new notifications
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.sound} 
                    onCheckedChange={() => handleNotificationChange('sound')} 
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive marketing and promotional emails
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.marketing} 
                    onCheckedChange={() => handleNotificationChange('marketing')} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notification Volume</Label>
                <div className="flex items-center gap-4">
                  <Headphones className="h-4 w-4 text-muted-foreground" />
                  <Slider 
                    defaultValue={[70]} 
                    max={100} 
                    step={1} 
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground w-10 text-right">70%</span>
                </div>
              </div>

              <div className="pt-2">
                <Button>Save Preferences</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Theme & Display
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {mounted && (
                <>
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <p className="text-sm text-muted-foreground">
                      {theme === 'system' 
                        ? `Using system theme (${resolvedTheme})` 
                        : `Using ${theme} theme`}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                      <ThemeOption 
                        icon={<Sun className="h-4 w-4" />} 
                        label="Light" 
                        isActive={theme === 'light'}
                        onClick={() => handleThemeChange('light')}
                        previewTheme="light"
                      />
                      
                      <ThemeOption 
                        icon={<Moon className="h-4 w-4" />} 
                        label="Dark" 
                        isActive={theme === 'dark'}
                        onClick={() => handleThemeChange('dark')}
                        previewTheme="dark"
                      />
                      
                      <ThemeOption 
                        icon={<Monitor className="h-4 w-4" />} 
                        label="System" 
                        isActive={theme === 'system'}
                        onClick={() => handleThemeChange('system')}
                        previewTheme={resolvedTheme}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Font Size</Label>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">A</span>
                        <Slider 
                          value={[fontSize]} 
                          min={12} 
                          max={20} 
                          step={1}
                          onValueChange={(value) => handleFontSizeChange(value)}
                          className="flex-1"
                        />
                        <span className="text-sm text-muted-foreground">A</span>
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        {fontSize}px
                      </p>
                    </div>

                    <div className="pt-2 flex justify-between items-center">
                      <Button 
                        variant="outline" 
                        onClick={resetToDefaults}
                      >
                        Reset to Defaults
                      </Button>
                      <div className="text-xs text-muted-foreground">
                        Changes are saved automatically
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Two-Factor Authentication</Label>
                    <Badge variant="outline" className="text-amber-500">Recommended</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Enable 2FA
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Login History</Label>
                  <p className="text-sm text-muted-foreground">
                    Review recent login activity on your account
                  </p>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Globe className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Chrome on macOS</p>
                          <p className="text-xs text-muted-foreground">San Francisco, CA, USA • Just now</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-green-500">Current</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg opacity-70">
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Safari on iPhone</p>
                          <p className="text-xs text-muted-foreground">New York, NY, USA • 2 hours ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <Label>Data & Privacy</Label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium">Download your data</p>
                        <p className="text-xs text-muted-foreground">
                          Get a copy of all your personal data
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Request Data
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium">Delete account</p>
                        <p className="text-xs text-muted-foreground">
                          Permanently delete your account and all data
                        </p>
                      </div>
                      <Button variant="destructive" size="sm">
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
