// ========================================
// INSTAGRAM API INTEGRATION SERVICE
// ========================================
// Complete Instagram API integration with OAuth 2.0 flow, token management,
// and post creation for authenticated users only.

import { 
  getCurrentUser, 
  updateUserData, 
  User as AppwriteUser 
} from './AppwriteService';
import { toast } from 'sonner@2.0.3';

// ========================================
// INSTAGRAM API CONFIGURATION
// ========================================
// TODO: Replace these placeholders with your actual Instagram App credentials
// Get your credentials from: https://developers.facebook.com/apps/
// 1. Create a Facebook App at https://developers.facebook.com/apps/
// 2. Add "Instagram Basic Display" product to your app
// 3. Configure OAuth redirect URIs in your app settings
// 4. Copy your Client ID and Client Secret from the app dashboard
// 5. Replace the placeholders below with your actual credentials

const INSTAGRAM_CONFIG = {
  // Replace with your actual Instagram Client ID from Facebook Developers
  CLIENT_ID: 'YOUR_INSTAGRAM_CLIENT_ID', // e.g., '1234567890123456'
  
  // Replace with your actual Instagram Client Secret from Facebook Developers  
  CLIENT_SECRET: 'YOUR_INSTAGRAM_CLIENT_SECRET', // e.g., 'abcdef1234567890abcdef1234567890'
  
  // Replace with your actual redirect URI (must be registered in Facebook Developers)
  REDIRECT_URI: 'YOUR_DOMAIN/auth/instagram/callback', // e.g., 'https://yourdomain.com/auth/instagram/callback'
  
  // Instagram OAuth endpoints
  AUTH_URL: 'https://api.instagram.com/oauth/authorize',
  TOKEN_URL: 'https://api.instagram.com/oauth/access_token',
  
  // Instagram Basic Display API endpoints
  API_BASE: 'https://graph.instagram.com',
  
  // Required scopes for Instagram Basic Display API
  SCOPES: 'user_profile,user_media',
  
  // Token refresh endpoint
  REFRESH_URL: 'https://graph.instagram.com/refresh_access_token'
};

// Check if Instagram API is properly configured
const isInstagramConfigured = (): boolean => {
  return INSTAGRAM_CONFIG.CLIENT_ID !== 'YOUR_INSTAGRAM_CLIENT_ID' &&
         INSTAGRAM_CONFIG.CLIENT_SECRET !== 'YOUR_INSTAGRAM_CLIENT_SECRET' &&
         INSTAGRAM_CONFIG.REDIRECT_URI !== 'YOUR_DOMAIN/auth/instagram/callback' &&
         INSTAGRAM_CONFIG.CLIENT_ID.length > 10 &&
         INSTAGRAM_CONFIG.CLIENT_SECRET.length > 10;
};

// ========================================
// TYPE DEFINITIONS
// ========================================
export interface InstagramUser {
  id: string;
  username: string;
  account_type: 'PERSONAL' | 'BUSINESS';
  media_count: number;
}

export interface InstagramMedia {
  id: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  thumbnail_url?: string;
  caption?: string;
  permalink: string;
  timestamp: string;
}

export interface InstagramTokens {
  access_token: string;
  token_type: 'bearer';
  expires_in?: number;
  refresh_token?: string;
  user_id: string;
}

export interface InstagramConnection {
  isConnected: boolean;
  user?: InstagramUser;
  tokens?: InstagramTokens;
  connectedAt: string;
  lastRefresh?: string;
  error?: string;
}

export interface InstagramPostData {
  image_url: string;
  caption?: string;
  location_id?: string;
  user_tags?: Array<{
    username: string;
    x: number;
    y: number;
  }>;
}

export interface InstagramApiError {
  error: string;
  error_description?: string;
  error_user_title?: string;
  error_user_msg?: string;
  code?: number;
}

// ========================================
// INITIALIZATION & CLEANUP
// ========================================

/**
 * Initialize Instagram API service and clear any demo/test data
 * This should be called once when the app starts
 */
export const initializeInstagramService = async (): Promise<void> => {
  try {
    console.log('🔧 Initializing Instagram API service...');
    
    // Clear all demo/test accounts and connections
    await clearAllTestData();
    
    // Verify configuration
    if (!isInstagramConfigured()) {
      console.log('🔧 Instagram API running in demo mode');
      console.log('📖 To enable real Instagram posting, see INSTAGRAM_SETUP.md for configuration guide');
      console.log('✨ Demo mode provides full UI functionality with simulated Instagram integration');
    } else {
      console.log('✅ Instagram API properly configured and ready for live posting');
    }
    
    // Initialize authentication state
    await initializeAuthState();
    
    console.log('✅ Instagram API service initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Instagram service:', error);
  }
};

/**
 * Clear all demo/test data and connections
 */
const clearAllTestData = async (): Promise<void> => {
  try {
    // Clear localStorage test data
    const keysToRemove = [
      'instagram_access_token',
      'instagram_connected',
      'instagram_connected_at',
      'instagram_user_data',
      'instagram_refresh_token',
      'demo_instagram_posts',
      'test_instagram_connection'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    // If there are any test users in Appwrite, we would clear them here
    // This would typically be done through an admin API call
    console.log('🧹 Cleared all Instagram test/demo data');
  } catch (error) {
    console.error('Failed to clear test data:', error);
  }
};

/**
 * Initialize authentication state for current user
 */
const initializeAuthState = async (): Promise<void> => {
  try {
    const currentUser = await getCurrentUser();
    if (currentUser && currentUser.instagramConnection) {
      // Validate existing connection
      const isValid = await validateConnection(currentUser.instagramConnection);
      if (!isValid) {
        // Clear invalid connection
        await disconnectInstagram();
      }
    }
  } catch (error) {
    console.error('Failed to initialize auth state:', error);
  }
};

// ========================================
// OAUTH 2.0 FLOW IMPLEMENTATION
// ========================================

/**
 * Initiate Instagram OAuth 2.0 authorization flow
 * Only works for authenticated users
 */
export const connectInstagram = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    // Verify user is authenticated
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'User must be logged in to connect Instagram' };
    }
    
    // Check if Instagram API is configured
    if (!isInstagramConfigured()) {
      return { 
        success: false, 
        error: 'Instagram API running in demo mode. See INSTAGRAM_SETUP.md to enable real Instagram integration.' 
      };
    }
    
    // Check if already connected
    if (currentUser.instagramConnection?.isConnected) {
      return { success: false, error: 'Instagram already connected' };
    }
    
    // Generate state parameter for security
    const state = generateSecureState();
    sessionStorage.setItem('instagram_oauth_state', state);
    
    // Build authorization URL
    const authUrl = buildAuthorizationUrl(state);
    
    // Open OAuth popup
    const result = await openOAuthPopup(authUrl);
    
    if (result.success && result.code) {
      // Exchange authorization code for access token
      const tokens = await exchangeCodeForTokens(result.code, state);
      
      if (tokens) {
        // Get user profile data
        const userProfile = await getInstagramUserProfile(tokens.access_token);
        
        if (userProfile) {
          // Save connection to user profile
          const connection: InstagramConnection = {
            isConnected: true,
            user: userProfile,
            tokens,
            connectedAt: new Date().toISOString()
          };
          
          await updateUserInstagramConnection(currentUser.$id, connection);
          
          toast.success(`Successfully connected to Instagram as @${userProfile.username}!`);
          return { success: true };
        }
      }
    }
    
    return { success: false, error: result.error || 'Failed to connect Instagram' };
  } catch (error) {
    console.error('Instagram connection error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

/**
 * Disconnect Instagram account
 */
export const disconnectInstagram = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'User not authenticated' };
    }
    
    const connection = currentUser.instagramConnection;
    if (!connection?.isConnected) {
      return { success: false, error: 'Instagram not connected' };
    }
    
    // Revoke access token if configured
    if (isInstagramConfigured() && connection.tokens?.access_token) {
      try {
        await revokeAccessToken(connection.tokens.access_token);
      } catch (error) {
        console.warn('Failed to revoke token:', error);
        // Continue with disconnect even if revoke fails
      }
    }
    
    // Clear connection from user profile
    await updateUserInstagramConnection(currentUser.$id, {
      isConnected: false,
      connectedAt: connection.connectedAt,
      lastRefresh: connection.lastRefresh
    });
    
    toast.success('Instagram account disconnected successfully');
    return { success: true };
  } catch (error) {
    console.error('Instagram disconnect error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to disconnect' 
    };
  }
};

/**
 * Refresh Instagram access token
 */
export const refreshInstagramToken = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser?.instagramConnection?.isConnected) {
      return { success: false, error: 'Instagram not connected' };
    }
    
    const connection = currentUser.instagramConnection;
    if (!connection.tokens?.access_token) {
      return { success: false, error: 'No access token found' };
    }
    
    if (!isInstagramConfigured()) {
      // In demo mode, just update the timestamp
      connection.lastRefresh = new Date().toISOString();
      await updateUserInstagramConnection(currentUser.$id, connection);
      return { success: true };
    }
    
    // Refresh the token using Instagram API
    const refreshedTokens = await refreshAccessToken(connection.tokens.access_token);
    
    if (refreshedTokens) {
      connection.tokens = refreshedTokens;
      connection.lastRefresh = new Date().toISOString();
      
      await updateUserInstagramConnection(currentUser.$id, connection);
      
      toast.success('Instagram token refreshed successfully');
      return { success: true };
    }
    
    return { success: false, error: 'Failed to refresh token' };
  } catch (error) {
    console.error('Token refresh error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Token refresh failed' 
    };
  }
};

// ========================================
// POST CREATION
// ========================================

/**
 * Create Instagram post
 * Only works for authenticated users with connected Instagram accounts
 */
export const createInstagramPost = async (postData: InstagramPostData): Promise<{ 
  success: boolean; 
  post_id?: string; 
  error?: string 
}> => {
  try {
    // Verify user authentication
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'User must be logged in to create posts' };
    }
    
    // Verify Instagram connection
    const connection = currentUser.instagramConnection;
    if (!connection?.isConnected) {
      return { success: false, error: 'Instagram account not connected' };
    }
    
    if (!connection.tokens?.access_token) {
      return { success: false, error: 'No valid Instagram access token' };
    }
    
    // Validate post data
    if (!postData.image_url) {
      return { success: false, error: 'Image URL is required' };
    }
    
    if (!isInstagramConfigured()) {
      // Demo mode: simulate successful post creation
      const mockPostId = `demo_post_${Date.now()}`;
      
      toast.success('Post created successfully!', {
        description: 'Demo mode: Post would be published to Instagram'
      });
      
      return { success: true, post_id: mockPostId };
    }
    
    // Real API: Create Instagram media
    const mediaId = await createInstagramMedia(connection.tokens.access_token, postData);
    
    if (mediaId) {
      // Publish the media
      const postId = await publishInstagramMedia(connection.tokens.access_token, mediaId);
      
      if (postId) {
        toast.success('Post published to Instagram successfully!');
        return { success: true, post_id: postId };
      }
    }
    
    return { success: false, error: 'Failed to create Instagram post' };
  } catch (error) {
    console.error('Instagram post creation error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Post creation failed' 
    };
  }
};

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Generate secure state parameter for OAuth
 */
const generateSecureState = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Build Instagram authorization URL
 */
const buildAuthorizationUrl = (state: string): string => {
  const params = new URLSearchParams({
    client_id: INSTAGRAM_CONFIG.CLIENT_ID,
    redirect_uri: INSTAGRAM_CONFIG.REDIRECT_URI,
    scope: INSTAGRAM_CONFIG.SCOPES,
    response_type: 'code',
    state
  });
  
  return `${INSTAGRAM_CONFIG.AUTH_URL}?${params.toString()}`;
};

/**
 * Open OAuth popup and handle the flow
 */
const openOAuthPopup = (authUrl: string): Promise<{ success: boolean; code?: string; error?: string }> => {
  return new Promise((resolve) => {
    const popup = window.open(
      authUrl,
      'instagram-oauth',
      'width=600,height=700,scrollbars=yes,resizable=yes,centerscreen=yes'
    );
    
    if (!popup) {
      resolve({ success: false, error: 'Popup blocked. Please allow popups for this site.' });
      return;
    }
    
    // Monitor popup
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        resolve({ success: false, error: 'Authorization cancelled by user' });
      }
    }, 1000);
    
    // Listen for messages from popup
    const messageHandler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'INSTAGRAM_AUTH_SUCCESS') {
        clearInterval(checkClosed);
        popup.close();
        window.removeEventListener('message', messageHandler);
        resolve({ success: true, code: event.data.code });
      } else if (event.data.type === 'INSTAGRAM_AUTH_ERROR') {
        clearInterval(checkClosed);
        popup.close();
        window.removeEventListener('message', messageHandler);
        resolve({ success: false, error: event.data.error });
      }
    };
    
    window.addEventListener('message', messageHandler);
    
    // Timeout after 5 minutes
    setTimeout(() => {
      clearInterval(checkClosed);
      window.removeEventListener('message', messageHandler);
      if (!popup.closed) {
        popup.close();
      }
      resolve({ success: false, error: 'Authorization timeout' });
    }, 300000);
  });
};

/**
 * Exchange authorization code for access tokens
 */
const exchangeCodeForTokens = async (code: string, state: string): Promise<InstagramTokens | null> => {
  try {
    // Verify state parameter
    const savedState = sessionStorage.getItem('instagram_oauth_state');
    if (savedState !== state) {
      throw new Error('Invalid state parameter');
    }
    
    const formData = new FormData();
    formData.append('client_id', INSTAGRAM_CONFIG.CLIENT_ID);
    formData.append('client_secret', INSTAGRAM_CONFIG.CLIENT_SECRET);
    formData.append('grant_type', 'authorization_code');
    formData.append('redirect_uri', INSTAGRAM_CONFIG.REDIRECT_URI);
    formData.append('code', code);
    
    const response = await fetch(INSTAGRAM_CONFIG.TOKEN_URL, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json() as InstagramApiError;
      throw new Error(error.error_description || error.error || 'Token exchange failed');
    }
    
    const tokens = await response.json() as InstagramTokens;
    
    // Clean up state
    sessionStorage.removeItem('instagram_oauth_state');
    
    return tokens;
  } catch (error) {
    console.error('Token exchange error:', error);
    sessionStorage.removeItem('instagram_oauth_state');
    return null;
  }
};

/**
 * Get Instagram user profile
 */
const getInstagramUserProfile = async (accessToken: string): Promise<InstagramUser | null> => {
  try {
    const response = await fetch(
      `${INSTAGRAM_CONFIG.API_BASE}/me?fields=id,username,account_type,media_count&access_token=${accessToken}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to get user profile');
    }
    
    return await response.json() as InstagramUser;
  } catch (error) {
    console.error('Get user profile error:', error);
    return null;
  }
};

/**
 * Refresh Instagram access token
 */
const refreshAccessToken = async (accessToken: string): Promise<InstagramTokens | null> => {
  try {
    const response = await fetch(
      `${INSTAGRAM_CONFIG.REFRESH_URL}?grant_type=ig_refresh_token&access_token=${accessToken}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }
    
    return await response.json() as InstagramTokens;
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
};

/**
 * Revoke Instagram access token
 */
const revokeAccessToken = async (accessToken: string): Promise<void> => {
  try {
    // Instagram doesn't have a specific revoke endpoint
    // The token will expire naturally or can be revoked from Instagram settings
    console.log('Token revocation requested - user should revoke from Instagram settings');
  } catch (error) {
    console.error('Token revoke error:', error);
  }
};

/**
 * Create Instagram media container
 */
const createInstagramMedia = async (accessToken: string, postData: InstagramPostData): Promise<string | null> => {
  try {
    const formData = new FormData();
    formData.append('image_url', postData.image_url);
    if (postData.caption) {
      formData.append('caption', postData.caption);
    }
    formData.append('access_token', accessToken);
    
    const response = await fetch(`${INSTAGRAM_CONFIG.API_BASE}/me/media`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json() as InstagramApiError;
      throw new Error(error.error_description || error.error || 'Media creation failed');
    }
    
    const result = await response.json() as { id: string };
    return result.id;
  } catch (error) {
    console.error('Create media error:', error);
    return null;
  }
};

/**
 * Publish Instagram media
 */
const publishInstagramMedia = async (accessToken: string, mediaId: string): Promise<string | null> => {
  try {
    const formData = new FormData();
    formData.append('creation_id', mediaId);
    formData.append('access_token', accessToken);
    
    const response = await fetch(`${INSTAGRAM_CONFIG.API_BASE}/me/media_publish`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json() as InstagramApiError;
      throw new Error(error.error_description || error.error || 'Media publish failed');
    }
    
    const result = await response.json() as { id: string };
    return result.id;
  } catch (error) {
    console.error('Publish media error:', error);
    return null;
  }
};

/**
 * Update user's Instagram connection in Appwrite
 */
const updateUserInstagramConnection = async (userId: string, connection: InstagramConnection): Promise<void> => {
  try {
    await updateUserData(userId, { instagramConnection: connection });
  } catch (error) {
    console.error('Failed to update Instagram connection:', error);
    throw error;
  }
};

/**
 * Validate existing Instagram connection
 */
const validateConnection = async (connection: InstagramConnection): Promise<boolean> => {
  try {
    if (!connection.isConnected || !connection.tokens?.access_token) {
      return false;
    }
    
    if (!isInstagramConfigured()) {
      // In demo mode, consider connection valid
      return true;
    }
    
    // Try to make a simple API call to validate token
    const response = await fetch(
      `${INSTAGRAM_CONFIG.API_BASE}/me?fields=id&access_token=${connection.tokens.access_token}`
    );
    
    return response.ok;
  } catch (error) {
    console.error('Connection validation error:', error);
    return false;
  }
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Get current Instagram connection status
 */
export const getInstagramConnection = async (): Promise<InstagramConnection | null> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return null; // No user logged in
    }
    return currentUser.instagramConnection || null;
  } catch (error) {
    // Silently handle authentication errors - expected when no user is logged in
    return null;
  }
};

/**
 * Check if Instagram is properly configured
 */
export const checkInstagramConfiguration = (): {
  isConfigured: boolean;
  missingFields: string[];
} => {
  const missingFields: string[] = [];
  
  if (INSTAGRAM_CONFIG.CLIENT_ID === 'YOUR_INSTAGRAM_CLIENT_ID') {
    missingFields.push('CLIENT_ID');
  }
  
  if (INSTAGRAM_CONFIG.CLIENT_SECRET === 'YOUR_INSTAGRAM_CLIENT_SECRET') {
    missingFields.push('CLIENT_SECRET');
  }
  
  if (INSTAGRAM_CONFIG.REDIRECT_URI === 'YOUR_DOMAIN/auth/instagram/callback') {
    missingFields.push('REDIRECT_URI');
  }
  
  return {
    isConfigured: missingFields.length === 0,
    missingFields
  };
};

/**
 * Get Instagram user's recent media
 */
export const getInstagramMedia = async (limit: number = 10): Promise<InstagramMedia[]> => {
  try {
    const currentUser = await getCurrentUser();
    const connection = currentUser?.instagramConnection;
    
    if (!connection?.isConnected || !connection.tokens?.access_token) {
      return [];
    }
    
    if (!isInstagramConfigured()) {
      // Return mock data in demo mode
      return [];
    }
    
    const response = await fetch(
      `${INSTAGRAM_CONFIG.API_BASE}/me/media?fields=id,media_type,media_url,thumbnail_url,caption,permalink,timestamp&limit=${limit}&access_token=${connection.tokens.access_token}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to get Instagram media');
    }
    
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Get Instagram media error:', error);
    return [];
  }
};

// Export configuration status
export { isInstagramConfigured };