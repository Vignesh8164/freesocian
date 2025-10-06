import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { PostEditModal } from './PostEditModal';
import { 
  Clock, 
  CheckCircle, 
  Calendar, 
  Edit3, 
  Trash2, 
  MoreHorizontal,
  Eye,
  Send
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface Post {
  id: string;
  content: string;
  image?: string;
  hashtags: string[];
  scheduledFor: Date;
  status: 'scheduled' | 'published' | 'failed';
  platform: string;
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
  };
}

interface PostsManagerProps {
  posts: Post[];
  onDeletePost: (id: string) => void;
  onUpdatePost: (updatedPost: Post) => void;
}

export function PostsManager({ posts, onDeletePost, onUpdatePost }: PostsManagerProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline" className="text-blue-600"><Clock className="h-3 w-3 mr-1" />Scheduled</Badge>;
      case 'published':
        return <Badge variant="outline" className="text-green-600"><CheckCircle className="h-3 w-3 mr-1" />Published</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setShowEditModal(true);
  };

  const handleSaveEditedPost = (updatedPost: Post) => {
    onUpdatePost(updatedPost);
    setShowEditModal(false);
    setEditingPost(null);
  };

  const handleDeletePost = (postId: string) => {
    if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      onDeletePost(postId);
    }
  };

  const handlePostNow = (post: Post) => {
    const updatedPost = {
      ...post,
      status: 'published' as const,
      scheduledFor: new Date()
    };
    onUpdatePost(updatedPost);
  };

  const filteredPosts = posts.filter(post => {
    if (activeTab === 'scheduled') return post.status === 'scheduled';
    if (activeTab === 'published') return post.status === 'published';
    return true;
  });

  const PostCard = ({ post }: { post: Post }) => (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {post.image && (
            <div className="flex-shrink-0">
              <ImageWithFallback
                src={post.image}
                alt="Post image"
                className="w-16 h-16 object-cover rounded-lg"
              />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {getStatusBadge(post.status)}
                <span className="text-sm text-muted-foreground">
                  {formatDate(post.scheduledFor)}
                </span>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEditPost(post)}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Post
                  </DropdownMenuItem>
                  {post.status === 'scheduled' && (
                    <DropdownMenuItem onClick={() => handlePostNow(post)}>
                      <Send className="h-4 w-4 mr-2" />
                      Post Now
                    </DropdownMenuItem>
                  )}
                  {post.status === 'published' && (
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      View on Instagram
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={() => handleDeletePost(post.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <p className="text-sm mb-2 line-clamp-2">{post.content}</p>
            
            {post.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {post.hashtags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
                {post.hashtags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{post.hashtags.length - 3} more
                  </Badge>
                )}
              </div>
            )}
            
            {post.engagement && post.status === 'published' && (
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>❤️ {post.engagement.likes}</span>
                <span>💬 {post.engagement.comments}</span>
                <span>🔄 {post.engagement.shares}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Your Posts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Posts ({posts.length})</TabsTrigger>
              <TabsTrigger value="scheduled">
                Scheduled ({posts.filter(p => p.status === 'scheduled').length})
              </TabsTrigger>
              <TabsTrigger value="published">
                Published ({posts.filter(p => p.status === 'published').length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-6">
              {filteredPosts.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {activeTab === 'scheduled' && 'No scheduled posts'}
                    {activeTab === 'published' && 'No published posts'}
                    {activeTab === 'all' && 'No posts yet'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Create your first post to get started!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <PostEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        post={editingPost}
        onSavePost={handleSaveEditedPost}
      />
    </div>
  );
}