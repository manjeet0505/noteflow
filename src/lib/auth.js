import { NextResponse } from 'next/server'
import { verifyToken, getTokenFromHeader } from './jwt'
import dbConnect from './db'
import User from '../models/User'

export async function authenticateUser(request) {
  try {
    console.log('🔐 Starting authentication...')
    console.log('📋 All request headers:', Object.keys(request.headers))
    console.log('🔑 Authorization header:', request.headers.authorization)
    console.log('🔑 authorization header (lowercase):', request.headers.authorization)
    console.log('🔑 Authorization header (exact):', request.headers.get('authorization'))
    
    await dbConnect()
    
    const token = getTokenFromHeader(request)
    console.log('🔑 Token from header:', token ? 'Present' : 'Missing')
    
    if (!token) {
      console.log('❌ No token provided')
      return { success: false, error: 'No token provided', status: 401 }
    }
    
    const decoded = verifyToken(token)
    console.log('🔓 Token verification:', decoded ? 'Valid' : 'Invalid')
    
    if (!decoded) {
      console.log('❌ Invalid token')
      return { success: false, error: 'Invalid token', status: 401 }
    }
    
    console.log('👤 Looking up user with ID:', decoded.userId)
    const user = await User.findById(decoded.userId).select('-password')
    console.log('👤 User lookup result:', user ? 'Found' : 'Not found')
    
    if (!user) {
      console.log('❌ User not found')
      return { success: false, error: 'User not found', status: 401 }
    }
    
    console.log('✅ Authentication successful for user:', user.email)
    return { success: true, user }
  } catch (error) {
    console.error('❌ Authentication error:', error)
    return { success: false, error: 'Authentication failed', status: 500 }
  }
}

export function withAuth(handler) {
  return async (request, context) => {
    const authResult = await authenticateUser(request)
    
    if (!authResult.success) {
      console.log('🚫 Auth failed:', authResult.error)
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status || 401 }
      )
    }
    
    // Add user to request context
    request.user = authResult.user
    console.log('✅ Auth passed, calling handler')
    return handler(request, context || { params: {} })
  }
}