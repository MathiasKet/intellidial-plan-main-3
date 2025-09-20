import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RefreshCw, CheckCircle2, AlertCircle, Clock, Cloud, Database, Download, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SyncStatus {
  status: 'idle' | 'syncing' | 'success' | 'error';
  lastSync: Date | null;
  progress: number;
  message: string;
}

export default function DataSync() {
  const [autoSync, setAutoSync] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    status: 'idle',
    lastSync: new Date('2023-09-20T10:30:00'),
    progress: 0,
    message: 'Ready to sync'
  });

  const syncHistory = [
    { id: 1, type: 'full', status: 'success', timestamp: new Date('2023-09-20T10:30:00'), items: 1245 },
    { id: 2, type: 'incremental', status: 'success', timestamp: new Date('2023-09-20T09:15:00'), items: 42 },
    { id: 3, type: 'incremental', status: 'error', timestamp: new Date('2023-09-20T08:00:00'), items: 0, error: 'Connection timeout' },
  ];

  const handleSync = () => {
    setSyncStatus({
      status: 'syncing',
      lastSync: null,
      progress: 0,
      message: 'Starting sync...'
    });

    // Simulate sync progress
    const interval = setInterval(() => {
      setSyncStatus(prev => {
        const newProgress = Math.min(prev.progress + Math.random() * 15, 95);
        const isComplete = newProgress >= 95;
        
        if (isComplete) {
          clearInterval(interval);
          setTimeout(() => {
            setSyncStatus({
              status: 'success',
              lastSync: new Date(),
              progress: 100,
              message: 'Sync completed successfully'
            });
          }, 500);
        }
        
        return {
          ...prev,
          progress: newProgress,
          message: `Syncing data... ${Math.round(newProgress)}%`
        };
      });
    }, 500);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'syncing':
        return <Badge variant="secondary">Syncing</Badge>;
      default:
        return <Badge variant="outline">Idle</Badge>;
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Data Sync</h1>
          <p className="text-sm text-muted-foreground">Manage data synchronization with external services</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch id="auto-sync" checked={autoSync} onCheckedChange={setAutoSync} />
            <Label htmlFor="auto-sync">Auto-sync</Label>
          </div>
          <Button onClick={handleSync} disabled={syncStatus.status === 'syncing'}>
            {syncStatus.status === 'syncing' ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Sync Now
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Sync Status Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Cloud className="mr-2 h-5 w-5 text-blue-500" />
                Sync Status
              </CardTitle>
              {syncStatus.status === 'syncing' ? (
                <Badge variant="secondary" className="animate-pulse">
                  Syncing...
                </Badge>
              ) : syncStatus.lastSync ? (
                <div className="text-sm text-muted-foreground">
                  Last sync: {syncStatus.lastSync.toLocaleString()}
                </div>
              ) : null}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {syncStatus.status === 'syncing' ? 'Sync in progress' : 
                     syncStatus.status === 'success' ? 'Last sync completed' :
                     'Ready to sync'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {syncStatus.message}
                  </p>
                </div>
                {syncStatus.status === 'success' && (
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                )}
                {syncStatus.status === 'error' && (
                  <AlertCircle className="h-6 w-6 text-red-500" />
                )}
              </div>
              
              {syncStatus.status === 'syncing' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round(syncStatus.progress)}%</span>
                  </div>
                  <Progress value={syncStatus.progress} className="h-2" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sync History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="mr-2 h-5 w-5 text-blue-500" />
              Sync History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {syncHistory.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    {item.status === 'success' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium">
                        {item.type === 'full' ? 'Full Sync' : 'Incremental Sync'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(item.status)}
                    {item.status === 'success' && (
                      <p className="text-sm text-muted-foreground">
                        {item.items} items synced
                      </p>
                    )}
                    {item.status === 'error' && item.error && (
                      <p className="text-sm text-red-500">
                        {item.error}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sync Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2 h-5 w-5 text-blue-500"
              >
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Sync Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Sync Frequency</h4>
                  <p className="text-sm text-muted-foreground">
                    How often to automatically sync data
                  </p>
                </div>
                <select className="h-9 w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="15">Every 15 minutes</option>
                  <option value="30">Every 30 minutes</option>
                  <option value="60">Every hour</option>
                  <option value="360">Every 6 hours</option>
                  <option value="720">Every 12 hours</option>
                  <option value="1440">Every 24 hours</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Sync Options</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sync-contacts" className="font-normal">Sync Contacts</Label>
                    <Switch id="sync-contacts" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sync-call-history" className="font-normal">Sync Call History</Label>
                    <Switch id="sync-call-history" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sync-recordings" className="font-normal">Sync Call Recordings</Label>
                    <Switch id="sync-recordings" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sync-transcripts" className="font-normal">Sync Transcripts</Label>
                    <Switch id="sync-transcripts" defaultChecked />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-2">
                <Button variant="outline" className="mr-2">
                  Reset to Defaults
                </Button>
                <Button>Save Changes</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
