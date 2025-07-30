import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    minlength: 6,
    // Make password optional for Google OAuth users
    required: function() {
      return !this.googleId; // Only required if not using Google OAuth
    }
  },
  // Google OAuth fields
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allows multiple null values
  },
  googleEmail: {
    type: String,
    lowercase: true,
    trim: true
  },
  avatar: {
    type: String
  },
  // Track authentication method
  authMethod: {
    type: String,
    enum: ['email', 'google'],
    default: 'email'
  }
}, {
  timestamps: true
})

const User = mongoose.models.User || mongoose.model('User', userSchema)

export default User 