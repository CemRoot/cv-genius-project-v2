'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface VoiceInputOptions {
  continuous?: boolean
  interimResults?: boolean
  language?: string
  onResult?: (transcript: string) => void
  onError?: (error: Error) => void
  onStart?: () => void
  onEnd?: () => void
}

export function useVoiceInput(options: VoiceInputOptions = {}) {
  const {
    continuous = false,
    interimResults = true,
    language = 'en-US',
    onResult,
    onError,
    onStart,
    onEnd
  } = options

  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition

    if (SpeechRecognition) {
      setIsSupported(true)
      const recognition = new SpeechRecognition()
      
      // Configure recognition
      recognition.continuous = continuous
      recognition.interimResults = interimResults
      recognition.lang = language

      // Event handlers
      recognition.onstart = () => {
        setIsListening(true)
        setError(null)
        onStart?.()
      }

      recognition.onend = () => {
        setIsListening(false)
        onEnd?.()
      }

      recognition.onresult = (event: any) => {
        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          if (result.isFinal) {
            finalTranscript += result[0].transcript + ' '
          } else {
            interimTranscript += result[0].transcript
          }
        }

        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript)
          onResult?.(finalTranscript.trim())
        }
        
        setInterimTranscript(interimTranscript)
      }

      recognition.onerror = (event: any) => {
        const error = new Error(`Speech recognition error: ${event.error}`)
        setError(error)
        setIsListening(false)
        onError?.(error)
      }

      recognitionRef.current = recognition
    } else {
      setIsSupported(false)
      setError(new Error('Speech recognition is not supported in this browser'))
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [continuous, interimResults, language, onResult, onError, onStart, onEnd])

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start()
      } catch (error) {
        console.error('Failed to start speech recognition:', error)
      }
    }
  }, [isListening])

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }, [isListening])

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [isListening, startListening, stopListening])

  const resetTranscript = useCallback(() => {
    setTranscript('')
    setInterimTranscript('')
  }, [])

  return {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    error,
    startListening,
    stopListening,
    toggleListening,
    resetTranscript
  }
}

// Voice commands hook for navigation and actions
export function useVoiceCommands(commands: Record<string, () => void>) {
  const [isActive, setIsActive] = useState(false)
  
  const handleCommand = useCallback((transcript: string) => {
    const lowerTranscript = transcript.toLowerCase()
    
    // Check for commands
    Object.entries(commands).forEach(([command, action]) => {
      if (lowerTranscript.includes(command.toLowerCase())) {
        action()
        // Haptic feedback
        if ('vibrate' in navigator) {
          navigator.vibrate(100)
        }
      }
    })
  }, [commands])

  const { 
    isListening, 
    startListening, 
    stopListening,
    isSupported,
    error
  } = useVoiceInput({
    continuous: true,
    onResult: handleCommand
  })

  const activate = () => {
    setIsActive(true)
    startListening()
  }

  const deactivate = () => {
    setIsActive(false)
    stopListening()
  }

  return {
    isActive,
    isListening,
    isSupported,
    error,
    activate,
    deactivate
  }
}