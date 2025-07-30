'use client'

import { useState } from 'react'

export default function NoteCard({ note, onDeleteNote }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      setIsDeleting(true)
      try {
        await onDeleteNote(note._id)
      } catch (error) {
        console.error('Error deleting note:', error)
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="card-glass p-6 hover-lift scale-in group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-200 transition-colors duration-300">
            {note.title}
          </h3>
          <p className="text-white/80 text-sm leading-relaxed line-clamp-3">
            {note.content}
          </p>
        </div>
        
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="ml-4 p-2 text-white/60 hover:text-red-400 hover:bg-red-500/20 rounded-xl transition-all duration-300 opacity-0 group-hover:opacity-100 disabled:opacity-50"
        >
          {isDeleting ? (
            <div className="spinner w-4 h-4"></div>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          )}
        </button>
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
          <span className="text-white/60 text-xs">
            {formatDate(note.createdAt)}
          </span>
        </div>
        
        <div className="flex items-center space-x-1">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="text-white/60 text-xs">Note</span>
        </div>
      </div>
    </div>
  )
} 