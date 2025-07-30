'use client'

import { useState } from 'react'

export default function NoteForm({ onAddNote }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!title.trim() || !content.trim()) {
      return
    }

    setIsSubmitting(true)
    try {
      await onAddNote({ title: title.trim(), content: content.trim() })
      setTitle('')
      setContent('')
    } catch (error) {
      console.error('Error creating note:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="card-glass p-8 scale-in">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Create New Note</h2>
          <p className="text-white/70 text-sm">Capture your thoughts and ideas</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-white/90 mb-2">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter note title..."
            className="input-modern bg-white/10 border-white/20 text-white placeholder-white/50 focus:bg-white/20 focus:border-white/40"
            required
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-white/90 mb-2">
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note content here..."
            rows={4}
            className="input-modern bg-white/10 border-white/20 text-white placeholder-white/50 focus:bg-white/20 focus:border-white/40 resize-none"
            required
          />
        </div>

        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full pulse"></div>
            <span className="text-white/60 text-sm">Ready to save</span>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting || !title.trim() || !content.trim()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="spinner w-4 h-4"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Save Note</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
} 