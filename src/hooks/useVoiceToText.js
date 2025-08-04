'use client'

import { useState, useRef, useCallback } from 'react'

export default function useVoiceToText(onTranscriptChange) {
  // onTranscriptChange: function(text, { interim, final })

  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState('')
  const [isSupported, setIsSupported] = useState(true)
  
  const recognitionRef = useRef(null)
  const timeoutRef = useRef(null)
  const finalizedTranscriptRef = useRef('') // Track what has already been appended

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
      let newFinal = ''
      let newInterim = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          newFinal += transcriptPart
        } else {
          newInterim += transcriptPart
        }
      }

      // Only append new final transcript if it's new
      if (newFinal) {
        // Prevent duplicate appending by checking if newFinal is already at the end
        if (!finalizedTranscriptRef.current.endsWith(newFinal)) {
          finalizedTranscriptRef.current += newFinal
        }
        setTranscript(finalizedTranscriptRef.current)
        setInterimTranscript('')
        if (typeof onTranscriptChange === 'function') {
          onTranscriptChange(finalizedTranscriptRef.current, { interim: '', final: newFinal })
        }
      } else {
        setInterimTranscript(newInterim)
        if (typeof onTranscriptChange === 'function') {
          onTranscriptChange(finalizedTranscriptRef.current + newInterim, { interim: newInterim, final: '' })
        }
      }
      // Reset silence timeout on any result
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
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
        setInterimTranscript('')
        finalizedTranscriptRef.current = ''
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
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
    setInterimTranscript('')
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  // Clear transcript
  const clearTranscript = useCallback(() => {
    setTranscript('')
    setInterimTranscript('')
    finalizedTranscriptRef.current = ''
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
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    clearTranscript,
    appendToText,
    cleanup
  }
}
