import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { openFileDialog, validateImageFile, createImagePreview, uploadImageToBackend } from './FileUploadUtils';
import { toast } from 'sonner@2.0.3';
import { 
  User, 
  Camera, 
  Save,
  Instagram,
  Calendar,
  TrendingUp,
  Users,
  Heart,
  Upload
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const [profile, setProfile] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    bio: 'Content creator and social media enthusiast. Sharing my journey through beautiful posts and meaningful stories.',
    website: 'https://johndoe.com',
    instagramHandle: '@johndoe_official',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
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

  const handleAvatarChange = async () => {
    try {
      setIsUploadingAvatar(true);
      
      // Open file dialog
      const file = await openFileDialog('image/jpeg,image/jpg,image/png,image/gif');
      
      if (!file) {
        setIsUploadingAvatar(false);
        return;
      }

      // Validate file
      const validation = validateImageFile(file);
      if (!validation.valid) {
        toast.error(validation.error);
        setIsUploadingAvatar(false);
        return;
      }

      // Create preview
      const preview = await createImagePreview(file);
      
      // Update avatar preview immediately
      setProfile(prev => ({ ...prev, avatar: preview }));
      
      // Upload to backend
      const uploadedUrl = await uploadImageToBackend(file);
      
      // Update with final URL
      setProfile(prev => ({ ...prev, avatar: uploadedUrl }));
      
      toast.success('Profile picture updated successfully!');
      
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error('Failed to upload profile picture. Please try again.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Mock statistics
  const stats = {
    totalPosts: 47,
    totalLikes: 2843,
    totalComments: 456,
    followers: 1234,
    accountCreated: 'March 2024'
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Settings
          </DialogTitle>
          <DialogDescription>
            Manage your personal information and account details.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto max-h-[calc(90vh-150px)]">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Avatar Section */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile.avatar} alt="Profile picture" />
                    <AvatarFallback>
                      {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      onClick={handleAvatarChange}
                      disabled={isUploadingAvatar || isLoading}
                    >
                      {isUploadingAvatar ? (
                        <>
                          <Upload className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Camera className="h-4 w-4 mr-2" />
                          Change Photo
                        </>
                      )}
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      JPG, PNG or GIF. Maximum size 2MB.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profile.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profile.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    value={profile.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    disabled={isLoading}
                    className="min-h-20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://your-website.com"
                    value={profile.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram Handle</Label>
                  <Input
                    id="instagram"
                    placeholder="@your_instagram_handle"
                    value={profile.instagramHandle}
                    onChange={(e) => handleInputChange('instagramHandle', e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Statistics & Account Info */}
          <div className="space-y-6">
            {/* Account Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Account Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">{stats.totalPosts}</div>
                    <div className="text-sm text-muted-foreground">Posts</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">{stats.followers}</div>
                    <div className="text-sm text-muted-foreground">Followers</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      Total Likes
                    </span>
                    <Badge variant="secondary">{stats.totalLikes.toLocaleString()}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      Comments
                    </span>
                    <Badge variant="secondary">{stats.totalComments}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Details */}
            <Card>
              <CardHeader>
                <CardTitle>Account Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Member since</span>
                  <Badge variant="outline">{stats.accountCreated}</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Plan</span>
                  <Badge>Pro</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2">
                    <Instagram className="h-4 w-4" />
                    Instagram
                  </span>
                  <Badge variant="outline" className="text-green-600">Connected</Badge>
                </div>
                
                <div className="pt-4 border-t">
                  <Button variant="outline" className="w-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    Upgrade Plan
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive/20">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  These actions cannot be undone.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full text-destructive hover:text-destructive">
                  Change Password
                </Button>
                <Button variant="outline" className="w-full text-destructive hover:text-destructive">
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

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
                Save Changes
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}