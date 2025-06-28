'use client'

import { Button } from '@/components/ui/button'
import { Mic, MicOff, Loader2 } from 'lucide-react'
import { useVoiceInput } from '@/hooks/use-voice-input'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void
  placeholder?: string
  className?: string
}

export function VoiceInputButton({ 
  onTranscript, 
  placeholder = 'Tap to speak...',
  className 
}: VoiceInputButtonProps) {
  const [showTranscript, setShowTranscript] = useState(false)
  
  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript
  } = useVoiceInput({
    continuous: false,
    onResult: (text) => {
      onTranscript(text)
      setShowTranscript(false)
    },
    onEnd: () => {
      setShowTranscript(false)
    }
  })

  useEffect(() => {
    if (isListening) {
      setShowTranscript(true)
    }
  }, [isListening])

  if (!isSupported) {
    return null
  }

  const handleClick = () => {
    if (isListening) {
      stopListening()
    } else {
      resetTranscript()
      startListening()
    }
  }

  return (
    <>
      <Button
        type="button"
        variant={isListening ? 'default' : 'outline'}
        size="icon"
        onClick={handleClick}
        className={className}
        disabled={!!error}
      >
        {isListening ? (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Mic className="h-4 w-4" />
          </motion.div>
        ) : (
          <MicOff className="h-4 w-4" />
        )}
      </Button>

      <AnimatePresence>
        {showTranscript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-20 left-4 right-4 z-50"
          >
            <div className="bg-white rounded-lg shadow-lg p-4 border">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse delay-75" />
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse delay-150" />
                </div>
                <span className="text-sm font-medium text-gray-600">Listening...</span>
              </div>
              
              <p className="text-gray-900 min-h-[2rem]">
                {transcript || interimTranscript || placeholder}
              </p>
              
              {error && (
                <p className="text-red-600 text-sm mt-2">{error.message}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Voice-enabled text input component
interface VoiceTextInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  multiline?: boolean
}

export function VoiceTextInput({
  value,
  onChange,
  placeholder,
  className,
  multiline = false
}: VoiceTextInputProps) {
  const handleTranscript = (text: string) => {
    // Append to existing value with a space
    onChange(value ? `${value} ${text}` : text)
  }

  const InputComponent = multiline ? 'textarea' : 'input'

  return (
    <div className="relative">
      <InputComponent
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`pr-12 ${className}`}
      />
      <VoiceInputButton
        onTranscript={handleTranscript}
        className="absolute right-2 top-1/2 -translate-y-1/2"
      />
    </div>
  )
}