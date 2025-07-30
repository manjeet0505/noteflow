'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for existing token and user data on app load
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    console.log('🔍 AuthContext: Checking localStorage on mount')
    console.log('🔑 Token in localStorage:', token ? 'Present' : 'Missing')
    console.log('👤 User data in localStorage:', userData ? 'Present' : 'Missing')
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
        console.log('✅ AuthContext: User loaded from localStorage')
      } catch (error) {
        console.error('❌ AuthContext: Error parsing user data:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    
    setLoading(false)
  }, [])

  const login = (userData, token) => {
    console.log('🔐 AuthContext: Login called')
    console.log('👤 User data:', userData)
    console.log('🔑 Token:', token ? 'Present' : 'Missing')
    
    setUser(userData)
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    
    console.log('💾 AuthContext: Token and user data saved to localStorage')
    console.log('🔑 Token saved:', localStorage.getItem('token') ? 'Yes' : 'No')
    console.log('👤 User saved:', localStorage.getItem('user') ? 'Yes' : 'No')
  }

  const logout = () => {
    console.log('🚪 AuthContext: Logout called')
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 