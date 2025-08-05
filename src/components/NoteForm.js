'use client'

import { useState, useEffect } from 'react'


export default function NoteForm({ onAddNote }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [summary, setSummary] = useState('')
  const [summaryError, setSummaryError] = useState('')
  
  // AI Features states
  const [isProcessing, setIsProcessing] = useState(false)
  const [aiResult, setAiResult] = useState('')
  const [aiError, setAiError] = useState('')
  const [currentAiAction, setCurrentAiAction] = useState('')
  const [showLanguageModal, setShowLanguageModal] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('')


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



  // Handle AI features (rewrite, translate, improve)
  const handleAiAction = async (action) => {
    if (!content.trim() || content.trim().length < 10) {
      setAiError(`Please write at least 10 characters to ${action}.`)
      return
    }

    // Special handling for translate - show language selection modal
    if (action === 'translate') {
      setShowLanguageModal(true)
      return
    }

    setIsProcessing(true)
    setAiError('')
    setAiResult('')
    setCurrentAiAction(action)

    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: action, 
          message: content.trim(),
          language: action === 'translate' ? selectedLanguage : undefined
        }),
      })

      const data = await response.json()

      if (data.success) {
        setAiResult(data.response)
      } else {
        setAiError(data.message || `Failed to ${action} content.`)
      }
    } catch (error) {
      setAiError('Network error. Please try again.')
      console.error(`Error ${action}ing content:`, error)
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle translation with selected language
  const handleTranslateWithLanguage = async (language) => {
    setShowLanguageModal(false)
    setSelectedLanguage(language)
    
    setIsProcessing(true)
    setAiError('')
    setAiResult('')
    setCurrentAiAction('translate')

    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'translate', 
          message: content.trim(),
          language: language
        }),
      })

      const data = await response.json()

      if (data.success) {
        setAiResult(data.response)
      } else {
        setAiError(data.message || 'Failed to translate content.')
      }
    } catch (error) {
      setAiError('Network error. Please try again.')
      console.error('Error translating content:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  // Apply AI result to content
  const applyAiResult = () => {
    if (aiResult.trim()) {
      setContent(aiResult.trim())
      setAiResult('')
      setCurrentAiAction('')
    }
  }

  // Dismiss AI result
  const dismissAiResult = () => {
    setAiResult('')
    setAiError('')
    setCurrentAiAction('')
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
          <div className="relative">
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title..."
              className="w-full px-4 py-3 bg-white/15 border border-white/30 text-white placeholder-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white/20 focus:border-white/50 transition-all duration-200 pr-12"
              required
            />

          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="content" className="block text-sm font-medium text-white/90">
              Content
            </label>

          </div>
          <div className="relative">
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note content here... or use voice input"
              rows={4}
              className="w-full px-4 py-3 bg-white/15 border border-white/30 text-white placeholder-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white/20 focus:border-white/50 transition-all duration-200 resize-none"
              required
            />

          </div>

        </div>

        {/* AI Features Section - Always visible when content exists */}
        {content.trim().length >= 10 && (
          <div className="mt-8 w-full">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <span className="inline-block mr-2 bg-gradient-to-br from-blue-400 to-purple-500 text-white rounded-lg px-2 py-1 text-xs font-bold">⚡</span>
              AI Writing Tools
            </h3>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
              <button
                type="button"
                onClick={() => handleAiAction('rewrite')}
                disabled={isProcessing || !content.trim()}
                className="btn-secondary flex items-center justify-center px-4 py-2 rounded-lg text-white shadow-md hover:bg-white/10 transition-colors w-full sm:w-auto"
              >
                <span className="mr-2">🧠</span> Rewrite
              </button>
              <button
                type="button"
                onClick={() => handleAiAction('translate')}
                disabled={isProcessing || !content.trim()}
                className="btn-secondary flex items-center justify-center px-4 py-2 rounded-lg text-white shadow-md hover:bg-white/10 transition-colors w-full sm:w-auto"
              >
                <span className="mr-2">🌍</span> Translate
              </button>
              <button
                type="button"
                onClick={() => handleAiAction('improve')}
                disabled={isProcessing || !content.trim()}
                className="btn-secondary flex items-center justify-center px-4 py-2 rounded-lg text-white shadow-md hover:bg-white/10 transition-colors w-full sm:w-auto"
              >
                <span className="mr-2">💡</span> Improve
              </button>
            </div>
            {isProcessing && (
              <div className="flex items-center space-x-3 text-white/70 mt-4">
                <div className="spinner w-5 h-5"></div>
                <span>Processing with AI...</span>
              </div>
            )}
            {aiError && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl backdrop-blur-sm mt-4">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm">{aiError}</span>
                </div>
              </div>
            )}
            {aiResult && (
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-4 backdrop-blur-sm mt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-medium capitalize">{currentAiAction} Result:</h4>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={applyAiResult}
                      className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded-lg transition-colors"
                    >
                      Apply
                    </button>
                    <button
                      type="button"
                      onClick={dismissAiResult}
                      className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-xs rounded-lg transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
                <div className="text-white/90 whitespace-pre-wrap leading-relaxed bg-white/5 rounded-lg p-3 border border-white/10">
                  {aiResult}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Language Selection Modal */}
        {showLanguageModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Select Translation Language</h3>
                <button
                  onClick={() => setShowLanguageModal(false)}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {[
                  { code: 'spanish', name: 'Spanish', flag: '🇪🇸' },
                  { code: 'french', name: 'French', flag: '🇫🇷' },
                  { code: 'german', name: 'German', flag: '🇩🇪' },
                  { code: 'italian', name: 'Italian', flag: '🇮🇹' },
                  { code: 'portuguese', name: 'Portuguese', flag: '🇵🇹' },
                  { code: 'russian', name: 'Russian', flag: '🇷🇺' },
                  { code: 'chinese', name: 'Chinese', flag: '🇨🇳' },
                  { code: 'japanese', name: 'Japanese', flag: '🇯🇵' },
                  { code: 'korean', name: 'Korean', flag: '🇰🇷' },
                  { code: 'arabic', name: 'Arabic', flag: '🇸🇦' },
                  { code: 'hindi', name: 'Hindi', flag: '🇮🇳' },
                  { code: 'english', name: 'English', flag: '🇺🇸' }
                ].map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleTranslateWithLanguage(lang.code)}
                    className="flex items-center space-x-2 p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white text-sm transition-all duration-200"
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-white/20">
                <button
                  onClick={() => handleTranslateWithLanguage('auto-detect')}
                  className="w-full flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 rounded-xl text-white font-medium transition-all duration-200"
                >
                  <span className="text-lg">🤖</span>
                  <span>Auto-detect Best Language</span>
                </button>
              </div>
            </div>
          </div>
        )}

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

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 mt-6 w-full">
          <button
            type="button"
            onClick={handleSummarize}
            disabled={isSummarizing || !content.trim() || content.trim().length < 20}
            className="btn-secondary flex items-center justify-center px-4 py-2 rounded-lg text-white shadow-md hover:bg-white/10 transition-colors w-full sm:w-auto"
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
            className="btn-primary flex items-center justify-center px-4 py-2 rounded-lg text-white shadow-md hover:bg-blue-600 transition-colors w-full sm:w-auto"
          >
            {isSubmitting ? (
              <span className="animate-pulse">Saving...</span>
            ) : (
              'Save Note'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}