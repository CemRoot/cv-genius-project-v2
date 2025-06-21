'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

export interface VoiceRecognitionState {
  isListening: boolean
  isSupported: boolean
  transcript: string
  interimTranscript: string
  confidence: number
  error: string | null
  language: string
}

export interface VoiceOptions {
  language?: string
  continuous?: boolean
  interimResults?: boolean
  maxAlternatives?: number
  onResult?: (transcript: string, confidence: number) => void
  onError?: (error: string) => void
  onStart?: () => void
  onEnd?: () => void
}

export interface VoiceSynthesisState {
  isSpeaking: boolean
  isSupported: boolean
  voices: SpeechSynthesisVoice[]
  selectedVoice: SpeechSynthesisVoice | null
  rate: number
  pitch: number
  volume: number
}

const defaultVoiceOptions: Required<VoiceOptions> = {
  language: 'en-IE', // Irish English
  continuous: false,
  interimResults: true,
  maxAlternatives: 1,
  onResult: () => {},
  onError: () => {},
  onStart: () => {},
  onEnd: () => {}
}

export function useVoiceFeatures(options: VoiceOptions = {}) {
  const opts = { ...defaultVoiceOptions, ...options }
  
  // Voice Recognition State
  const [recognitionState, setRecognitionState] = useState<VoiceRecognitionState>({
    isListening: false,
    isSupported: typeof window !== 'undefined' && 'webkitSpeechRecognition' in window,
    transcript: '',
    interimTranscript: '',
    confidence: 0,
    error: null,
    language: opts.language
  })

  // Voice Synthesis State
  const [synthesisState, setSynthesisState] = useState<VoiceSynthesisState>({
    isSpeaking: false,
    isSupported: typeof window !== 'undefined' && 'speechSynthesis' in window,
    voices: [],
    selectedVoice: null,
    rate: 1,
    pitch: 1,
    volume: 1
  })

  const recognitionRef = useRef<any>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Initialize speech recognition
  useEffect(() => {
    if (!recognitionState.isSupported) return

    try {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      
      const recognition = recognitionRef.current
      recognition.lang = opts.language
      recognition.continuous = opts.continuous
      recognition.interimResults = opts.interimResults
      recognition.maxAlternatives = opts.maxAlternatives

      recognition.onstart = () => {
        setRecognitionState(prev => ({ ...prev, isListening: true, error: null }))
        opts.onStart()
        
        // Haptic feedback
        if ('vibrate' in navigator) {
          navigator.vibrate(50)
        }
      }

      recognition.onresult = (event: any) => {
        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i]
          const transcript = result[0].transcript

          if (result.isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        const confidence = event.results[event.results.length - 1]?.[0]?.confidence || 0

        setRecognitionState(prev => ({
          ...prev,
          transcript: finalTranscript || prev.transcript,
          interimTranscript,
          confidence
        }))

        if (finalTranscript) {
          opts.onResult(finalTranscript, confidence)
        }
      }

      recognition.onerror = (event: any) => {
        let errorMessage = 'Speech recognition error'
        
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected'
            break
          case 'audio-capture':
            errorMessage = 'Audio capture failed'
            break
          case 'not-allowed':
            errorMessage = 'Microphone permission denied'
            break
          case 'network':
            errorMessage = 'Network error occurred'
            break
          case 'language-not-supported':
            errorMessage = 'Language not supported'
            break
        }

        setRecognitionState(prev => ({ 
          ...prev, 
          isListening: false, 
          error: errorMessage 
        }))
        opts.onError(errorMessage)
      }

      recognition.onend = () => {
        setRecognitionState(prev => ({ ...prev, isListening: false }))
        opts.onEnd()
      }

    } catch (error) {
      console.error('Speech recognition initialization failed:', error)
      setRecognitionState(prev => ({ 
        ...prev, 
        isSupported: false, 
        error: 'Speech recognition not supported' 
      }))
    }
  }, [opts])

  // Initialize speech synthesis
  useEffect(() => {
    if (!synthesisState.isSupported) return

    const loadVoices = () => {
      const voices = speechSynthesis.getVoices()
      const filteredVoices = voices.filter(voice => 
        voice.lang.startsWith('en') // English voices
      )

      // Prefer Irish English voice
      const irishVoice = filteredVoices.find(voice => 
        voice.lang === 'en-IE' || voice.name.toLowerCase().includes('irish')
      )

      setSynthesisState(prev => ({
        ...prev,
        voices: filteredVoices,
        selectedVoice: irishVoice || filteredVoices[0] || null
      }))
    }

    loadVoices()
    speechSynthesis.onvoiceschanged = loadVoices
  }, [synthesisState.isSupported])

  // Start voice recognition
  const startListening = useCallback(() => {
    if (!recognitionState.isSupported || !recognitionRef.current) {
      setRecognitionState(prev => ({ 
        ...prev, 
        error: 'Speech recognition not supported' 
      }))
      return false
    }

    try {
      recognitionRef.current.start()
      return true
    } catch (error) {
      console.error('Failed to start speech recognition:', error)
      setRecognitionState(prev => ({ 
        ...prev, 
        error: 'Failed to start speech recognition' 
      }))
      return false
    }
  }, [recognitionState.isSupported])

  // Stop voice recognition
  const stopListening = useCallback(() => {
    if (recognitionRef.current && recognitionState.isListening) {
      recognitionRef.current.stop()
    }
  }, [recognitionState.isListening])

  // Clear transcript
  const clearTranscript = useCallback(() => {
    setRecognitionState(prev => ({
      ...prev,
      transcript: '',
      interimTranscript: '',
      confidence: 0,
      error: null
    }))
  }, [])

  // Speak text
  const speak = useCallback((text: string, options?: {
    rate?: number
    pitch?: number
    volume?: number
    voice?: SpeechSynthesisVoice
  }) => {
    if (!synthesisState.isSupported) {
      console.warn('Speech synthesis not supported')
      return false
    }

    // Stop any current speech
    speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utteranceRef.current = utterance

    utterance.voice = options?.voice || synthesisState.selectedVoice
    utterance.rate = options?.rate || synthesisState.rate
    utterance.pitch = options?.pitch || synthesisState.pitch
    utterance.volume = options?.volume || synthesisState.volume

    utterance.onstart = () => {
      setSynthesisState(prev => ({ ...prev, isSpeaking: true }))
    }

    utterance.onend = () => {
      setSynthesisState(prev => ({ ...prev, isSpeaking: false }))
    }

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error)
      setSynthesisState(prev => ({ ...prev, isSpeaking: false }))
    }

    speechSynthesis.speak(utterance)
    return true
  }, [synthesisState])

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    speechSynthesis.cancel()
    setSynthesisState(prev => ({ ...prev, isSpeaking: false }))
  }, [])

  // Set voice settings
  const setVoiceSettings = useCallback((settings: {
    voice?: SpeechSynthesisVoice
    rate?: number
    pitch?: number
    volume?: number
  }) => {
    setSynthesisState(prev => ({
      ...prev,
      ...settings
    }))
  }, [])

  // Voice navigation helpers
  const speakInstruction = useCallback((instruction: string) => {
    speak(instruction, { rate: 0.9, pitch: 1.1 })
  }, [speak])

  const speakError = useCallback((error: string) => {
    speak(`Error: ${error}`, { rate: 0.8, pitch: 0.9 })
  }, [speak])

  const speakSuccess = useCallback((message: string) => {
    speak(`Success: ${message}`, { rate: 1.0, pitch: 1.2 })
  }, [speak])

  // Dictation helpers for CV sections
  const startDictation = useCallback((section: string, onComplete: (text: string) => void) => {
    speakInstruction(`Please dictate your ${section}. Speak clearly and I'll transcribe it for you.`)
    
    clearTranscript()
    
    const originalOnResult = opts.onResult
    opts.onResult = (transcript: string, confidence: number) => {
      if (confidence > 0.7) {
        onComplete(transcript)
        speakSuccess(`${section} recorded successfully`)
      }
      originalOnResult(transcript, confidence)
    }
    
    setTimeout(() => {
      startListening()
    }, 2000) // Wait for instruction to finish
  }, [speakInstruction, speakSuccess, clearTranscript, startListening, opts])

  return {
    // Recognition state and controls
    recognition: {
      ...recognitionState,
      startListening,
      stopListening,
      clearTranscript
    },
    
    // Synthesis state and controls
    synthesis: {
      ...synthesisState,
      speak,
      stopSpeaking,
      setVoiceSettings
    },
    
    // Helper functions
    speakInstruction,
    speakError,
    speakSuccess,
    startDictation,
    
    // Combined state
    isVoiceActive: recognitionState.isListening || synthesisState.isSpeaking,
    isVoiceSupported: recognitionState.isSupported && synthesisState.isSupported,
    
    // Accessibility helpers
    announcePageChange: (pageName: string) => {
      speak(`You are now on the ${pageName} page`)
    },
    
    announceFormField: (fieldName: string, isRequired: boolean = false) => {
      const requirement = isRequired ? 'required' : 'optional'
      speak(`${fieldName} field, ${requirement}`)
    },
    
    announceValidationError: (fieldName: string, error: string) => {
      speak(`${fieldName} has an error: ${error}`)
    }
  }
}

export default useVoiceFeatures