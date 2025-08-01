'use client'

import { useState } from 'react'

export default function NoteForm({ onAddNote }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [summary, setSummary] = useState('')
  const [summaryError, setSummaryError] = useState('')

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
      setSummary('') // Clear summary when creating new note
    } catch (error) {
      console.error('Error creating note:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSummarize = async () => {
    if (!content.trim() || content.trim().length < 20) {
      setSummaryError('Please write at least 20 characters to summarize.')
      return
    }

    setIsSummarizing(true)
    setSummaryError('')
    setSummary('')

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ note: content.trim() }),
      })

      const data = await response.json()

      if (data.success) {
        setSummary(data.summary)
      } else {
        setSummaryError(data.message || 'Failed to summarize note.')
      }
    } catch (error) {
      setSummaryError('Network error. Please try again.')
      console.error('Error summarizing note:', error)
    } finally {
      setIsSummarizing(false)
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

        {/* AI Summary Section */}
        {(summary || summaryError || isSummarizing) && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">AI Summary</h3>
            </div>
            
            {isSummarizing && (
              <div className="flex items-center space-x-3 text-white/70">
                <div className="spinner w-5 h-5"></div>
                <span>Generating summary...</span>
              </div>
            )}
            
            {summaryError && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl backdrop-blur-sm">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm">{summaryError}</span>
                </div>
              </div>
            )}
            
            {summary && (
              <div className="text-white/90 whitespace-pre-wrap leading-relaxed">
                {summary}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full pulse"></div>
            <span className="text-white/60 text-sm">Ready to save</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handleSummarize}
              disabled={isSummarizing || !content.trim() || content.trim().length < 20}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSummarizing ? (
                <>
                  <div className="spinner w-4 h-4"></div>
                  <span>Summarizing...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>Summarize</span>
                </>
              )}
            </button>
            
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
        </div>
      </form>
    </div>
  )
}