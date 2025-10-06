import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { PostComposer } from './PostComposer';
import { PostsManager } from './PostsManager';
import { SettingsModal } from './SettingsModal';
import { ProfileModal } from './ProfileModal';
import { SystemStatusModal } from './SystemStatusModal';
import { 
  fetchUserPosts, 
  User as AppwriteUser,
  Post as AppwritePost,
  isAppwriteConfigured
} from './AppwriteService';
import { SystemStatus } from './SystemIntegration';
import { toast } from 'sonner@2.0.3';
import { 
  Instagram, 
  Plus, 
  Calendar, 
  BarChart3, 
  Settings, 
  User,
  LogOut,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';

interface DashboardProps {
  onLogout: () => void;
  currentUser: AppwriteUser;
  systemStatus?: SystemStatus | null;
}

export function Dashboard({ onLogout, currentUser, systemStatus }: DashboardProps) {
  const [posts, setPosts] = useState<AppwritePost[]>([]);
  const [activeTab, setActiveTab] = useState('compose');
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSystemStatus, setShowSystemStatus] = useState(false);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);

  // Load user posts on component mount
  useEffect(() => {
    const loadPosts = async () => {
      try {
        setIsLoadingPosts(true);
        const userPosts = await fetchUserPosts(currentUser.$id);
        setPosts(userPosts);
      } catch (error) {
        console.error('Error loading posts:', error);
        toast.error('Failed to load posts');
      } finally {
        setIsLoadingPosts(false);
      }
    };

    loadPosts();
  }, [currentUser.$id]);

  const handleSchedulePost = (newPost: AppwritePost) => {
    setPosts([newPost, ...posts]);
    setActiveTab('posts');
    toast.success('Post scheduled successfully!');
  };

  const handleDeletePost = (id: string) => {
    setPosts(posts.filter(post => post.$id !== id));
  };

  const handleUpdatePost = (updatedPost: AppwritePost) => {
    setPosts(posts.map(post => post.$id === updatedPost.$id ? updatedPost : post));
  };

  const stats = {
    totalPosts: posts.length,
    scheduledPosts: posts.filter(p => p.status === 'scheduled').length,
    publishedPosts: posts.filter(p => p.status === 'published').length,
    totalEngagement: posts.reduce((acc, post) => 
      acc + (post.engagement ? post.engagement.likes + post.engagement.comments + post.engagement.shares : 0), 0
    )
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
              <Instagram className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-xl font-semibold">InstaScheduler</h1>
          </div>
          
          <div className="flex items-center gap-2">
            
            <Button variant="ghost" size="sm" onClick={() => setShowSettings(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowProfile(true)}>
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Development Mode Notice */}
        {!isAppwriteConfigured() && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-sm text-blue-700">
                <strong>Development Mode:</strong> Using local storage. See APPWRITE_SETUP.md to connect to backend.
              </p>
            </div>
          </div>
        )}



        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total Posts</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPosts}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Scheduled</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.scheduledPosts}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Published</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.publishedPosts}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total Engagement</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEngagement}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="compose" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Compose
            </TabsTrigger>
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="compose" className="mt-6">
            <div className="max-w-2xl mx-auto">
              <PostComposer 
                onSchedulePost={handleSchedulePost} 
                currentUser={currentUser}
              />
            </div>
          </TabsContent>

          <TabsContent value="posts" className="mt-6">
            {isLoadingPosts ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2 text-muted-foreground">Loading posts...</span>
              </div>
            ) : (
              <PostsManager 
                posts={posts}
                onDeletePost={handleDeletePost}
                onUpdatePost={handleUpdatePost}
              />
            )}
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Engagement Overview</CardTitle>
                  <CardDescription>Your posts performance this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Analytics dashboard coming soon!</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Track your post performance, engagement rates, and audience insights.
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Best Times to Post</CardTitle>
                  <CardDescription>Optimal posting schedule based on your audience</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Smart scheduling coming soon!</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Get AI-powered recommendations for when to post.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)}
        onShowSystemStatus={() => {
          setShowSettings(false);
          setShowSystemStatus(true);
        }}
      />
      
      <ProfileModal 
        isOpen={showProfile} 
        onClose={() => setShowProfile(false)} 
      />
      
      <SystemStatusModal 
        isOpen={showSystemStatus}
        onClose={() => setShowSystemStatus(false)}
        systemStatus={systemStatus}
      />
    </div>
  );
}