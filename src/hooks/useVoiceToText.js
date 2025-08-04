'use client'

import { useState, useRef, useCallback } from 'react'

export default function useVoiceToText(onTranscriptChange, { silenceTimeoutMs = 5000 } = {}) {
  // onTranscriptChange: function(text, { interim, final })

  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState('')
  const [isSupported, setIsSupported] = useState(true)
  
  const recognitionRef = useRef(null)
  const timeoutRef = useRef(null)
  const finalizedTranscriptRef = useRef('') // Track what has already been appended
  const lastResultIndexRef = useRef(-1) // Track last processed result index

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
      // Only process results we haven't seen yet
      for (let i = Math.max(lastResultIndexRef.current + 1, event.resultIndex); i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          newFinal += transcriptPart
        } else {
          newInterim += transcriptPart
        }
        lastResultIndexRef.current = i
      }
      // Only append new final transcript if it's new
      if (newFinal) {
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
      }, silenceTimeoutMs) // Configurable silence timeout
    }

    recognition.onerror = (event) => {
      setError(`Speech recognition error: ${event.error}`)
      setIsListening(false)
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }

    recognition.onend = () => {
      // Auto-restart if user is still expecting to listen (mobile bug workaround)
      if (isListening) {
        try {
          recognition.start()
        } catch (err) {
          setIsListening(false)
        }
      } else {
        setIsListening(false)
      }
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
        lastResultIndexRef.current = -1
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
    setTranscript('')
    finalizedTranscriptRef.current = ''
    lastResultIndexRef.current = -1
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
