# 🚀 Instagram Auto-Post App - API Configuration Guide

This application integrates multiple services to provide a complete Instagram auto-posting experience. Below are all the API keys and configuration settings you need to enable full functionality.

## 📋 Quick Configuration Checklist

- [ ] **Appwrite Backend** - User authentication & data storage
- [ ] **Unsplash API** - Image search and selection
- [ ] **Instagram API** - Post publishing to Instagram
- [ ] **Payment Gateway** - Subscription management (simulated)

## 🔑 API Keys & Configuration

### 1. Appwrite Backend Configuration
**File:** `/components/AppwriteService.tsx` (Lines 8-13)

```javascript
// Replace these placeholder values with your actual Appwrite project details
const APPWRITE_ENDPOINT = 'https://your-appwrite-endpoint.com/v1'; // Your Appwrite endpoint
const APPWRITE_PROJECT_ID = 'your-project-id'; // Your actual project ID
const DATABASE_ID = 'your-database-id'; // Your database ID
const USERS_COLLECTION_ID = 'users'; // Collection for user profiles
const POSTS_COLLECTION_ID = 'posts'; // Collection for posts
const STORAGE_BUCKET_ID = 'media'; // Storage bucket for files
```

**Setup Guide:** See [APPWRITE_SETUP.md](/APPWRITE_SETUP.md)

---

### 2. Unsplash API Configuration
**File:** `/components/UnsplashService.tsx` (Line 10)

```javascript
// Replace this placeholder with your actual Unsplash API Access Key
const UNSPLASH_ACCESS_KEY = 'YOUR_UNSPLASH_ACCESS_KEY'; // Get from https://unsplash.com/developers
```

**Setup Guide:** See [UNSPLASH_SETUP.md](/UNSPLASH_SETUP.md)

---

### 3. Instagram API Configuration
**File:** `/components/InstagramApiService.tsx` (Lines 25-33)

```javascript
const INSTAGRAM_CONFIG = {
  // Replace with your actual Instagram Client ID from Facebook Developers
  CLIENT_ID: 'YOUR_INSTAGRAM_CLIENT_ID', // e.g., '1234567890123456'
  
  // Replace with your actual Instagram Client Secret from Facebook Developers  
  CLIENT_SECRET: 'YOUR_INSTAGRAM_CLIENT_SECRET', // e.g., 'abcdef1234567890abcdef1234567890'
  
  // Replace with your actual redirect URI (must be registered in Facebook Developers)
  REDIRECT_URI: 'YOUR_DOMAIN/auth/instagram/callback', // e.g., 'https://yourdomain.com/auth/instagram/callback'
  
  // Other settings (no changes needed)
  AUTH_URL: 'https://api.instagram.com/oauth/authorize',
  TOKEN_URL: 'https://api.instagram.com/oauth/access_token',
  API_BASE: 'https://graph.instagram.com',
  SCOPES: 'user_profile,user_media',
  REFRESH_URL: 'https://graph.instagram.com/refresh_access_token'
};
```

**Setup Guide:** See [INSTAGRAM_SETUP.md](/INSTAGRAM_SETUP.md)

---

## 🔄 Current Status: Demo Mode

**The application is currently running in full demo mode and is completely functional with:**

✅ **Working Features (Demo Mode):**
- Complete user authentication (signup/login)
- Full post composer with image upload
- Unsplash image integration with curated sample images
- Instagram connection simulation (OAuth flow simulation)
- Post scheduling and management
- Subscription and payment system (local storage)
- Responsive design and all UI interactions

✅ **What Works Without API Setup:**
- User registration and authentication (localStorage)
- Post creation and scheduling (localStorage)
- Image uploads (base64 conversion)
- Subscription management (localStorage)
- All UI components and workflows

---

## 🎯 Production Deployment Steps

### Step 1: Enable Appwrite (Recommended First)
1. Set up Appwrite project and database
2. Update `APPWRITE_ENDPOINT`, `APPWRITE_PROJECT_ID`, `DATABASE_ID`
3. User data will now persist across sessions

### Step 2: Enable Unsplash API
1. Get API key from Unsplash Developers
2. Update `UNSPLASH_ACCESS_KEY`
3. Access to 3+ million professional images

### Step 3: Enable Instagram API
1. Set up Facebook Developer app with Instagram Basic Display
2. Update `CLIENT_ID`, `CLIENT_SECRET`, `REDIRECT_URI`
3. Real Instagram posting functionality

### Step 4: Test All Integrations
1. Sign up a new user account
2. Connect Instagram account
3. Search and select Unsplash images
4. Create and publish posts
5. Test subscription flows

---

## 🛡️ Security Best Practices

### Production Environment Variables
Never expose API secrets in client-side code. Use environment variables:

```javascript
// Production configuration example
const APPWRITE_ENDPOINT = process.env.REACT_APP_APPWRITE_ENDPOINT;
const APPWRITE_PROJECT_ID = process.env.REACT_APP_APPWRITE_PROJECT_ID;
const UNSPLASH_ACCESS_KEY = process.env.REACT_APP_UNSPLASH_ACCESS_KEY;
const INSTAGRAM_CLIENT_ID = process.env.REACT_APP_INSTAGRAM_CLIENT_ID;
```

### Client-Side Considerations
- Instagram Client Secret should be handled server-side in production
- Implement proper CORS settings
- Use HTTPS for all API endpoints
- Validate all user inputs

---

## 📊 API Rate Limits & Costs

| Service | Free Tier | Rate Limits | Production Cost |
|---------|-----------|-------------|-----------------|
| **Appwrite** | 75k API calls/month | No strict limits | $15-50/month |
| **Unsplash** | 50 requests/hour | 5,000 requests/hour (production) | Free |
| **Instagram** | Basic usage | 200 requests/hour/user | Free |

---

## 🔧 Troubleshooting Quick Fixes

### App Won't Load
- Check browser console for errors
- Ensure all placeholder values are replaced
- Try clearing localStorage and cookies

### Authentication Issues
- Verify Appwrite project settings
- Check endpoint URLs are correct
- Ensure collections and database exist

### Image Loading Problems
- Verify Unsplash API key is valid
- Check API key permissions
- Ensure no network blocking

### Instagram Connection Fails
- Verify Facebook Developer app setup
- Check redirect URI matches exactly
- Ensure Instagram Basic Display is enabled

---

## 📱 Demo Mode vs Production

| Feature | Demo Mode | Production Mode |
|---------|-----------|-----------------|
| **User Auth** | localStorage | Appwrite Database |
| **Data Storage** | Browser Storage | Cloud Database |
| **Images** | 8 curated samples | 3M+ professional images |
| **Instagram** | Simulated posting | Real Instagram posts |
| **Payments** | Mock processing | Real payment gateway |
| **Persistence** | Session-based | Permanent storage |

---

## 🚀 Ready for Production?

Once you've configured all APIs:

1. **Test locally** with real API keys
2. **Deploy to staging** environment
3. **Set up environment variables**
4. **Configure domain and SSL**
5. **Test all user flows**
6. **Launch to production**

---

## 📞 Need Help?

- All configuration files include detailed comments
- Check setup documentation files for step-by-step guides
- Browser console logs provide detailed error information
- Each service includes fallback error handling

**The app is designed to work perfectly in demo mode for development and testing, then seamlessly transition to production with real API integrations.**