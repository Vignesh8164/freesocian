# Appwrite Setup Instructions

This application is configured to work with Appwrite as the backend service. Currently, it's running in **mock mode** using local storage.

## Current Status: Mock Mode ✨

The app is fully functional using local browser storage for development and testing. All features work including:
- User authentication (sign up/login) 
- Post creation and management
- File uploads (converted to base64)
- User profiles
- All subscription features

## To Enable Appwrite Backend:

### 1. Create an Appwrite Project

1. Go to [Appwrite Cloud](https://cloud.appwrite.io) or set up self-hosted Appwrite
2. Create a new project
3. Note down your:
   - **Endpoint URL** (e.g., `https://cloud.appwrite.io/v1`)
   - **Project ID** (e.g., `your-project-id`)

### 2. Set Up Database

1. Create a new database in your Appwrite project
2. Note down the **Database ID**
3. Create two collections:
   - **users** (for user profiles)
   - **posts** (for post data)

#### Users Collection Attributes:
- `name` (string, required)
- `email` (string, required) 
- `avatar` (string, optional)
- `createdAt` (string, required)
- `subscription` (string, required) - JSON object

#### Posts Collection Attributes:
- `userId` (string, required)
- `content` (string, required)
- `image` (string, optional)
- `hashtags` (string, required) - JSON array
- `scheduledFor` (string, required)
- `status` (string, required)
- `platform` (string, required)
- `createdAt` (string, required)
- `updatedAt` (string, required)
- `engagement` (string, optional) - JSON object

### 3. Create Storage Bucket

1. Go to Storage in your Appwrite console
2. Create a bucket named `media`
3. Configure permissions as needed

### 4. Update Configuration

Edit `/components/AppwriteService.tsx` and replace the placeholder values:

```javascript
const APPWRITE_ENDPOINT = 'https://your-actual-endpoint.com/v1';
const APPWRITE_PROJECT_ID = 'your-actual-project-id';
const DATABASE_ID = 'your-actual-database-id';
```

### 5. Initialize Database (Optional)

Uncomment this line in `/App.tsx` to clear demo data on first run:

```javascript
await initializeDatabase();
```

## Development Mode

The current mock mode is perfect for:
- Development and testing
- Demos and prototyping  
- Local development without backend setup
- Understanding the application flow

## Production Deployment

For production, you'll want to:
1. Set up proper Appwrite configuration
2. Configure authentication providers
3. Set up proper database permissions
4. Configure storage permissions
5. Set up webhooks for payment processing

## Need Help?

The application includes detailed console logs to help debug any Appwrite connection issues. Check the browser console for more information.