import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dbConnect from '../../../../lib/db'
import User from '../../../../models/User'
import { generateToken } from '../../../../lib/jwt'

const JWT_SECRET = process.env.JWT_SECRET

export async function POST(request) {
  try {
    console.log('🔐 Google OAuth request received')
    
    await dbConnect()
    console.log('Database connected for Google OAuth')
    
    const { token } = await request.json()
    console.log('Google token received:', token ? 'Present' : 'Missing')
    
    if (!token) {
      console.log('❌ No Google token provided')
      return NextResponse.json(
        { success: false, error: 'Google token is required' },
        { status: 400 }
      )
    }
    
    // Get user info from Google using access token
    console.log('🔍 Getting user info from Google...')
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    
    if (!userInfoResponse.ok) {
      console.log('❌ Failed to get user info from Google')
      return NextResponse.json(
        { success: false, error: 'Invalid Google token' },
        { status: 401 }
      )
    }
    
    const userInfo = await userInfoResponse.json()
    console.log('✅ Google user info received')
    console.log('👤 Google user data:', {
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
      sub: userInfo.sub
    })
    
    const email = (userInfo.email || '').toLowerCase()
    const name = userInfo.name || 'Google User'
    const picture = userInfo.picture || ''
    const googleId = userInfo.sub

    if (!email) {
      console.log('❌ Google user info missing email')
      return NextResponse.json(
        { success: false, error: 'Google account missing email scope' },
        { status: 400 }
      )
    }
    
    // Check if user exists
    let user = await User.findOne({
      $or: [
        { email: email },
        { googleId: googleId }
      ]
    })
    
    if (user) {
      console.log('👤 Existing user found:', user.email)
      // Always refresh Google info on login
      user.name = name
      user.googleId = googleId
      user.googleEmail = email
      if (picture) user.avatar = picture
      user.authMethod = 'google'
      await user.save()
    } else {
      console.log('👤 Creating new user with Google OAuth')
      
      // Create new user
      user = new User({
        name,
        email,
        googleId,
        googleEmail: email,
        avatar: picture || undefined,
        authMethod: 'google'
      })
      
      await user.save()
      console.log('✅ New user created:', user.email)
    }
    
    // Generate JWT token
    console.log('🔑 Generating JWT token')
    const jwtToken = generateToken(user._id)
    console.log('✅ JWT token generated')
    
    // Return user data (without password)
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      authMethod: user.authMethod,
      createdAt: user.createdAt
    }
    
    console.log('🎉 Google OAuth successful, returning response')
    return NextResponse.json({
      success: true,
      data: userData,
      token: jwtToken
    })
    
  } catch (error) {
    console.error('❌ Google OAuth error:', error)
    
    if (error.message && error.message.includes('Invalid token')) {
      return NextResponse.json(
        { success: false, error: 'Invalid Google token' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Google authentication failed' },
      { status: 500 }
    )
  }
} 