# Unsplash API Setup Guide

This application includes comprehensive Unsplash integration for accessing millions of high-quality images. Currently running in **demo mode** with curated sample images.

## Current Status: Demo Mode ✨

The app works perfectly with a curated collection of sample images including:
- Social media & marketing images
- Lifestyle & coffee photography  
- Nature & landscape photos
- Food & business imagery
- Fashion & technology shots

All features work including search, random images, and auto-fetch functionality.

## Enable Full Unsplash API Access:

### 1. Create Unsplash Developer Account

1. Visit [Unsplash Developers](https://unsplash.com/developers)
2. Sign up or log in to your Unsplash account
3. Click **"New Application"**
4. Fill out the application form:
   - **Application name**: Your app name (e.g., "Instagram Scheduler")
   - **Description**: Brief description of your app
   - **Website**: Your website or GitHub repo URL
   - Accept the API Terms

### 2. Get Your API Access Key

1. Once approved, go to your application dashboard
2. Copy the **"Access Key"** (starts with something like `abc123xyz...`)
3. Keep this key secure - don't share it publicly

### 3. Configure the Application

Edit `/components/UnsplashService.tsx` and replace:

```javascript
const UNSPLASH_ACCESS_KEY = 'YOUR_UNSPLASH_ACCESS_KEY';
```

With your actual key:

```javascript
const UNSPLASH_ACCESS_KEY = 'your-actual-access-key-here';
```

### 4. API Rate Limits

**Development (Demo)**: 50 requests per hour
**Production**: Up to 5,000 requests per hour

The app automatically handles rate limiting with user-friendly error messages.

## Features Available:

### 🔍 **Search Images**
- Search millions of photos by keyword
- Filters by orientation (landscape, portrait, square)
- Pagination support
- Relevance-based results

### 🎲 **Random Images**  
- Get random high-quality photos
- Filter by keywords
- Perfect for inspiration

### 🤖 **Auto-Fetch**
- AI-powered image suggestions based on post content
- Automatic keyword extraction from captions and hashtags
- One-click perfect image selection

### 📸 **Image Management**
- High-resolution image URLs
- Proper photographer attribution
- Download tracking (required by Unsplash)
- Thumbnail previews

## Code Examples:

### Search for Images
```javascript
import { searchImages } from './components/UnsplashService';

const results = await searchImages('coffee lifestyle', 1, 20);
console.log(`Found ${results.total} images`);
```

### Get Random Image for Content
```javascript
import { getRandomImageForKeyword } from './components/UnsplashService';

const image = await getRandomImageForKeyword('business');
console.log(`Image URL: ${image.url}`);
```

### Auto-Fetch Based on Keywords
```javascript
const keywords = ['travel', 'adventure', 'nature'];
const image = await getRandomImageForKeyword(keywords[0]);
```

## Error Handling:

The app includes comprehensive error handling for:

- **Rate Limiting**: Friendly messages with retry timing
- **Network Issues**: Graceful fallbacks to demo images  
- **Invalid Keywords**: Automatic fallback suggestions
- **API Downtime**: Seamless demo mode operation

## Attribution Requirements:

When using Unsplash images, the app automatically:
- Tracks image downloads (required by Unsplash API)
- Shows photographer attribution in the UI
- Includes proper attribution in exported content
- Links back to photographer profiles

## Production Considerations:

### Security
- Never expose your API key in client-side code
- Consider using environment variables
- Implement server-side proxy for production

### Performance  
- Implement image caching
- Use CDN for better performance
- Optimize image sizes for different use cases

### Compliance
- Follow Unsplash API guidelines
- Include proper attribution
- Respect rate limits

## Troubleshooting:

### "Rate limit exceeded"
- Wait for the specified time before retrying
- Consider upgrading to higher rate limits
- Implement request queuing

### "Invalid API key"
- Check your API key is correct
- Ensure no extra spaces or characters
- Verify your application is approved

### "No images found"
- Try broader search terms
- Check for typos in keywords
- Use suggested alternative keywords

## Demo vs Production:

| Feature | Demo Mode | Production Mode |
|---------|-----------|------------------|
| Image Count | 8 curated images | 3+ million images |
| Search | Basic filtering | Full-text search |
| Rate Limits | None | 50-5,000/hour |
| Attribution | Not required | Required |
| Quality | High | Professional |

The demo mode is perfect for development, testing, and understanding the app flow before connecting to the full API.

## Need Help?

- Check the browser console for detailed error messages
- Review the [Unsplash API Documentation](https://unsplash.com/documentation)
- All API functions include comprehensive error handling and logging