import { Client, Account, Databases, Storage, ID, Query } from 'appwrite';

// ========================================
// APPWRITE CONFIGURATION
// ========================================
// TODO: Replace these placeholder values with your actual Appwrite project details
// For development without Appwrite, these placeholders will allow the app to work with local storage
const APPWRITE_ENDPOINT = 'https://your-appwrite-endpoint.com/v1'; // Replace with your Appwrite endpoint
const APPWRITE_PROJECT_ID = 'your-project-id'; // Replace with your actual project ID
const DATABASE_ID = 'your-database-id'; // Replace with your database ID
const USERS_COLLECTION_ID = 'users'; // Collection for user profiles
const POSTS_COLLECTION_ID = 'posts'; // Collection for posts
const SUPPORT_COLLECTION_ID = 'tickets'; // Collection for support tickets
const STORAGE_BUCKET_ID = 'media'; // Storage bucket for files

// Check if Appwrite is properly configured
const isAppwriteConfigured = () => {
  return APPWRITE_ENDPOINT !== 'https://your-appwrite-endpoint.com/v1' && 
         APPWRITE_PROJECT_ID !== 'your-project-id' &&
         !APPWRITE_ENDPOINT.includes('your-appwrite-endpoint') &&
         !APPWRITE_PROJECT_ID.includes('your-project-id');
};

// Initialize Appwrite Client only if properly configured
let client: Client | null = null;
let account: Account | null = null;
let databases: Databases | null = null;
let storage: Storage | null = null;

if (isAppwriteConfigured()) {
  client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);
  
  // Initialize Appwrite services
  account = new Account(client);
  databases = new Databases(client);
  storage = new Storage(client);
}

// Mock data storage for when Appwrite is not configured
const mockUsers = new Map<string, User>();
const mockPosts = new Map<string, Post>();
const mockSessions = new Map<string, string>(); // sessionId -> userId
let currentMockSession: string | null = null;

// ========================================
// TYPE DEFINITIONS
// ========================================
export interface User {
  $id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  instagramConnection?: {
    isConnected: boolean;
    user?: {
      id: string;
      username: string;
      account_type: 'PERSONAL' | 'BUSINESS';
      media_count: number;
    };
    tokens?: {
      access_token: string;
      token_type: 'bearer';
      expires_in?: number;
      refresh_token?: string;
      user_id: string;
    };
    connectedAt: string;
    lastRefresh?: string;
    error?: string;
  };
}

export interface SupportTicket {
  $id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  attachment_url?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupportTicketData {
  name: string;
  email: string;
  subject: string;
  message: string;
  attachment?: File;
}

export interface Post {
  $id: string;
  userId: string;
  content: string;
  image?: string;
  hashtags: string[];
  scheduledFor: string;
  status: 'scheduled' | 'published' | 'failed';
  platform: string;
  createdAt: string;
  updatedAt: string;
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
  };
}

export interface CreatePostData {
  content: string;
  image?: string;
  hashtags: string[];
  scheduledFor: string;
  platform: string;
}

export interface UpdatePostData {
  content?: string;
  image?: string;
  hashtags?: string[];
  scheduledFor?: string;
  status?: 'scheduled' | 'published' | 'failed';
}

// ========================================
// AUTHENTICATION FUNCTIONS
// ========================================

/**
 * Create a new user account
 */
export const createUser = async (email: string, password: string, name: string): Promise<User> => {
  try {
    if (isAppwriteConfigured() && account && databases) {
      // Create account in Appwrite Auth
      const newAccount = await account.create(ID.unique(), email, password, name);
      
      // Create user profile in database
      const userProfile = await databases.createDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        newAccount.$id,
        {
          name,
          email,
          createdAt: new Date().toISOString(),
          subscription: {
            plan: 'trial',
            isFirstTimeUser: true
          }
        }
      );

      // Create session
      await account.createEmailSession(email, password);

      return {
        $id: userProfile.$id,
        name: userProfile.name,
        email: userProfile.email,
        avatar: userProfile.avatar,
        createdAt: userProfile.createdAt,
        subscription: userProfile.subscription
      };
    } else {
      // Mock implementation for development without Appwrite
      const userId = ID.unique();
      const user: User = {
        $id: userId,
        name,
        email,
        createdAt: new Date().toISOString(),
        subscription: {
          plan: 'trial',
          isFirstTimeUser: true
        }
      };
      
      // Store in mock storage
      mockUsers.set(userId, user);
      currentMockSession = ID.unique();
      mockSessions.set(currentMockSession, userId);
      
      // Store in localStorage for persistence
      localStorage.setItem('mockUser', JSON.stringify(user));
      localStorage.setItem('mockSession', currentMockSession);
      
      return user;
    }
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to create user');
  }
};

/**
 * Login user with email and password
 */
export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    if (isAppwriteConfigured() && account && databases) {
      // Create session
      await account.createEmailSession(email, password);
      
      // Get current user
      const currentUser = await account.get();
      
      // Get user profile from database
      const userProfile = await databases.getDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        currentUser.$id
      );

      return {
        $id: userProfile.$id,
        name: userProfile.name,
        email: userProfile.email,
        avatar: userProfile.avatar,
        createdAt: userProfile.createdAt,
        subscription: userProfile.subscription
      };
    } else {
      // Mock implementation for development
      // Only login if user actually exists in localStorage
      const mockUser = localStorage.getItem('mockUser');
      if (mockUser) {
        const user = JSON.parse(mockUser);
        // Verify credentials match (basic check for mock implementation)
        if (user.email === email) {
          currentMockSession = ID.unique();
          mockSessions.set(currentMockSession, user.$id);
          localStorage.setItem('mockSession', currentMockSession);
          return user;
        } else {
          throw new Error('Invalid credentials');
        }
      } else {
        // No user exists - require proper signup
        throw new Error('User not found. Please sign up first.');
      }
    }
  } catch (error) {
    console.error('Error logging in:', error);
    throw new Error(error instanceof Error ? error.message : 'Invalid credentials');
  }
};

/**
 * Logout current user
 */
export const logoutUser = async (): Promise<void> => {
  try {
    if (isAppwriteConfigured() && account) {
      await account.deleteSession('current');
    } else {
      // Mock implementation
      currentMockSession = null;
      localStorage.removeItem('mockSession');
      localStorage.removeItem('mockUser');
    }
  } catch (error) {
    console.error('Error logging out:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to logout');
  }
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    if (isAppwriteConfigured() && account && databases) {
      const currentUser = await account.get();
      
      // Get user profile from database
      const userProfile = await databases.getDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        currentUser.$id
      );

      return {
        $id: userProfile.$id,
        name: userProfile.name,
        email: userProfile.email,
        avatar: userProfile.avatar,
        createdAt: userProfile.createdAt,
        subscription: userProfile.subscription
      };
    } else {
      // Mock implementation
      const mockSession = localStorage.getItem('mockSession');
      const mockUser = localStorage.getItem('mockUser');
      
      if (mockSession && mockUser) {
        currentMockSession = mockSession;
        return JSON.parse(mockUser);
      }
      
      return null;
    }
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId: string, updates: Partial<User>): Promise<User> => {
  try {
    if (isAppwriteConfigured() && databases) {
      const updatedProfile = await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId,
        updates
      );

      return {
        $id: updatedProfile.$id,
        name: updatedProfile.name,
        email: updatedProfile.email,
        avatar: updatedProfile.avatar,
        createdAt: updatedProfile.createdAt,
        subscription: updatedProfile.subscription
      };
    } else {
      // Mock implementation
      const mockUser = localStorage.getItem('mockUser');
      if (mockUser) {
        const user = JSON.parse(mockUser);
        const updatedUser = { ...user, ...updates };
        localStorage.setItem('mockUser', JSON.stringify(updatedUser));
        return updatedUser;
      }
      throw new Error('User not found');
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to update profile');
  }
};

// ========================================
// POST MANAGEMENT FUNCTIONS
// ========================================

/**
 * Create a new post
 */
export const createPost = async (userId: string, postData: CreatePostData): Promise<Post> => {
  try {
    if (isAppwriteConfigured() && databases) {
      const newPost = await databases.createDocument(
        DATABASE_ID,
        POSTS_COLLECTION_ID,
        ID.unique(),
        {
          userId,
          content: postData.content,
          image: postData.image,
          hashtags: postData.hashtags,
          scheduledFor: postData.scheduledFor,
          status: 'scheduled',
          platform: postData.platform,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      );

      return {
        $id: newPost.$id,
        userId: newPost.userId,
        content: newPost.content,
        image: newPost.image,
        hashtags: newPost.hashtags,
        scheduledFor: newPost.scheduledFor,
        status: newPost.status,
        platform: newPost.platform,
        createdAt: newPost.createdAt,
        updatedAt: newPost.updatedAt,
        engagement: newPost.engagement
      };
    } else {
      // Mock implementation
      const postId = ID.unique();
      const post: Post = {
        $id: postId,
        userId,
        content: postData.content,
        image: postData.image,
        hashtags: postData.hashtags,
        scheduledFor: postData.scheduledFor,
        status: 'scheduled',
        platform: postData.platform,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Store in mock storage and localStorage
      mockPosts.set(postId, post);
      const userPosts = JSON.parse(localStorage.getItem(`mockPosts_${userId}`) || '[]');
      userPosts.unshift(post);
      localStorage.setItem(`mockPosts_${userId}`, JSON.stringify(userPosts));
      
      return post;
    }
  } catch (error) {
    console.error('Error creating post:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to create post');
  }
};

/**
 * Update an existing post
 */
export const updatePost = async (postId: string, updates: UpdatePostData): Promise<Post> => {
  try {
    if (isAppwriteConfigured() && databases) {
      const updatedPost = await databases.updateDocument(
        DATABASE_ID,
        POSTS_COLLECTION_ID,
        postId,
        {
          ...updates,
          updatedAt: new Date().toISOString()
        }
      );

      return {
        $id: updatedPost.$id,
        userId: updatedPost.userId,
        content: updatedPost.content,
        image: updatedPost.image,
        hashtags: updatedPost.hashtags,
        scheduledFor: updatedPost.scheduledFor,
        status: updatedPost.status,
        platform: updatedPost.platform,
        createdAt: updatedPost.createdAt,
        updatedAt: updatedPost.updatedAt,
        engagement: updatedPost.engagement
      };
    } else {
      // Mock implementation
      const user = JSON.parse(localStorage.getItem('mockUser') || '{}');
      const userPosts = JSON.parse(localStorage.getItem(`mockPosts_${user.$id}`) || '[]');
      
      const postIndex = userPosts.findIndex((p: Post) => p.$id === postId);
      if (postIndex === -1) {
        throw new Error('Post not found');
      }
      
      const updatedPost = {
        ...userPosts[postIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      userPosts[postIndex] = updatedPost;
      localStorage.setItem(`mockPosts_${user.$id}`, JSON.stringify(userPosts));
      
      return updatedPost;
    }
  } catch (error) {
    console.error('Error updating post:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to update post');
  }
};

/**
 * Delete a post
 */
export const deletePost = async (postId: string): Promise<void> => {
  try {
    if (isAppwriteConfigured() && databases) {
      await databases.deleteDocument(DATABASE_ID, POSTS_COLLECTION_ID, postId);
    } else {
      // Mock implementation
      const user = JSON.parse(localStorage.getItem('mockUser') || '{}');
      const userPosts = JSON.parse(localStorage.getItem(`mockPosts_${user.$id}`) || '[]');
      
      const filteredPosts = userPosts.filter((p: Post) => p.$id !== postId);
      localStorage.setItem(`mockPosts_${user.$id}`, JSON.stringify(filteredPosts));
    }
  } catch (error) {
    console.error('Error deleting post:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to delete post');
  }
};

/**
 * Fetch posts for a specific user
 */
export const fetchUserPosts = async (userId: string): Promise<Post[]> => {
  try {
    if (isAppwriteConfigured() && databases) {
      const response = await databases.listDocuments(
        DATABASE_ID,
        POSTS_COLLECTION_ID,
        [
          Query.equal('userId', userId),
          Query.orderDesc('createdAt'),
          Query.limit(100) // Limit to 100 posts
        ]
      );

      return response.documents.map(doc => ({
        $id: doc.$id,
        userId: doc.userId,
        content: doc.content,
        image: doc.image,
        hashtags: doc.hashtags,
        scheduledFor: doc.scheduledFor,
        status: doc.status,
        platform: doc.platform,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        engagement: doc.engagement
      }));
    } else {
      // Mock implementation
      const userPosts = JSON.parse(localStorage.getItem(`mockPosts_${userId}`) || '[]');
      return userPosts.sort((a: Post, b: Post) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
  } catch (error) {
    console.error('Error fetching user posts:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch posts');
  }
};

// ========================================
// FILE UPLOAD FUNCTIONS
// ========================================

/**
 * Upload a file to Appwrite Storage
 */
export const uploadFile = async (file: File): Promise<string> => {
  try {
    // Validate file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size must be less than 10MB');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Only JPEG, PNG, WebP, and GIF files are allowed');
    }

    if (isAppwriteConfigured() && storage) {
      const uploadedFile = await storage.createFile(
        STORAGE_BUCKET_ID,
        ID.unique(),
        file
      );

      // Return the file URL
      return getFileUrl(uploadedFile.$id);
    } else {
      // Mock implementation - convert file to base64 data URL
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to upload file');
  }
};

/**
 * Get file URL from storage
 */
export const getFileUrl = (fileId: string): string => {
  if (isAppwriteConfigured() && storage) {
    return storage.getFileView(STORAGE_BUCKET_ID, fileId).toString();
  } else {
    // For mock implementation, fileId is already a data URL
    return fileId;
  }
};

/**
 * Delete a file from storage
 */
export const deleteFile = async (fileId: string): Promise<void> => {
  try {
    if (isAppwriteConfigured() && storage) {
      await storage.deleteFile(STORAGE_BUCKET_ID, fileId);
    } else {
      // Mock implementation - nothing to delete for data URLs
      console.log('Mock: File deleted:', fileId);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to delete file');
  }
};

// ========================================
// INITIALIZATION & CLEANUP FUNCTIONS
// ========================================

/**
 * Initialize the database and clear demo data
 * Call this function when setting up the application for the first time
 */
export const initializeDatabase = async (): Promise<void> => {
  try {
    console.log('Initializing database and clearing demo data...');
    
    if (isAppwriteConfigured() && databases) {
      // Clear all existing posts (demo data)
      try {
        const allPosts = await databases.listDocuments(
          DATABASE_ID,
          POSTS_COLLECTION_ID,
          [Query.limit(1000)]
        );
        
        for (const post of allPosts.documents) {
          await databases.deleteDocument(DATABASE_ID, POSTS_COLLECTION_ID, post.$id);
        }
        console.log(`Cleared ${allPosts.documents.length} demo posts`);
      } catch (error) {
        console.log('No demo posts to clear or posts collection not found');
      }

      // Clear all demo users (optional - be careful with this in production)
      try {
        const allUsers = await databases.listDocuments(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          [Query.limit(1000)]
        );
        
        for (const user of allUsers.documents) {
          await databases.deleteDocument(DATABASE_ID, USERS_COLLECTION_ID, user.$id);
        }
        console.log(`Cleared ${allUsers.documents.length} demo users`);
      } catch (error) {
        console.log('No demo users to clear or users collection not found');
      }

      console.log('Database initialization complete. Ready for new signups!');
    } else {
      // Clear all mock/demo data from localStorage
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('mockPosts_') || 
            key === 'mockUser' || 
            key === 'mockSession' ||
            key === 'userSubscription' ||
            key.startsWith('instagram_') ||
            key.startsWith('demo_') ||
            key.startsWith('test_')) {
          localStorage.removeItem(key);
        }
      });
      
      // Clear in-memory mock data
      mockUsers.clear();
      mockPosts.clear();
      mockSessions.clear();
      currentMockSession = null;
      
      console.log('All mock/demo data cleared. App ready for fresh user onboarding!');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to initialize database');
  }
};

/**
 * Check if Appwrite is properly configured
 */
export const checkAppwriteConnection = async (): Promise<boolean> => {
  try {
    if (!isAppwriteConfigured()) {
      console.log('Appwrite not configured - using mock data');
      return true; // Return true to allow app to continue with mock data
    }

    if (account) {
      // Try to get account info (this will work even without authentication)
      await account.get();
      return true;
    }
    
    return false;
  } catch (error) {
    // If we get a 401, it means Appwrite is working but user is not authenticated
    if (error instanceof Error && error.message.includes('401')) {
      return true;
    }
    console.error('Appwrite connection failed:', error);
    return false;
  }
};

/**
 * Update user data
 */
export const updateUserData = async (userId: string, updates: Partial<User>): Promise<void> => {
  try {
    if (isAppwriteConfigured() && databases) {
      // Update user document in Appwrite
      await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId,
        updates
      );
    } else {
      // Mock implementation - update localStorage
      const mockUser = localStorage.getItem('mockUser');
      if (mockUser) {
        const user = JSON.parse(mockUser);
        const updatedUser = { ...user, ...updates };
        localStorage.setItem('mockUser', JSON.stringify(updatedUser));
      }
    }
  } catch (error) {
    console.error('Error updating user data:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to update user data');
  }
};

// ========================================
// SUPPORT TICKET FUNCTIONS
// ========================================

/**
 * Create a new support ticket
 */
export const createSupportTicket = async (ticketData: CreateSupportTicketData): Promise<SupportTicket> => {
  try {
    let attachmentUrl: string | undefined;

    // Upload attachment if provided
    if (ticketData.attachment) {
      if (isAppwriteConfigured() && storage) {
        // Validate file size (limit to 10MB)
        if (ticketData.attachment.size > 10 * 1024 * 1024) {
          throw new Error('File size must be less than 10MB');
        }

        // Upload file to Appwrite Storage
        const uploadedFile = await storage.createFile(
          STORAGE_BUCKET_ID,
          ID.unique(),
          ticketData.attachment
        );
        attachmentUrl = getFileUrl(uploadedFile.$id);
      } else {
        // Mock implementation - create a fake URL
        attachmentUrl = `mock://attachment/${ticketData.attachment.name}`;
      }
    }

    const ticketId = ID.unique();
    const now = new Date().toISOString();

    const ticket: SupportTicket = {
      $id: ticketId,
      name: ticketData.name,
      email: ticketData.email,
      subject: ticketData.subject,
      message: ticketData.message,
      status: 'open',
      attachment_url: attachmentUrl,
      createdAt: now,
      updatedAt: now
    };

    if (isAppwriteConfigured() && databases) {
      // Create support ticket document in Appwrite
      const createdTicket = await databases.createDocument(
        DATABASE_ID,
        SUPPORT_COLLECTION_ID,
        ticketId,
        {
          name: ticket.name,
          email: ticket.email,
          subject: ticket.subject,
          message: ticket.message,
          status: ticket.status,
          attachment_url: ticket.attachment_url,
          createdAt: ticket.createdAt,
          updatedAt: ticket.updatedAt
        }
      );

      return {
        $id: createdTicket.$id,
        name: createdTicket.name,
        email: createdTicket.email,
        subject: createdTicket.subject,
        message: createdTicket.message,
        status: createdTicket.status,
        attachment_url: createdTicket.attachment_url,
        createdAt: createdTicket.createdAt,
        updatedAt: createdTicket.updatedAt
      };
    } else {
      // Mock implementation - store in localStorage
      const mockTickets = JSON.parse(localStorage.getItem('mockSupportTickets') || '[]');
      mockTickets.push(ticket);
      localStorage.setItem('mockSupportTickets', JSON.stringify(mockTickets));
      
      console.log('Mock support ticket created:', ticket);
      return ticket;
    }
  } catch (error) {
    console.error('Error creating support ticket:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to create support ticket');
  }
};

// Export configuration status and services
export { isAppwriteConfigured };

// Export the client and services for advanced usage (may be null if not configured)
export { client, account, databases, storage };