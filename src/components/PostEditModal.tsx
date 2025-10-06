import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { UnsplashImagePicker } from './UnsplashImagePicker';
import { DateTimePicker } from './DateTimePicker';
import { 
  Image, 
  X, 
  Hash, 
  Save,
  Calendar,
  Clock
} from 'lucide-react';

interface Post {
  id: string;
  content: string;
  image?: string;
  hashtags: string[];
  scheduledFor: Date;
  status: 'scheduled' | 'published' | 'failed';
  platform: string;
}

interface PostEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post | null;
  onSavePost: (updatedPost: Post) => void;
}

export function PostEditModal({ isOpen, onClose, post, onSavePost }: PostEditModalProps) {
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [currentHashtag, setCurrentHashtag] = useState('');
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date>(new Date());

  useEffect(() => {
    if (post && isOpen) {
      setContent(post.content);
      setSelectedImage(post.image || null);
      setHashtags(post.hashtags);
      setCurrentHashtag('');
      setScheduledDate(post.scheduledFor);
    }
  }, [post, isOpen]);

  const addHashtag = () => {
    if (currentHashtag.trim() && !hashtags.includes(currentHashtag.trim())) {
      setHashtags([...hashtags, currentHashtag.trim()]);
      setCurrentHashtag('');
    }
  };

  const removeHashtag = (tag: string) => {
    setHashtags(hashtags.filter(h => h !== tag));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      addHashtag();
    }
  };

  const handleSave = async () => {
    if (!post) return;
    
    setIsLoading(true);
    
    // Mock save delay
    setTimeout(() => {
      const updatedPost = {
        ...post,
        content,
        image: selectedImage,
        hashtags,
        scheduledFor: scheduledDate
      };
      
      onSavePost(updatedPost);
      setIsLoading(false);
      onClose();
    }, 1000);
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!post) return null;

  const characterCount = content.length;
  const maxCharacters = 2200;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Edit Post</DialogTitle>
            <DialogDescription>
              Make changes to your Instagram post. 
              {post.status === 'scheduled' ? 'Changes will be applied when the post is published.' : 'Changes will update your published post.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-6 px-1">
            {/* Post Status Info */}
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Current status: <Badge variant="outline">{post.status}</Badge>
              </span>
            </div>

            {/* Date/Time Scheduling - Only for scheduled posts */}
            {post.status === 'scheduled' && (
              <div className="space-y-2">
                <DateTimePicker
                  value={scheduledDate}
                  onChange={setScheduledDate}
                  disabled={isLoading}
                  label="Schedule Date & Time"
                />
              </div>
            )}

            {/* Image Section */}
            {selectedImage ? (
              <div className="relative">
                <ImageWithFallback
                  src={selectedImage}
                  alt="Post image"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2"
                  onClick={() => setSelectedImage(null)}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full h-32 border-dashed"
                onClick={() => setShowImagePicker(true)}
                disabled={isLoading}
              >
                <div className="flex flex-col items-center gap-2">
                  <Image className="h-8 w-8 text-muted-foreground" />
                  <span>Change Image</span>
                </div>
              </Button>
            )}

            {/* Content Section */}
            <div className="space-y-2">
              <Label htmlFor="content">Caption</Label>
              <Textarea
                id="content"
                placeholder="Write your Instagram caption..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-32 resize-none"
                maxLength={maxCharacters}
                disabled={isLoading}
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Add emojis and line breaks to make your caption engaging</span>
                <span className={characterCount > maxCharacters * 0.9 ? 'text-destructive' : ''}>
                  {characterCount}/{maxCharacters}
                </span>
              </div>
            </div>

            {/* Hashtags Section */}
            <div className="space-y-2">
              <Label>Hashtags</Label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Add hashtag"
                    value={currentHashtag}
                    onChange={(e) => setCurrentHashtag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    className="w-full pl-10 pr-3 py-2 border border-input rounded-md bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50"
                  />
                </div>
                <Button 
                  size="sm" 
                  onClick={addHashtag} 
                  disabled={!currentHashtag.trim() || isLoading}
                >
                  Add
                </Button>
              </div>
              {hashtags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {hashtags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      #{tag}
                      <button
                        onClick={() => removeHashtag(tag)}
                        disabled={isLoading}
                        className="ml-1 hover:text-destructive disabled:opacity-50"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sticky Action Buttons Footer */}
          <div className="flex-shrink-0 sticky bottom-0 bg-background border-t pt-4 mt-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading || (!content.trim() && !selectedImage)}
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
                    {post.status === 'scheduled' ? 'Update Schedule' : 'Save Changes'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <UnsplashImagePicker
        isOpen={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onSelectImage={setSelectedImage}
      />
    </>
  );
}