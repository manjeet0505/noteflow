import { NextResponse } from 'next/server'
import dbConnect from '../../../lib/db'
import Note from '../../../models/Note'
import { withAuth } from '../../../lib/auth'

export const GET = withAuth(async (request) => {
  try {
    await dbConnect()
    
    // Get notes for the authenticated user
    const notes = await Note.find({ userId: request.user._id }).sort({ createdAt: -1 })
    
    return NextResponse.json({ success: true, data: notes })
  } catch (error) {
    console.error('Error fetching notes:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notes' },
      { status: 500 }
    )
  }
})

export const POST = withAuth(async (request) => {
  try {
    await dbConnect()
    
    const { title, content } = await request.json()
    
    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: 'Title and content are required' },
        { status: 400 }
      )
    }
    
    // Create new note with user ID
    const note = await Note.create({
      title,
      content,
      userId: request.user._id,
    })
    
    return NextResponse.json(
      { success: true, data: note },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating note:', error)
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message)
      return NextResponse.json(
        { success: false, error: errors.join(', ') },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create note' },
      { status: 500 }
    )
  }
}) 