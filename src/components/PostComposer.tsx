import { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { UnsplashImagePicker } from './UnsplashImagePicker';
import { 
  createPost, 
  uploadFile,
  User as AppwriteUser,
  Post as AppwritePost
} from './AppwriteService';
import { 
  getRandomImageForKeyword,
  UnsplashError,
  formatRateLimitError 
} from './UnsplashService';
import { 
  fetchImageWithTool,
  getSuggestedSearchTerms,
  isUnsplashToolAvailable 
} from './UnsplashToolWrapper';
import { 
  createInstagramPost,
  getInstagramConnection 
} from './InstagramApiService';
import { toast } from 'sonner@2.0.3';
import { 
  Image, 
  Calendar, 
  Send, 
  X, 
  Hash, 
  AtSign,
  Clock,
  Loader2,
  Wand2,
  Upload
} from 'lucide-react';

interface PostComposerProps {
  onSchedulePost: (post: AppwritePost) => void;
  currentUser: AppwriteUser;
}

export function PostComposer({ onSchedulePost, currentUser }: PostComposerProps) {
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [currentHashtag, setCurrentHashtag] = useState('');
  const [isAutoFetchingImage, setIsAutoFetchingImage] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);

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

  const handleAutoFetchImage = async () => {
    if (!content.trim()) {
      toast.error('Please write some content first to auto-fetch a relevant image');
      return;
    }

    setIsAutoFetchingImage(true);
    
    try {
      // Get AI-suggested search terms based on content and hashtags
      const suggestedTerms = getSuggestedSearchTerms(content, hashtags);
      const searchTerm = suggestedTerms[0] || 'lifestyle';
      
      let image;
      
      // Try to use the built-in unsplash_tool first (most reliable)
      if (isUnsplashToolAvailable()) {
        try {
          image = await fetchImageWithTool(searchTerm);
          toast.success(`Found a perfect image for "${searchTerm}"!`, {
            description: 'Auto-fetched using AI image search'
          });
        } catch (toolError) {
          console.log('Tool fetch failed, trying API fallback:', toolError);
          // Fallback to API method
          image = await getRandomImageForKeyword(searchTerm);
          toast.success(`Found a perfect image for "${searchTerm}"!`, {
            description: `Photo by ${image.photographer}`
          });
        }
      } else {
        // Use API method
        image = await getRandomImageForKeyword(searchTerm);
        toast.success(`Found a perfect image for "${searchTerm}"!`, {
          description: `Photo by ${image.photographer}`
        });
      }
      
      setSelectedImage(image.url);
      
    } catch (error) {
      console.error('Auto-fetch error:', error);
      const err = error as UnsplashError;
      toast.error('Failed to auto-fetch image: ' + (err.message || 'Please try again or select an image manually'));
    } finally {
      setIsAutoFetchingImage(false);
    }
  };

  const handleScheduleNow = async () => {
    if (!content.trim()) {
      toast.error('Please write some content for your post');
      return;
    }

    setIsScheduling(true);
    
    try {
      // Check Instagram connection for immediate posting
      const instagramConnection = await getInstagramConnection();
      const shouldPostToInstagram = instagramConnection?.isConnected && selectedImage;
      
      const postData = {
        content,
        image: selectedImage || undefined,
        hashtags,
        scheduledFor: new Date().toISOString(),
        platform: 'instagram'
      };

      // Create post in database first
      const post = await createPost(currentUser.$id, postData);
      
      // Try to post to Instagram if connected and has image
      if (shouldPostToInstagram && selectedImage) {
        try {
          const caption = `${content}${hashtags.length > 0 ? '\n\n' + hashtags.map(tag => `#${tag}`).join(' ') : ''}`;
          
          const instagramResult = await createInstagramPost({
            image_url: selectedImage,
            caption: caption
          });
          
          if (instagramResult.success) {
            toast.success('Post published to Instagram successfully!', {
              description: 'Your content is now live on Instagram'
            });
          } else {
            toast.warning('Post saved but Instagram publishing failed', {
              description: instagramResult.error || 'You can try posting manually from the posts manager'
            });
          }
        } catch (instagramError) {
          console.error('Instagram posting error:', instagramError);
          toast.warning('Post saved but Instagram publishing failed', {
            description: 'You can try posting manually from the posts manager'
          });
        }
      } else if (!instagramConnection?.isConnected) {
        toast.info('Post saved successfully!', {
          description: 'Connect Instagram in Settings to publish directly'
        });
      } else if (!selectedImage) {
        toast.info('Post saved successfully!', {
          description: 'Add an image to publish to Instagram'
        });
      } else {
        toast.success('Post saved successfully!');
      }
      
      onSchedulePost(post);
      resetForm();
    } catch (error) {
      console.error('Error publishing post:', error);
      toast.error('Failed to publish post. Please try again.');
    } finally {
      setIsScheduling(false);
    }
  };

  const handleScheduleLater = async () => {
    if (!content.trim()) {
      toast.error('Please write some content for your post');
      return;
    }

    setIsScheduling(true);
    
    try {
      const postData = {
        content,
        image: selectedImage || undefined,
        hashtags,
        scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        platform: 'instagram'
      };

      const post = await createPost(currentUser.$id, postData);
      onSchedulePost(post);
      resetForm();
      toast.success('Post scheduled for tomorrow!');
    } catch (error) {
      console.error('Error scheduling post:', error);
      toast.error('Failed to schedule post. Please try again.');
    } finally {
      setIsScheduling(false);
    }
  };

  const resetForm = () => {
    setContent('');
    setSelectedImage(null);
    setHashtags([]);
    setCurrentHashtag('');
  };

  const characterCount = content.length;
  const maxCharacters = 2200;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-gradient-to-r from-purple-500 to-pink-500" />
          Create Instagram Post
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Image Section */}
        {selectedImage ? (
          <div className="relative">
            <ImageWithFallback
              src={selectedImage}
              alt="Selected post image"
              className="w-full h-64 object-cover rounded-lg"
            />
            <Button
              size="sm"
              variant="destructive"
              className="absolute top-2 right-2"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-20 border-dashed"
                onClick={() => setShowImagePicker(true)}
              >
                <div className="flex flex-col items-center gap-1">
                  <Image className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">Browse Images</span>
                </div>
              </Button>
              <Button
                variant="outline"
                className="h-20 border-dashed"
                onClick={handleAutoFetchImage}
                disabled={isAutoFetchingImage || !content.trim()}
              >
                <div className="flex flex-col items-center gap-1">
                  {isAutoFetchingImage ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  ) : (
                    <Wand2 className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className="text-sm">
                    {isAutoFetchingImage ? 'Finding...' : 'Auto-Fetch'}
                  </span>
                </div>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Browse from millions of photos or let AI find the perfect image based on your content
            </p>
          </div>
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
                className="w-full pl-10 pr-3 py-2 border border-input rounded-md bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>
            <Button size="sm" onClick={addHashtag} disabled={!currentHashtag.trim()}>
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
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleScheduleNow}
            disabled={!content.trim() || isScheduling}
            className="flex-1"
          >
            {isScheduling ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {isScheduling ? 'Publishing...' : 'Post Now'}
          </Button>
          <Button
            variant="outline"
            onClick={handleScheduleLater}
            disabled={!content.trim() || isScheduling}
            className="flex-1"
          >
            {isScheduling ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Clock className="h-4 w-4 mr-2" />
            )}
            {isScheduling ? 'Scheduling...' : 'Schedule for Later'}
          </Button>
        </div>

        <UnsplashImagePicker
          isOpen={showImagePicker}
          onClose={() => setShowImagePicker(false)}
          onSelectImage={setSelectedImage}
        />
      </CardContent>
    </Card>
  );
}