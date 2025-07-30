import './globals.css'
import Navigation from '../components/Navigation'
import { AuthProvider } from '../contexts/AuthContext'
import { GoogleOAuthProvider } from '@react-oauth/google'

export const metadata = {
  title: 'Notes App',
  description: 'A simple notes application',
}

export default function RootLayout({ children }) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        {/* Uncomment below if you add PNG fallbacks in the future */}
        {/* <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" /> */}
        {/* <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" /> */}
        {/* <link rel="apple-touch-icon" href="/favicon-32x32.png" /> */}
      </head>
      <body className="min-h-screen bg-gray-50">
        <GoogleOAuthProvider clientId={googleClientId}>
          <AuthProvider>
            <Navigation />
            {children}
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  )
} 