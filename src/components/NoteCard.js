'use client'

import { useState } from 'react'

export default function NoteCard({ note, onDeleteNote }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDeleteNote(note._id)
    } catch (error) {
      console.error('Error deleting note:', error)
    } finally {
      setIsDeleting(false)
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

  const handleCardClick = (e) => {
    // Don't open modal if clicking on delete button
    if (e.target.closest('button')) return
    setShowModal(true)
  }

  return (
    <>
      <div 
        className="card-glass p-6 hover-lift scale-in group cursor-pointer"
        onClick={handleCardClick}
      >
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

      {/* Note View Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="bg-white/15 backdrop-blur-xl border border-white/30 rounded-2xl max-w-2xl w-full h-[60vh] overflow-hidden flex flex-col shadow-2xl mx-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/20 flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{note.title}</h2>
                  <p className="text-white/60 text-sm">{formatDate(note.createdAt)}</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-white/70 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-4 overflow-y-auto flex-1 min-h-0">
              <div className="prose prose-invert max-w-none">
                <div className="text-white/90 leading-relaxed whitespace-pre-wrap">
                  {note.content}
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="flex items-center justify-between p-4 border-t border-white/20 bg-white/5 flex-shrink-0">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                <span className="text-white/60 text-sm">Created {formatDate(note.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    handleDelete()
                    setShowModal(false)
                  }}
                  disabled={isDeleting}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-200 rounded-lg transition-all duration-200 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <div className="spinner w-4 h-4"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                  <span>{isDeleting ? 'Deleting...' : 'Delete Note'}</span>
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg transition-all duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}