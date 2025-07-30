import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import dbConnect from '../../../../lib/db'
import User from '../../../../models/User'
import { generateToken } from '../../../../lib/jwt'

export async function POST(request) {
  try {
    console.log('Signup request received')
    await dbConnect()
    console.log('Database connected')
    
    const { name, email, password } = await request.json()
    console.log('Request data:', { name, email, password: password ? '[HIDDEN]' : 'MISSING' })
    
    // Validate required fields
    if (!name || !email || !password) {
      console.log('Missing required fields')
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      console.log('User already exists')
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 400 }
      )
    }
    
    console.log('Creating new user...')
    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    console.log('Password hashed')
    
    // Create new user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    })
    console.log('User created:', user._id)
    
    // Generate JWT token
    const token = generateToken(user._id)
    console.log('JWT token generated')
    
    // Return user data (without password) and token
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    }
    
    console.log('Signup successful, returning response')
    return NextResponse.json(
      { 
        success: true, 
        data: userResponse,
        token 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating user:', error)
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message)
      console.log('Validation error:', errors)
      return NextResponse.json(
        { success: false, error: errors.join(', ') },
        { status: 400 }
      )
    }
    
    console.log('Unexpected error:', error.message)
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    )
  }
} 