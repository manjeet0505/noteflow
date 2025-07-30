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