// ========================================
// UNSPLASH TOOL WRAPPER
// ========================================
// This wrapper uses the built-in unsplash_tool for fetching images
// and provides a consistent interface for the application

import { UnsplashImage } from './UnsplashService';

/**
 * Fetch image using the built-in unsplash_tool
 * @param query - Search query for the image
 * @returns Promise<UnsplashImage> - Formatted image object
 */
export const fetchImageWithTool = async (query: string): Promise<UnsplashImage> => {
  try {
    // Use the built-in unsplash_tool which is available in this environment
    const imageUrl = await (window as any).unsplash_tool?.({ query }) || 
                     await (globalThis as any).unsplash_tool?.({ query });
    
    if (!imageUrl) {
      throw new Error('No image URL returned from unsplash_tool');
    }

    // Return formatted UnsplashImage object
    return {
      id: `tool-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      url: imageUrl,
      thumbnail: imageUrl, // Same URL for thumbnail
      alt: `${query} image from Unsplash`,
      description: `High-quality image related to ${query}`,
      photographer: 'Unsplash Contributor',
      photographerUrl: 'https://unsplash.com',
      downloadUrl: imageUrl,
      width: 1080,
      height: 1080
    };
  } catch (error) {
    console.error('Error using unsplash_tool:', error);
    throw new Error(`Failed to fetch image for "${query}": ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Check if unsplash_tool is available in the current environment
 */
export const isUnsplashToolAvailable = (): boolean => {
  return typeof (window as any).unsplash_tool === 'function' || 
         typeof (globalThis as any).unsplash_tool === 'function';
};

/**
 * Fetch multiple images for different keywords
 * @param queries - Array of search queries
 * @returns Promise<UnsplashImage[]> - Array of formatted image objects
 */
export const fetchMultipleImages = async (queries: string[]): Promise<UnsplashImage[]> => {
  const images: UnsplashImage[] = [];
  
  for (const query of queries) {
    try {
      const image = await fetchImageWithTool(query);
      images.push(image);
      
      // Add small delay to avoid overwhelming the service
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.warn(`Failed to fetch image for "${query}":`, error);
      // Continue with other queries
    }
  }
  
  return images;
};

/**
 * Get suggested search terms based on content analysis
 * @param content - Post content to analyze
 * @param hashtags - Array of hashtags
 * @returns string[] - Array of suggested search terms
 */
export const getSuggestedSearchTerms = (content: string, hashtags: string[]): string[] => {
  const suggestions: string[] = [];
  
  // Add hashtags as primary suggestions
  suggestions.push(...hashtags.slice(0, 3)); // Limit to first 3 hashtags
  
  // Common keywords that work well for social media
  const socialKeywords = [
    'coffee', 'food', 'lifestyle', 'business', 'nature', 'travel',
    'fashion', 'fitness', 'technology', 'workspace', 'minimal',
    'modern', 'creative', 'inspiration', 'success', 'wellness'
  ];
  
  // Extract keywords from content
  const words = content.toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 3); // Only words longer than 3 characters
  
  // Find matching social keywords in content
  for (const word of words) {
    const match = socialKeywords.find(keyword => 
      keyword.includes(word) || word.includes(keyword)
    );
    if (match && !suggestions.includes(match)) {
      suggestions.push(match);
    }
  }
  
  // Add fallback suggestions if none found
  if (suggestions.length === 0) {
    suggestions.push('lifestyle', 'minimal', 'modern');
  }
  
  // Limit to 5 suggestions and ensure they're unique
  return [...new Set(suggestions)].slice(0, 5);
};