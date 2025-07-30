# Google OAuth Setup Guide

## 🚨 Important: Follow these steps carefully to avoid "Authorization access blocked" errors!

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API and Google OAuth2 API

### Step 2: Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Choose **External** user type
3. Fill in the required information:
   - App name: "Notes App"
   - User support email: Your email
   - Developer contact information: Your email
4. Add scopes:
   - `openid`
   - `email`
   - `profile`
5. Add test users (your email addresses) if in testing mode

### Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client IDs**
3. Choose **Web application**
4. Set the following:
   - **Name**: "Notes App Web Client"
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
     - `http://localhost:3001` (if using different port)
   - **Authorized redirect URIs**:
     - `http://localhost:3000`
     - `http://localhost:3000/login`
     - `http://localhost:3000/signup`

### Step 4: Update Environment Variables

Add these to your `.env.local` file:

```env
# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_ID=your-google-client-id-here
```

Replace `your-google-client-id-here` with the actual Client ID from Step 3.

### Step 5: Common Issues & Solutions

#### Issue: "Authorization access blocked"
**Solution:**
1. Make sure you're using the correct Client ID
2. Verify the authorized origins include `http://localhost:3000`
3. Add your email as a test user in OAuth consent screen
4. Wait 5-10 minutes after making changes

#### Issue: "Invalid token"
**Solution:**
1. Ensure both `NEXT_PUBLIC_GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_ID` are set
2. Verify the Google+ API is enabled
3. Check that the OAuth consent screen is properly configured

#### Issue: "Redirect URI mismatch"
**Solution:**
1. Add all necessary redirect URIs in Google Cloud Console
2. Include both `http://localhost:3000` and specific page URLs

### Step 6: Testing

1. Restart your development server: `npm run dev`
2. Go to `http://localhost:3000/login`
3. Click "Continue with Google"
4. You should be redirected to Google's consent screen
5. After authorization, you should be logged in

### Production Deployment

For production, update the authorized origins and redirect URIs in Google Cloud Console to include your production domain.

### Security Notes

- Never commit your `.env.local` file to version control
- Use different Client IDs for development and production
- Regularly rotate your JWT secret
- Monitor your Google Cloud Console for any suspicious activity 