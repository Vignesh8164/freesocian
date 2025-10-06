import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Badge } from './ui/badge';
import { Search, Loader2, AlertCircle, Shuffle, ExternalLink } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  searchImages, 
  getRandomImages, 
  getSuggestedImages,
  trackImageDownload,
  UnsplashImage,
  UnsplashError,
  isUnsplashConfigured,
  checkUnsplashConnection,
  formatRateLimitError
} from './UnsplashService';
import { toast } from 'sonner@2.0.3';

interface UnsplashImagePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string) => void;
}

export function UnsplashImagePicker({ isOpen, onClose, onSelectImage }: UnsplashImagePickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(false);
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(false);
  const [isConnectedToUnsplash, setIsConnectedToUnsplash] = useState(false);

  // Load initial images when modal opens
  useEffect(() => {
    if (isOpen) {
      loadInitialImages();
      checkConnection();
    }
  }, [isOpen]);

  const checkConnection = async () => {
    const connected = await checkUnsplashConnection();
    setIsConnectedToUnsplash(connected);
  };

  const loadInitialImages = async () => {
    setIsLoadingInitial(true);
    setError(null);
    
    try {
      const suggestedImages = await getSuggestedImages();
      setImages(suggestedImages);
    } catch (err) {
      const error = err as UnsplashError;
      setError(formatRateLimitError(error));
      toast.error('Failed to load images: ' + formatRateLimitError(error));
    } finally {
      setIsLoadingInitial(false);
    }
  };

  const handleSearch = async (page: number = 1) => {
    if (!searchQuery.trim()) {
      // If search is empty, load suggested images
      await loadInitialImages();
      return;
    }
    
    setIsSearching(true);
    setError(null);
    
    try {
      const result = await searchImages(searchQuery, page, 20);
      
      if (page === 1) {
        setImages(result.results);
      } else {
        setImages(prev => [...prev, ...result.results]);
      }
      
      setCurrentPage(page);
      setHasMorePages(page < result.total_pages);
      
      if (result.results.length === 0 && page === 1) {
        toast.info(`No images found for "${searchQuery}". Try a different search term.`);
      }
    } catch (err) {
      const error = err as UnsplashError;
      const errorMessage = formatRateLimitError(error);
      setError(errorMessage);
      toast.error('Search failed: ' + errorMessage);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLoadMore = () => {
    if (!isSearching && hasMorePages) {
      handleSearch(currentPage + 1);
    }
  };

  const handleGetRandomImages = async () => {
    setIsSearching(true);
    setError(null);
    
    try {
      const randomImages = await getRandomImages(20);
      setImages(randomImages);
      setHasMorePages(false);
      setCurrentPage(1);
      toast.success('Loaded fresh random images!');
    } catch (err) {
      const error = err as UnsplashError;
      const errorMessage = formatRateLimitError(error);
      setError(errorMessage);
      toast.error('Failed to load random images: ' + errorMessage);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSelectImage = async (image: UnsplashImage) => {
    try {
      // Track download for Unsplash attribution (required by their API terms)
      await trackImageDownload(image.downloadUrl);
      
      onSelectImage(image.url);
      onClose();
      
      // Show attribution info
      if (isConnectedToUnsplash) {
        toast.success(`Selected image by ${image.photographer}`, {
          description: 'Photo will be attributed according to Unsplash guidelines'
        });
      }
    } catch (error) {
      console.error('Error tracking image download:', error);
      // Still allow the image to be selected even if tracking fails
      onSelectImage(image.url);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                Choose an Image
                {!isUnsplashConfigured() && (
                  <Badge variant="outline" className="text-xs">
                    Demo Mode
                  </Badge>
                )}
                {isConnectedToUnsplash && (
                  <Badge variant="default" className="text-xs bg-green-500">
                    Live API
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription>
                {isUnsplashConfigured() 
                  ? "Search millions of high-quality photos from Unsplash for your Instagram post." 
                  : "Browse our demo collection. Set up Unsplash API for access to millions more photos."
                }
              </DialogDescription>
            </div>
            {!isUnsplashConfigured() && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.open('https://unsplash.com/developers', '_blank');
                }}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Setup API
              </Button>
            )}
          </div>
        </DialogHeader>
        
        {/* Search Controls */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search for images... (e.g., coffee, nature, business, food)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10"
            />
          </div>
          <Button onClick={() => handleSearch(1)} disabled={isSearching}>
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleGetRandomImages} 
            disabled={isSearching}
            title="Get random images"
          >
            <Shuffle className="h-4 w-4" />
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Image Grid */}
        <div className="overflow-y-auto max-h-[50vh]">
          {isLoadingInitial || (isSearching && currentPage === 1) ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  {isLoadingInitial ? 'Loading suggested images...' : 'Searching...'}
                </p>
              </div>
            </div>
          ) : images.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No images found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try a different search term or click the shuffle button for random images
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="relative aspect-square cursor-pointer group rounded-lg overflow-hidden border border-border"
                    onClick={() => handleSelectImage(image)}
                  >
                    <ImageWithFallback
                      src={image.thumbnail}
                      alt={image.alt}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Button size="sm" variant="secondary">
                          Select
                        </Button>
                      </div>
                      {/* Photographer Attribution */}
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                        <p className="text-white text-xs truncate">
                          Photo by {image.photographer}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More Button */}
              {hasMorePages && (
                <div className="flex justify-center mt-6">
                  <Button 
                    variant="outline" 
                    onClick={handleLoadMore}
                    disabled={isSearching}
                  >
                    {isSearching ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Loading more...
                      </>
                    ) : (
                      'Load more images'
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer with attribution */}
        {isConnectedToUnsplash && (
          <div className="pt-4 border-t text-center">
            <p className="text-xs text-muted-foreground">
              Photos provided by{' '}
              <a 
                href="https://unsplash.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline hover:text-foreground"
              >
                Unsplash
              </a>
              . Selected images will include proper attribution.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}