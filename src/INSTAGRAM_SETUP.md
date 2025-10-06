# Instagram API Setup Guide

This application includes complete Instagram API integration with OAuth 2.0 flow for publishing posts directly to Instagram. Currently running in **demo mode** with simulated functionality.

## Current Status: Demo Mode ✨

The app works perfectly in demo mode with:
- Simulated Instagram OAuth connection flow
- Mock post publishing with success feedback
- All UI interactions and error handling
- User authentication requirements enforced

All features work including connect/disconnect and post creation workflows.

## Enable Real Instagram API Integration:

### 1. Create Facebook Developer Account & App

1. Visit [Facebook Developers](https://developers.facebook.com/)
2. Sign up or log in to your Facebook account
3. Click **"Create App"** → **"Other"** → **"Business"**
4. Fill out the app details:
   - **App Name**: Your app name (e.g., "Instagram Scheduler")
   - **Contact Email**: Your email address
   - **App Purpose**: Business or other appropriate purpose

### 2. Add Instagram Basic Display Product

1. In your app dashboard, click **"Add Product"**
2. Find **"Instagram Basic Display"** and click **"Set Up"**
3. This enables your app to access Instagram user data and publish content

### 3. Configure OAuth Settings

1. Go to **Instagram Basic Display** → **Basic Display**
2. Click **"Create New App"** under Instagram App ID
3. Fill out the Instagram app details:
   - **Display Name**: User-facing name for your app
   - **Namespace**: Unique identifier (optional)
   - **Website**: Your website URL

### 4. Get Your Credentials

1. In the Instagram Basic Display settings, you'll see:
   - **Instagram App ID** (This is your CLIENT_ID)
   - **Instagram App Secret** (This is your CLIENT_SECRET)
2. Copy these values - you'll need them in step 6

### 5. Configure OAuth Redirect URIs

1. Still in Instagram Basic Display settings
2. Find **"OAuth Redirect URIs"** section
3. Add your redirect URI(s):
   - **Development**: `http://localhost:3000/auth/instagram/callback`
   - **Production**: `https://yourdomain.com/auth/instagram/callback`
4. Click **"Save Changes"**

### 6. Update Application Configuration

Edit `/components/InstagramApiService.tsx` and replace the placeholders:

```javascript
const INSTAGRAM_CONFIG = {
  // Replace with your Instagram App ID from step 4
  CLIENT_ID: 'your-instagram-app-id-here',
  
  // Replace with your Instagram App Secret from step 4  
  CLIENT_SECRET: 'your-instagram-app-secret-here',
  
  // Replace with your actual redirect URI from step 5
  REDIRECT_URI: 'https://yourdomain.com/auth/instagram/callback',
  
  // ... rest of config stays the same
};
```

### 7. Set Up OAuth Callback Handler

Create a callback handler at your redirect URI endpoint. Here's an example:

```html
<!-- At /auth/instagram/callback -->
<!DOCTYPE html>
<html>
<head>
    <title>Instagram Authorization</title>
</head>
<body>
    <script>
        // Extract authorization code or error from URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        const state = urlParams.get('state');
        
        // Send result back to parent window
        if (code) {
            window.opener.postMessage({
                type: 'INSTAGRAM_AUTH_SUCCESS',
                code: code,
                state: state
            }, window.location.origin);
        } else {
            window.opener.postMessage({
                type: 'INSTAGRAM_AUTH_ERROR',
                error: error || 'Authorization failed'
            }, window.location.origin);
        }
        
        // Close popup
        window.close();
    </script>
</body>
</html>
```

### 8. Test the Integration

1. Start your application
2. Log in with a real user account
3. Go to Settings → Connect Instagram
4. Complete the OAuth flow
5. Try creating and publishing a post

## API Capabilities:

### 🔐 **OAuth 2.0 Flow**
- Secure authorization with state parameter validation
- Popup-based OAuth for better UX
- Automatic token refresh handling
- Proper token revocation on disconnect

### 📱 **Instagram Integration**
- Connect/disconnect Instagram accounts
- Real-time connection status
- User profile information sync
- Token expiration management

### 📝 **Post Publishing**
- Direct post creation to Instagram
- Image upload and publishing
- Caption and hashtag support
- Real-time publishing status

### 🔒 **Security Features**
- Only authenticated users can connect
- Secure token storage via Appwrite
- State parameter CSRF protection
- Automatic test data cleanup

## Production Considerations:

### Security Best Practices
```javascript
// Never expose secrets in client-side code
// Use environment variables in production:
const INSTAGRAM_CONFIG = {
  CLIENT_ID: process.env.INSTAGRAM_CLIENT_ID,
  CLIENT_SECRET: process.env.INSTAGRAM_CLIENT_SECRET,
  REDIRECT_URI: process.env.INSTAGRAM_REDIRECT_URI,
};
```

### Rate Limiting
- Instagram Basic Display API: 200 requests per hour per user
- Handle rate limit errors gracefully
- Implement exponential backoff for retries

### Error Handling
The app includes comprehensive error handling for:
- **OAuth Errors**: Invalid credentials, user denial
- **API Errors**: Rate limits, network issues
- **Token Errors**: Expired or invalid tokens
- **Validation Errors**: Missing data, invalid formats

### User Requirements
- Users must be authenticated in your app
- Users must have an Instagram account
- Users must authorize the connection via OAuth
- All test/demo accounts are cleared on initialization

## API Endpoints Used:

### OAuth Flow
- `GET https://api.instagram.com/oauth/authorize` - Authorization
- `POST https://api.instagram.com/oauth/access_token` - Token exchange

### User Data
- `GET https://graph.instagram.com/me` - User profile
- `GET https://graph.instagram.com/me/media` - User media

### Publishing
- `POST https://graph.instagram.com/me/media` - Create media
- `POST https://graph.instagram.com/me/media_publish` - Publish media

### Token Management
- `GET https://graph.instagram.com/refresh_access_token` - Refresh token

## Troubleshooting:

### "Invalid Client ID"
- Check your Instagram App ID is correct
- Ensure the app is properly configured in Facebook Developers
- Verify you're using the Instagram Basic Display App ID

### "Redirect URI Mismatch"
- Ensure redirect URI exactly matches what's configured
- Check for trailing slashes and protocol (http vs https)
- Make sure the URI is added to your Instagram app settings

### "User Denied Authorization"
- Normal user behavior - handle gracefully
- Show clear instructions about why Instagram access is needed
- Allow users to retry the connection

### "Token Expired"
- Implement automatic token refresh
- Handle refresh failures by prompting re-authentication
- Long-lived tokens last ~60 days

### "Publishing Failed"
- Check image URL is accessible and valid
- Ensure image meets Instagram requirements (aspect ratio, size)
- Verify user has a valid Instagram account

## Demo vs Production:

| Feature | Demo Mode | Production Mode |
|---------|-----------|------------------|
| OAuth Flow | Simulated | Real Instagram OAuth |
| User Data | Mock profiles | Real Instagram data |
| Post Publishing | Simulated success | Real Instagram posts |
| Token Management | Local simulation | Instagram API tokens |
| Rate Limits | None | Instagram API limits |
| Error Handling | Simulated errors | Real API errors |

The demo mode is perfect for development, testing UI flows, and understanding the integration before connecting to the real Instagram API.

## Need Help?

- Check the browser console for detailed error messages
- Review the [Instagram Basic Display API Documentation](https://developers.facebook.com/docs/instagram-basic-display-api)
- Ensure your Facebook Developer account is in good standing
- Test with a personal Instagram account first
- All API functions include comprehensive error handling and logging