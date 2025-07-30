import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import dbConnect from '../../../../lib/db'
import User from '../../../../models/User'
import { generateToken } from '../../../../lib/jwt'

export async function POST(request) {
  try {
    console.log('Login request received')
    await dbConnect()
    console.log('Database connected for login')
    
    const { email, password } = await request.json()
    console.log('Login data:', { email, password: password ? '[HIDDEN]' : 'MISSING' })
    
    // Validate required fields
    if (!email || !password) {
      console.log('Missing email or password')
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }
    
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() })
    console.log('User lookup result:', user ? 'Found' : 'Not found')
    if (!user) {
      console.log('User not found')
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    console.log('Password verification:', isPasswordValid ? 'Valid' : 'Invalid')
    if (!isPasswordValid) {
      console.log('Invalid password')
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }
    
    // Generate JWT token
    const token = generateToken(user._id)
    
    // Return user data (without password) and token
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    }
    
    return NextResponse.json(
      { 
        success: true, 
        data: userResponse,
        token 
      }
    )
  } catch (error) {
    console.error('Error logging in:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to login' },
      { status: 500 }
    )
  }
} 