import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  connectInstagram, 
  disconnectInstagram, 
  getInstagramConnection,
  checkInstagramConfiguration,
  refreshInstagramToken 
} from './InstagramApiService';
import { toast } from 'sonner@2.0.3';
import { 
  Settings, 
  Bell, 
  Shield, 
  Clock, 
  Save,
  Instagram,
  Smartphone,
  Globe,
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowSystemStatus?: () => void;
}

export function SettingsModal({ isOpen, onClose, onShowSystemStatus }: SettingsModalProps) {
  const [settings, setSettings] = useState({
    // General Settings
    timezone: 'UTC-5',
    language: 'en',
    autoSave: true,
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: false,
    postReminders: true,
    weeklyReports: true,
    
    // Privacy Settings
    publicProfile: false,
    analyticsSharing: true,
    
    // Instagram Settings
    instagramConnected: false,
    autoHashtags: false,
    optimalTiming: true
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [instagramUser, setInstagramUser] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Check Instagram connection status on component mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const connection = await getInstagramConnection();
        if (connection?.isConnected) {
          setSettings(prev => ({ ...prev, instagramConnected: true }));
          setInstagramUser(connection.user?.username || null);
        }
      } catch (error) {
        // Silently handle errors - this is expected when no user is logged in
        console.log('Instagram connection check skipped - no authenticated user');
      }
    };
    
    // Only check connection if modal is open (component is rendered)
    if (isOpen) {
      checkConnection();
    }
  }, [isOpen]);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    // Mock save delay
    setTimeout(() => {
      setIsLoading(false);
      onClose();
      // Show success message in real app
    }, 1000);
  };

  const handleInstagramConnect = async () => {
    setIsConnecting(true);
    
    try {
      // Check configuration first
      const config = checkInstagramConfiguration();
      if (!config.isConfigured) {
        toast.info('Instagram is running in demo mode', {
          description: 'Check INSTAGRAM_SETUP.md to enable real Instagram integration'
        });
        return;
      }
      
      toast.info('Opening Instagram authorization...');
      
      const result = await connectInstagram();
      
      if (result.success) {
        // Refresh connection status
        const connection = await getInstagramConnection();
        if (connection?.isConnected) {
          setSettings(prev => ({ ...prev, instagramConnected: true }));
          setInstagramUser(connection.user?.username || null);
          toast.success(`Successfully connected to Instagram as @${connection.user?.username}!`);
        }
      } else {
        toast.error(result.error || 'Failed to connect Instagram account');
      }
    } catch (error) {
      console.error('Instagram connection error:', error);
      toast.error('An error occurred while connecting to Instagram.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleInstagramDisconnect = async () => {
    setIsConnecting(true);
    
    try {
      const result = await disconnectInstagram();
      
      if (result.success) {
        setSettings(prev => ({ ...prev, instagramConnected: false }));
        setInstagramUser(null);
        toast.success('Instagram account disconnected successfully');
      } else {
        toast.error(result.error || 'Failed to disconnect Instagram account');
      }
    } catch (error) {
      console.error('Instagram disconnection error:', error);
      toast.error('An error occurred while disconnecting Instagram');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleRefreshToken = async () => {
    setIsRefreshing(true);
    
    try {
      const result = await refreshInstagramToken();
      
      if (result.success) {
        toast.success('Instagram token refreshed successfully');
      } else {
        toast.error(result.error || 'Failed to refresh Instagram token');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      toast.error('An error occurred while refreshing token');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </DialogTitle>
          <DialogDescription>
            Manage your account settings, notifications, and preferences.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="general" className="overflow-y-auto max-h-[calc(90vh-150px)]">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Regional Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={settings.timezone} onValueChange={(value) => handleSettingChange('timezone', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC-12">UTC-12 (Baker Island)</SelectItem>
                        <SelectItem value="UTC-8">UTC-8 (Pacific Time)</SelectItem>
                        <SelectItem value="UTC-5">UTC-5 (Eastern Time)</SelectItem>
                        <SelectItem value="UTC-0">UTC+0 (London)</SelectItem>
                        <SelectItem value="UTC+1">UTC+1 (Paris)</SelectItem>
                        <SelectItem value="UTC+9">UTC+9 (Tokyo)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select value={settings.language} onValueChange={(value) => handleSettingChange('language', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                        <SelectItem value="it">Italiano</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Application Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Auto-save drafts</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically save your posts as you write
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoSave}
                    onCheckedChange={(checked) => handleSettingChange('autoSave', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive emails about your posts and account activity
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified on your device about post activity
                    </p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Post Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Remind me 15 minutes before scheduled posts
                    </p>
                  </div>
                  <Switch
                    checked={settings.postReminders}
                    onCheckedChange={(checked) => handleSettingChange('postReminders', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Weekly Reports</Label>
                    <p className="text-sm text-muted-foreground">
                      Get weekly analytics and performance summaries
                    </p>
                  </div>
                  <Switch
                    checked={settings.weeklyReports}
                    onCheckedChange={(checked) => handleSettingChange('weeklyReports', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Privacy & Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Public Profile</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow others to discover your scheduling insights
                    </p>
                  </div>
                  <Switch
                    checked={settings.publicProfile}
                    onCheckedChange={(checked) => handleSettingChange('publicProfile', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Analytics Sharing</Label>
                    <p className="text-sm text-muted-foreground">
                      Help improve our service by sharing anonymous usage data
                    </p>
                  </div>
                  <Switch
                    checked={settings.analyticsSharing}
                    onCheckedChange={(checked) => handleSettingChange('analyticsSharing', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Instagram className="h-4 w-4" />
                  Instagram Integration
                  {!checkInstagramConfiguration().isConfigured && (
                    <Badge variant="secondary" className="text-xs">
                      Demo Mode
                    </Badge>
                  )}
                </CardTitle>
                {!checkInstagramConfiguration().isConfigured && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Currently running in demo mode. See INSTAGRAM_SETUP.md to enable real Instagram posting.
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      <Instagram className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        Instagram Account
                        {settings.instagramConnected ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {settings.instagramConnected 
                          ? `Connected${instagramUser ? ` as @${instagramUser}` : ''} and ready to post`
                          : 'Connect to start posting'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {settings.instagramConnected ? (
                      <>
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={handleRefreshToken}
                          disabled={isConnecting || isLoading || isRefreshing}
                        >
                          {isRefreshing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Refresh'
                          )}
                        </Button>
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={handleInstagramConnect}
                          disabled={isConnecting || isLoading || isRefreshing}
                        >
                          {isConnecting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Reconnect'
                          )}
                        </Button>
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={handleInstagramDisconnect}
                          disabled={isConnecting || isLoading || isRefreshing}
                          className="text-destructive hover:text-destructive"
                        >
                          Disconnect
                        </Button>
                      </>
                    ) : (
                      <Button 
                        onClick={handleInstagramConnect}
                        disabled={isConnecting || isLoading}
                      >
                        {isConnecting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          'Connect Instagram'
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Auto-suggest Hashtags</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically suggest relevant hashtags for your posts
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoHashtags}
                    onCheckedChange={(checked) => handleSettingChange('autoHashtags', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Optimal Timing</Label>
                    <p className="text-sm text-muted-foreground">
                      Use AI to suggest the best times to post
                    </p>
                  </div>
                  <Switch
                    checked={settings.optimalTiming}
                    onCheckedChange={(checked) => handleSettingChange('optimalTiming', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}