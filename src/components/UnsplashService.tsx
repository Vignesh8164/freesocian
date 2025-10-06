// ========================================
// UNSPLASH API CONFIGURATION
// ========================================
// TODO: Replace this placeholder with your actual Unsplash API Access Key
// Get your API key from: https://unsplash.com/developers
// 1. Create an account at https://unsplash.com/developers
// 2. Create a new application 
// 3. Copy the "Access Key" from your application dashboard
// 4. Replace the placeholder below with your actual key
const UNSPLASH_ACCESS_KEY = 'YOUR_UNSPLASH_ACCESS_KEY'; // Replace with your actual Unsplash Access Key

const UNSPLASH_API_BASE = 'https://api.unsplash.com';

// Check if Unsplash is properly configured
const isUnsplashConfigured = () => {
  return UNSPLASH_ACCESS_KEY !== 'YOUR_UNSPLASH_ACCESS_KEY' && 
         UNSPLASH_ACCESS_KEY.length > 10; // Basic validation
};

// ========================================
// TYPE DEFINITIONS
// ========================================
export interface UnsplashImage {
  id: string;
  url: string;
  thumbnail: string;
  alt: string;
  description: string | null;
  photographer: string;
  photographerUrl: string;
  downloadUrl: string;
  width: number;
  height: number;
}

export interface UnsplashSearchResponse {
  total: number;
  total_pages: number;
  results: UnsplashImage[];
}

export interface UnsplashError {
  error: string;
  message: string;
  isRateLimit?: boolean;
  retryAfter?: number;
}

// ========================================
// MOCK DATA FOR DEVELOPMENT/FALLBACK
// ========================================
const mockImages: UnsplashImage[] = [
  {
    id: 'mock-1',
    url: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NpYWwlMjBtZWRpYSUyMG1hcmtldGluZ3xlbnwxfHx8fDE3NTk1OTU0NDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    thumbnail: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NpYWwlMjBtZWRpYSUyMG1hcmtldGluZ3xlbnwxfHx8fDE3NTk1OTU0NDJ8MA&ixlib=rb-4.1.0&q=80&w=400',
    alt: 'Social media marketing workspace',
    description: 'Person using laptop for social media marketing',
    photographer: 'Demo Photographer',
    photographerUrl: 'https://unsplash.com/@demo',
    downloadUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7',
    width: 1080,
    height: 720
  },
  {
    id: 'mock-2',
    url: 'https://images.unsplash.com/photo-1518757944516-6f13049afe50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBsaWZlc3R5bGV8ZW58MXx8fHwxNzU5NTYxNTI2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    thumbnail: 'https://images.unsplash.com/photo-1518757944516-6f13049afe50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBsaWZlc3R5bGV8ZW58MXx8fHwxNzU5NTYxNTI2fDA&ixlib=rb-4.1.0&q=80&w=400',
    alt: 'Morning coffee lifestyle',
    description: 'Perfect cup of coffee on wooden table',
    photographer: 'Demo Photographer',
    photographerUrl: 'https://unsplash.com/@demo',
    downloadUrl: 'https://images.unsplash.com/photo-1518757944516-6f13049afe50',
    width: 1080,
    height: 1350
  },
  {
    id: 'mock-3',
    url: 'https://images.unsplash.com/photo-1526779259212-939e64788e8e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    thumbnail: 'https://images.unsplash.com/photo-1526779259212-939e64788e8e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    alt: 'Modern workspace setup',
    description: 'Clean and organized office workspace',
    photographer: 'Demo Photographer',
    photographerUrl: 'https://unsplash.com/@demo',
    downloadUrl: 'https://images.unsplash.com/photo-1526779259212-939e64788e8e',
    width: 1080,
    height: 720
  },
  {
    id: 'mock-4',
    url: 'https://images.unsplash.com/photo-1493723843671-1d655e66ac1c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    thumbnail: 'https://images.unsplash.com/photo-1493723843671-1d655e66ac1c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    alt: 'Delicious food photography',
    description: 'Beautiful food presentation on table',
    photographer: 'Demo Photographer',
    photographerUrl: 'https://unsplash.com/@demo',
    downloadUrl: 'https://images.unsplash.com/photo-1493723843671-1d655e66ac1c',
    width: 1080,
    height: 1080
  },
  {
    id: 'mock-5',
    url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    thumbnail: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    alt: 'Beautiful nature landscape',
    description: 'Scenic mountain landscape view',
    photographer: 'Demo Photographer',
    photographerUrl: 'https://unsplash.com/@demo',
    downloadUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e',
    width: 1080,
    height: 720
  },
  {
    id: 'mock-6',
    url: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    thumbnail: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    alt: 'Fashion and lifestyle',
    description: 'Stylish fashion photography',
    photographer: 'Demo Photographer',
    photographerUrl: 'https://unsplash.com/@demo',
    downloadUrl: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff',
    width: 1080,
    height: 1350
  },
  {
    id: 'mock-7',
    url: 'https://images.unsplash.com/photo-1551632811-561732d1e306?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    thumbnail: 'https://images.unsplash.com/photo-1551632811-561732d1e306?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    alt: 'Technology and innovation',
    description: 'Modern technology workspace',
    photographer: 'Demo Photographer',
    photographerUrl: 'https://unsplash.com/@demo',
    downloadUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306',
    width: 1080,
    height: 720
  },
  {
    id: 'mock-8',
    url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    alt: 'Fitness and health',
    description: 'Healthy lifestyle and fitness',
    photographer: 'Demo Photographer',
    photographerUrl: 'https://unsplash.com/@demo',
    downloadUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
    width: 1080,
    height: 1350
  }
];

// ========================================
// API HELPER FUNCTIONS
// ========================================

/**
 * Make authenticated request to Unsplash API
 */
const makeUnsplashRequest = async (endpoint: string): Promise<any> => {
  if (!isUnsplashConfigured()) {
    throw new Error('Unsplash API not configured');
  }

  const response = await fetch(`${UNSPLASH_API_BASE}${endpoint}`, {
    headers: {
      'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      'Accept-Version': 'v1'
    }
  });

  // Handle rate limiting
  if (response.status === 403) {
    const retryAfter = response.headers.get('X-Ratelimit-Remaining');
    throw {
      error: 'Rate limit exceeded',
      message: 'You have exceeded the Unsplash API rate limit. Please try again later.',
      isRateLimit: true,
      retryAfter: retryAfter ? parseInt(retryAfter) : 3600
    } as UnsplashError;
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw {
      error: `HTTP ${response.status}`,
      message: errorData.errors ? errorData.errors.join(', ') : 'Failed to fetch from Unsplash API'
    } as UnsplashError;
  }

  return response.json();
};

/**
 * Transform Unsplash API response to our UnsplashImage format
 */
const transformUnsplashResponse = (apiPhoto: any): UnsplashImage => {
  return {
    id: apiPhoto.id,
    url: apiPhoto.urls.regular,
    thumbnail: apiPhoto.urls.thumb,
    alt: apiPhoto.alt_description || apiPhoto.description || 'Unsplash image',
    description: apiPhoto.description,
    photographer: apiPhoto.user.name,
    photographerUrl: apiPhoto.user.links.html,
    downloadUrl: apiPhoto.links.download_location,
    width: apiPhoto.width,
    height: apiPhoto.height
  };
};

// ========================================
// MAIN API FUNCTIONS
// ========================================

/**
 * Search for images by keyword
 * @param query - Search query string
 * @param page - Page number (default: 1)
 * @param perPage - Number of results per page (default: 20, max: 30)
 * @param orientation - Image orientation filter (optional)
 */
export const searchImages = async (
  query: string, 
  page: number = 1, 
  perPage: number = 20,
  orientation?: 'landscape' | 'portrait' | 'squarish'
): Promise<UnsplashSearchResponse> => {
  try {
    if (!isUnsplashConfigured()) {
      console.log('Unsplash not configured - using mock data');
      // Return filtered mock data
      const filteredImages = mockImages.filter(img => 
        img.alt.toLowerCase().includes(query.toLowerCase()) ||
        (img.description && img.description.toLowerCase().includes(query.toLowerCase()))
      );
      
      return {
        total: filteredImages.length,
        total_pages: Math.ceil(filteredImages.length / perPage),
        results: filteredImages.slice((page - 1) * perPage, page * perPage)
      };
    }

    let endpoint = `/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`;
    
    if (orientation) {
      endpoint += `&orientation=${orientation}`;
    }

    const data = await makeUnsplashRequest(endpoint);

    return {
      total: data.total,
      total_pages: data.total_pages,
      results: data.results.map(transformUnsplashResponse)
    };
  } catch (error) {
    console.error('Error searching images:', error);
    throw error;
  }
};

/**
 * Get random images
 * @param count - Number of random images (default: 20, max: 30)
 * @param query - Optional search query to filter random images
 * @param orientation - Image orientation filter (optional)
 */
export const getRandomImages = async (
  count: number = 20, 
  query?: string,
  orientation?: 'landscape' | 'portrait' | 'squarish'
): Promise<UnsplashImage[]> => {
  try {
    if (!isUnsplashConfigured()) {
      console.log('Unsplash not configured - using mock data');
      
      let images = [...mockImages];
      
      // Filter by query if provided
      if (query) {
        images = images.filter(img => 
          img.alt.toLowerCase().includes(query.toLowerCase()) ||
          (img.description && img.description.toLowerCase().includes(query.toLowerCase()))
        );
      }
      
      // Shuffle and return requested count
      const shuffled = images.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, Math.min(count, shuffled.length));
    }

    let endpoint = `/photos/random?count=${Math.min(count, 30)}`;
    
    if (query) {
      endpoint += `&query=${encodeURIComponent(query)}`;
    }
    
    if (orientation) {
      endpoint += `&orientation=${orientation}`;
    }

    const data = await makeUnsplashRequest(endpoint);
    
    // Handle both single photo and array responses
    const photos = Array.isArray(data) ? data : [data];
    return photos.map(transformUnsplashResponse);
  } catch (error) {
    console.error('Error getting random images:', error);
    throw error;
  }
};

/**
 * Get a single random image for a specific keyword
 * Uses the built-in unsplash_tool as primary method with API fallback
 * @param keyword - Keyword to search for (optional, returns truly random if not provided)  
 * @param orientation - Image orientation filter (optional)
 */
export const getRandomImageForKeyword = async (
  keyword?: string,
  orientation?: 'landscape' | 'portrait' | 'squarish'
): Promise<UnsplashImage> => {
  // Primary method: Use the built-in unsplash_tool (most reliable)
  try {
    // Use the unsplash_tool function which is available in this environment
    const response = await fetch('/api/unsplash-tool', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: keyword || 'lifestyle' })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.imageUrl) {
        return {
          id: `tool-${Date.now()}`,
          url: data.imageUrl,
          thumbnail: data.imageUrl,
          alt: `${keyword || 'lifestyle'} image from Unsplash`,
          description: `Auto-fetched image for ${keyword || 'lifestyle'}`,
          photographer: 'Unsplash Contributor',
          photographerUrl: 'https://unsplash.com',
          downloadUrl: data.imageUrl,
          width: 1080,
          height: 1080
        };
      }
    }
  } catch (error) {
    console.log('Unsplash tool API not available, using direct implementation');
  }

  // Fallback to direct API implementation
  try {
    const images = await getRandomImages(1, keyword, orientation);
    
    if (images.length === 0) {
      // Final fallback to any random image
      const fallbackImages = await getRandomImages(1);
      if (fallbackImages.length === 0) {
        throw new Error('No images available');
      }
      return fallbackImages[0];
    }
    
    return images[0];
  } catch (error) {
    // Ultimate fallback: return a mock image
    const fallbackKeyword = keyword || 'lifestyle';
    const mockImage = mockImages.find(img => 
      img.alt.toLowerCase().includes(fallbackKeyword.toLowerCase())
    ) || mockImages[0];
    
    return mockImage;
  }
};

/**
 * Get suggested images for social media posts
 * Returns a curated selection of images perfect for Instagram posts
 */
export const getSuggestedImages = async (): Promise<UnsplashImage[]> => {
  try {
    // Curated keywords that work well for social media
    const socialMediaKeywords = [
      'lifestyle', 'coffee', 'workspace', 'food', 'nature', 
      'fashion', 'technology', 'fitness', 'travel', 'business'
    ];
    
    if (!isUnsplashConfigured()) {
      // Return shuffled mock images
      return [...mockImages].sort(() => 0.5 - Math.random());
    }

    // Get random images with a mix of popular social media topics
    const randomKeyword = socialMediaKeywords[Math.floor(Math.random() * socialMediaKeywords.length)];
    return await getRandomImages(20, randomKeyword);
  } catch (error) {
    console.error('Error getting suggested images:', error);
    // Return mock images as fallback
    return mockImages;
  }
};

/**
 * Download an image (for attribution purposes)
 * This triggers the download tracking required by Unsplash
 * @param downloadUrl - The download_location URL from the image object
 */
export const trackImageDownload = async (downloadUrl: string): Promise<void> => {
  try {
    if (!isUnsplashConfigured() || downloadUrl.includes('mock')) {
      // Skip tracking for mock images
      return;
    }

    await makeUnsplashRequest(downloadUrl.replace(UNSPLASH_API_BASE, ''));
  } catch (error) {
    console.error('Error tracking image download:', error);
    // Don't throw error as this is just for tracking
  }
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Check if Unsplash API is configured and available
 */
export const checkUnsplashConnection = async (): Promise<boolean> => {
  try {
    if (!isUnsplashConfigured()) {
      return false;
    }

    // Try to get a random photo to test the connection
    await makeUnsplashRequest('/photos/random');
    return true;
  } catch (error) {
    console.error('Unsplash connection check failed:', error);
    return false;
  }
};

/**
 * Get the current rate limit status
 */
export const getRateLimitStatus = async (): Promise<{
  limit: number;
  remaining: number;
  resetTime: Date;
} | null> => {
  try {
    if (!isUnsplashConfigured()) {
      return null;
    }

    const response = await fetch(`${UNSPLASH_API_BASE}/photos/random`, {
      method: 'HEAD',
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        'Accept-Version': 'v1'
      }
    });

    const limit = response.headers.get('X-Ratelimit-Limit');
    const remaining = response.headers.get('X-Ratelimit-Remaining');
    const resetTime = response.headers.get('X-Ratelimit-Reset');

    if (!limit || !remaining || !resetTime) {
      return null;
    }

    return {
      limit: parseInt(limit),
      remaining: parseInt(remaining),
      resetTime: new Date(parseInt(resetTime) * 1000)
    };
  } catch (error) {
    console.error('Error getting rate limit status:', error);
    return null;
  }
};

/**
 * Helper function to format rate limit error messages
 */
export const formatRateLimitError = (error: UnsplashError): string => {
  if (!error.isRateLimit) {
    return error.message;
  }

  const hours = Math.ceil((error.retryAfter || 3600) / 3600);
  return `${error.message} Please try again in about ${hours} hour${hours > 1 ? 's' : ''}.`;
};

// Export configuration status
export { isUnsplashConfigured };