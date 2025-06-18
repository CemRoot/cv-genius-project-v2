import { useEffect, useRef, useState, useCallback } from 'react'

interface UseAutoSaveOptions {
  onSave: () => void
  delay?: number // milliseconds
  enabled?: boolean
}

export function useAutoSave({ onSave, delay = 30000, enabled = true }: UseAutoSaveOptions) {
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const saveCountRef = useRef(0)

  const triggerSave = useCallback(async () => {
    if (!enabled) return

    setIsSaving(true)
    
    try {
      // Add minimum delay to show saving state
      await new Promise(resolve => setTimeout(resolve, 500))
      onSave()
      setLastSaved(new Date())
      saveCountRef.current += 1
    } catch (error) {
      console.error('Auto-save failed:', error)
    } finally {
      setIsSaving(false)
    }
  }, [enabled, onSave])

  const scheduleAutoSave = useCallback(() => {
    if (!enabled) return

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Schedule new auto-save
    timeoutRef.current = setTimeout(() => {
      triggerSave()
    }, delay)
  }, [enabled, delay, triggerSave])

  const saveNow = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    triggerSave()
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Initial auto-save setup
  useEffect(() => {
    if (enabled) {
      scheduleAutoSave()
    }
  }, [enabled, delay, scheduleAutoSave])

  return {
    isSaving,
    lastSaved,
    saveCount: saveCountRef.current,
    scheduleAutoSave,
    saveNow,
    triggerSave
  }
}