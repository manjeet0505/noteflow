import mongoose from 'mongoose'

const NoteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title for the note'],
    maxlength: [100, 'Title cannot be more than 100 characters'],
  },
  content: {
    type: String,
    required: [true, 'Please provide content for the note'],
    maxlength: [2000, 'Content cannot be more than 2000 characters'],
  },
  userId: {
    type: String,
    required: false, // Optional for now, will be required when auth is added
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields automatically
})

export default mongoose.models.Note || mongoose.model('Note', NoteSchema) 