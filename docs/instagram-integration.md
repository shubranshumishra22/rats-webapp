# Instagram Integration Documentation

## Overview

The Instagram integration in RATS allows users to connect their Instagram accounts and post event messages directly to Instagram. This integration uses the Instagram Graph API and OAuth for secure authentication.

## Features

- **OAuth Authentication**: Secure connection to Instagram without storing passwords
- **Message Formatting**: Automatic formatting of messages to meet Instagram's requirements
- **Post Publishing**: Direct posting to Instagram from the RATS platform
- **Scheduled Posts**: Schedule posts for future publication
- **Engagement Metrics**: Track likes, comments, shares, and impressions

## Implementation Details

### Authentication Flow

1. **Authorization Request**: User initiates the connection process from the Social Accounts settings page
2. **OAuth Redirect**: User is redirected to Instagram's authorization page
3. **Permission Grant**: User grants RATS permission to post on their behalf
4. **Code Exchange**: Instagram returns an authorization code to our callback endpoint
5. **Token Exchange**: Server exchanges the code for a short-lived access token
6. **Long-lived Token**: Server exchanges the short-lived token for a long-lived token (valid for 60 days)
7. **Token Storage**: The token is securely stored in the user's profile

### Posting Process

1. **Message Preparation**: AI-generated message is formatted for Instagram
2. **Media Handling**: For Instagram posts, an image is required (future implementation)
3. **API Call**: Server makes a POST request to the Instagram Graph API
4. **Response Handling**: Server processes the API response and stores the post ID
5. **Metrics Collection**: Server periodically fetches engagement metrics for published posts

### Data Models

#### User Model Extensions
```typescript
socialMediaAuth: {
  instagram: {
    userId: { type: String },
    accessToken: { type: String },
    tokenExpiry: { type: Date }
  }
}
```

#### Social Media Post Model
```typescript
{
  user: ObjectId,
  event: ObjectId,
  platform: 'instagram',
  content: String,
  imageUrl: String,
  platformPostId: String,
  status: 'draft' | 'scheduled' | 'published' | 'failed',
  scheduledFor: Date,
  publishedAt: Date,
  metrics: {
    likes: Number,
    comments: Number,
    shares: Number,
    impressions: Number
  }
}
```

## API Endpoints

### Authentication
- `GET /api/social-auth/instagram/auth-url`: Get Instagram authorization URL
- `GET /api/social-auth/instagram/callback`: Handle Instagram OAuth callback
- `DELETE /api/social-auth/instagram/disconnect`: Disconnect Instagram account

### Posting
- `POST /api/events/:id/test-message`: Test post to Instagram
- `POST /api/social-media/post`: Create a new post (future implementation)
- `POST /api/social-media/schedule`: Schedule a post (future implementation)
- `GET /api/social-media/posts`: Get all posts (future implementation)
- `GET /api/social-media/posts/:id/metrics`: Get post metrics (future implementation)

## Setup Instructions

1. **Create Instagram Developer Account**:
   - Go to [developers.facebook.com](https://developers.facebook.com/)
   - Create a new app with Instagram API
   - Configure the app settings and permissions

2. **Configure Environment Variables**:
   ```
   INSTAGRAM_CLIENT_ID=your_instagram_client_id
   INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret
   INSTAGRAM_REDIRECT_URI=http://localhost:5001/api/social-auth/instagram/callback
   ```

3. **Test the Integration**:
   - Connect your Instagram account in the settings
   - Create an event with an AI-generated message
   - Use the "Test" button to post to Instagram

## Limitations and Future Improvements

1. **Image Requirement**: Instagram requires an image for posts. Future implementation will include image generation or selection.
2. **Token Refresh**: Implement automatic refresh of long-lived tokens before they expire.
3. **Rate Limiting**: Add handling for Instagram API rate limits.
4. **Error Handling**: Enhance error handling for various API failure scenarios.
5. **Analytics Dashboard**: Create a dedicated dashboard for social media post analytics.

## Troubleshooting

### Common Issues

1. **Authentication Failures**:
   - Check that your Instagram app is properly configured
   - Verify redirect URI matches exactly
   - Ensure the app has the required permissions

2. **Posting Failures**:
   - Instagram requires an image for posts
   - Caption length must be under 2,200 characters
   - Rate limits may be exceeded

3. **Token Expiration**:
   - Long-lived tokens expire after 60 days
   - Users will need to reconnect if tokens expire