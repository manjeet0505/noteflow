'use client'

import { useState, useRef, useCallback } from 'react'

export default function useVoiceToText() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState('')
  const [isSupported, setIsSupported] = useState(true)
  
  const recognitionRef = useRef(null)
  const timeoutRef = useRef(null)

  // Initialize speech recognition
  const initializeRecognition = useCallback(() => {
    if (typeof window === 'undefined') return null

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      setIsSupported(false)
      setError('Speech recognition is not supported in this browser')
      return null
    }

    const recognition = new SpeechRecognition()
    
    // Configuration
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognition.maxAlternatives = 1

    // Event handlers
    recognition.onstart = () => {
      setIsListening(true)
      setError('')
    }

    recognition.onresult = (event) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPart
        } else {
          interimTranscript += transcriptPart
        }
      }

      setTranscript(prev => prev + finalTranscript)
      
      // Reset timeout for continuous listening
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      // Auto-stop after 3 seconds of silence
      timeoutRef.current = setTimeout(() => {
        if (recognitionRef.current && isListening) {
          stopListening()
        }
      }, 3000)
    }

    recognition.onerror = (event) => {
      setError(`Speech recognition error: ${event.error}`)
      setIsListening(false)
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }

    recognition.onend = () => {
      setIsListening(false)
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }

    return recognition
  }, [isListening])

  // Start listening
  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser')
      return
    }

    try {
      if (!recognitionRef.current) {
        recognitionRef.current = initializeRecognition()
      }

      if (recognitionRef.current && !isListening) {
        setTranscript('')
        setError('')
        recognitionRef.current.start()
      }
    } catch (err) {
      setError('Failed to start speech recognition')
      console.error('Speech recognition error:', err)
    }
  }, [isSupported, isListening, initializeRecognition])

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [isListening])

  // Clear transcript
  const clearTranscript = useCallback(() => {
    setTranscript('')
    setError('')
  }, [])

  // Append transcript to existing text
  const appendToText = useCallback((existingText) => {
    if (!transcript.trim()) return existingText
    
    const separator = existingText.trim() ? ' ' : ''
    return existingText + separator + transcript.trim()
  }, [transcript])

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  return {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    clearTranscript,
    appendToText,
    cleanup
  }
}
