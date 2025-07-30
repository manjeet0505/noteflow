'use client'

import { useState, useEffect } from 'react'
import NoteForm from '../components/NoteForm'
import NoteCard from '../components/NoteCard'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

export default function Home() {
  const { user, isAuthenticated } = useAuth()
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch notes on component mount (only if authenticated)
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotes()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated])

  const fetchNotes = async () => {
    try {
      setLoading(true)
      const fetchedNotes = await api.getNotes()
      setNotes(fetchedNotes)
      setError(null)
    } catch (err) {
      setError('Failed to load notes')
      console.error('Error fetching notes:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddNote = async (newNote) => {
    try {
      const createdNote = await api.createNote({
        title: newNote.title,
        content: newNote.content,
      })
      setNotes([createdNote, ...notes])
    } catch (err) {
      setError('Failed to create note')
      console.error('Error creating note:', err)
    }
  }

  const handleDeleteNote = async (noteId) => {
    try {
      await api.deleteNote(noteId)
      setNotes(notes.filter(note => note._id !== noteId))
    } catch (err) {
      setError('Failed to delete note')
      console.error('Error deleting note:', err)
    }
  }

  return (
    <div className="min-h-screen animated-bg relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl float" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">
          {!isAuthenticated ? (
            /* Hero Section for Non-Authenticated Users */
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center max-w-4xl mx-auto slide-in-up">
                <div className="mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl float">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                    NotesFlow
                  </h1>
                  <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
                    Transform your thoughts into organized, beautiful notes. 
                    Capture ideas, manage tasks, and stay productive with our modern note-taking experience.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-12">
                  <div className="card-glass p-6 text-center hover-lift">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Secure & Private</h3>
                    <p className="text-white/80">Your notes are encrypted and stored securely in the cloud.</p>
                  </div>

                  <div className="card-glass p-6 text-center hover-lift">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Lightning Fast</h3>
                    <p className="text-white/80">Instant sync across all your devices with real-time updates.</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="/login"
                    className="btn-primary text-lg px-8 py-4 scale-in"
                  >
                    Get Started
                  </a>
                  <a
                    href="/signup"
                    className="btn-secondary text-lg px-8 py-4 scale-in"
                    style={{animationDelay: '0.2s'}}
                  >
                    Create Account
                  </a>
                </div>
              </div>
            </div>
          ) : (
            /* Dashboard for Authenticated Users */
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12 slide-in-up">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Welcome back, {user?.name}! 👋
                </h1>
                <p className="text-xl text-white/80">
                  Ready to capture your next brilliant idea?
                </p>
              </div>

              <div className="mb-8 scale-in">
                <NoteForm onAddNote={handleAddNote} />
              </div>
              
              <div className="card-glass p-8 scale-in" style={{animationDelay: '0.3s'}}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Your Notes</h2>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full pulse"></div>
                    <span className="text-white/70 text-sm">{notes.length} notes</span>
                  </div>
                </div>
                
                {error && (
                  <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl mb-6 backdrop-blur-sm">
                    {error}
                  </div>
                )}
                
                {loading ? (
                  <div className="text-center py-12">
                    <div className="spinner w-12 h-12 mx-auto mb-4"></div>
                    <p className="text-white/70">Loading your notes...</p>
                  </div>
                ) : notes.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <svg className="w-12 h-12 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No notes yet</h3>
                    <p className="text-white/70">Create your first note above to get started!</p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {notes.map((note, index) => (
                      <div key={note._id} style={{animationDelay: `${index * 0.1}s`}}>
                        <NoteCard
                          note={note}
                          onDeleteNote={handleDeleteNote}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 