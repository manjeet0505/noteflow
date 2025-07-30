import { NextResponse } from 'next/server'
import dbConnect from '../../../../lib/db'
import Note from '../../../../models/Note'
import { withAuth } from '../../../../lib/auth'

export const DELETE = withAuth(async (request, context) => {
  try {
    await dbConnect()
    
    // Get the ID from context.params
    const { id } = context?.params || {}
    
    // Validate ID format
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid note ID format' },
        { status: 400 }
      )
    }
    
    // Find and delete the note (only if it belongs to the user)
    const deletedNote = await Note.findOneAndDelete({
      _id: id,
      userId: request.user._id
    })
    
    if (!deletedNote) {
      return NextResponse.json(
        { success: false, error: 'Note not found or not authorized' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { success: true, message: 'Note deleted successfully' }
    )
  } catch (error) {
    console.error('Error deleting note:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete note' },
      { status: 500 }
    )
  }
})

// Add support for GET /api/notes/[id]
export const GET = withAuth(async (request, context) => {
  try {
    await dbConnect()
    
    const { id } = context?.params || {}
    
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid note ID format' },
        { status: 400 }
      )
    }
    
    const note = await Note.findOne({
      _id: id,
      userId: request.user._id
    })
    
    if (!note) {
      return NextResponse.json(
        { success: false, error: 'Note not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true, data: note })
  } catch (error) {
    console.error('Error fetching note:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch note' },
      { status: 500 }
    )
  }
})

// Add support for PUT /api/notes/[id]
export const PUT = withAuth(async (request, context) => {
  try {
    await dbConnect()
    
    const { id } = context?.params || {}
    const { title, content } = await request.json()
    
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid note ID format' },
        { status: 400 }
      )
    }
    
    if (!title && !content) {
      return NextResponse.json(
        { success: false, error: 'Title or content is required' },
        { status: 400 }
      )
    }
    
    const updateData = {}
    if (title) updateData.title = title
    if (content) updateData.content = content
    
    const updatedNote = await Note.findOneAndUpdate(
      { _id: id, userId: request.user._id },
      updateData,
      { new: true, runValidators: true }
    )
    
    if (!updatedNote) {
      return NextResponse.json(
        { success: false, error: 'Note not found or not authorized' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true, data: updatedNote })
  } catch (error) {
    console.error('Error updating note:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update note' },
      { status: 500 }
    )
  }
})