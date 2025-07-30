'use client'

import { useGoogleLogin } from '@react-oauth/google'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function GoogleLogin() {
  const { login } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        setIsLoading(true)
        setError(null)
        
        console.log('🔐 Google login success, sending access token to backend...')
        
        // Send access token directly to our backend
        console.log('📤 Sending to backend...')
        const authResult = await api.googleAuth(response.access_token)
        
        console.log('✅ Backend authentication successful')
        console.log('👤 User data:', authResult.data)
        console.log('🔑 JWT token:', authResult.token ? 'Present' : 'Missing')
        
        // Login user
        login(authResult.data, authResult.token)
        
        // Redirect to home
        router.push('/')
        
      } catch (error) {
        console.error('❌ Google OAuth error:', error)
        setError(error.message || 'Google authentication failed')
      } finally {
        setIsLoading(false)
      }
    },
    onError: (error) => {
      console.error('❌ Google login error:', error)
      setError('Google login failed. Please try again.')
      setIsLoading(false)
    },
    flow: 'implicit'
  })

  return (
    <div className="w-full">
      <button
        onClick={() => googleLogin()}
        disabled={isLoading}
        className="w-full flex items-center justify-center px-6 py-4 border border-white/20 rounded-2xl shadow-lg bg-white/10 backdrop-blur-sm text-white font-medium hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover-lift group"
      >
        {isLoading ? (
          <div className="flex items-center">
            <div className="spinner w-5 h-5 mr-3"></div>
            <span>Signing in...</span>
          </div>
        ) : (
          <div className="flex items-center">
            <div className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-300">
              <svg viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            </div>
            <span>Continue with Google</span>
          </div>
        )}
      </button>
      
      {error && (
        <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 text-red-200 rounded-xl backdrop-blur-sm slide-in-up">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}
    </div>
  )
} 