# Notes App

A full-stack notes application built with Next.js, MongoDB, and Tailwind CSS.

## Features

- ✅ **User Authentication**
  - Email/Password signup and login
  - Google OAuth integration
  - JWT token-based authentication
  - Protected routes and API endpoints

- ✅ **Notes Management**
  - Create, read, and delete notes
  - Real-time updates
  - User-specific notes
  - Responsive design

- ✅ **Modern UI/UX**
  - Clean, modern interface with Tailwind CSS
  - Responsive design for all devices
  - Loading states and error handling
  - Beautiful animations and transitions

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB, Mongoose
- **Authentication**: JWT, bcryptjs, Google OAuth
- **Database**: MongoDB Atlas
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB Atlas account
- Google Cloud Console account (for OAuth)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd notes-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=your-mongodb-connection-string
   JWT_SECRET=your-super-secret-jwt-key
   
   # Google OAuth Configuration
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_ID=your-google-client-id
   ```

4. **Set up Google OAuth** (Optional but recommended)
   
   Follow the detailed guide in [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   └── notes/         # Notes CRUD endpoints
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   ├── dashboard/         # Dashboard page
│   └── page.js            # Home page
├── components/            # React components
│   ├── Navigation.js      # Navigation bar
│   ├── NoteForm.js        # Note creation form
│   ├── NoteCard.js        # Individual note display
│   └── GoogleLogin.js     # Google OAuth component
├── contexts/              # React contexts
│   └── AuthContext.js     # Authentication state management
├── lib/                   # Utility libraries
│   ├── api.js            # API client functions
│   ├── auth.js           # Authentication middleware
│   ├── db.js             # Database connection
│   └── jwt.js            # JWT utilities
└── models/               # Database models
    ├── User.js           # User model
    └── Note.js           # Note model
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth authentication

### Notes
- `GET /api/notes` - Get all user notes
- `POST /api/notes` - Create a new note
- `DELETE /api/notes/:id` - Delete a note

## Authentication Flow

1. **Email/Password Authentication**
   - User signs up with email and password
   - Password is hashed using bcrypt
   - JWT token is generated and stored in localStorage

2. **Google OAuth Authentication**
   - User clicks "Continue with Google"
   - Google OAuth flow is initiated
   - User info is verified with Google
   - JWT token is generated and stored

3. **Protected Routes**
   - All notes API endpoints require authentication
   - JWT token is verified on each request
   - Unauthorized requests are redirected to login

## Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (optional for Google OAuth),
  googleId: String (unique, for Google OAuth),
  googleEmail: String,
  avatar: String,
  authMethod: String (enum: ['email', 'google']),
  createdAt: Date,
  updatedAt: Date
}
```

### Note Model
```javascript
{
  title: String,
  content: String,
  userId: ObjectId (reference to User),
  createdAt: Date,
  updatedAt: Date
}
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to set these in your production environment:
- `MONGODB_URI`
- `JWT_SECRET`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_ID`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

If you encounter any issues:
1. Check the [Google OAuth Setup Guide](./GOOGLE_OAUTH_SETUP.md)
2. Verify your environment variables
3. Check the browser console for errors
4. Review the server logs for debugging information 