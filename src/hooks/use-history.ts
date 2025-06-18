import { useState, useCallback, useRef } from 'react'

interface UseHistoryOptions<T> {
  maxHistory?: number
}

export function useHistory<T>(initialState: T, options: UseHistoryOptions<T> = {}) {
  const { maxHistory = 50 } = options
  
  const [state, setState] = useState<T>(initialState)
  const [history, setHistory] = useState<T[]>([initialState])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isRedoUndoing, setIsRedoUndoing] = useState(false)
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const pushToHistory = useCallback((newState: T) => {
    if (isRedoUndoing) return

    // Clear timeout if it exists
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Debounce history updates to avoid too many entries during rapid changes
    timeoutRef.current = setTimeout(() => {
      setHistory(prev => {
        // If we're not at the end, truncate history from current position
        const newHistory = prev.slice(0, currentIndex + 1)
        
        // Add new state
        newHistory.push(newState)
        
        // Limit history size
        if (newHistory.length > maxHistory) {
          return newHistory.slice(-maxHistory)
        }
        
        return newHistory
      })
      
      setCurrentIndex(prev => {
        const newIndex = Math.min(prev + 1, maxHistory - 1)
        return newIndex
      })
    }, 300) // 300ms debounce
  }, [currentIndex, maxHistory, isRedoUndoing])

  const updateState = useCallback((newState: T | ((prev: T) => T)) => {
    setState(prev => {
      const nextState = typeof newState === 'function' ? (newState as (prev: T) => T)(prev) : newState
      pushToHistory(nextState)
      return nextState
    })
  }, [pushToHistory])

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setIsRedoUndoing(true)
      const newIndex = currentIndex - 1
      setCurrentIndex(newIndex)
      setState(history[newIndex])
      
      // Reset flag after a short delay
      setTimeout(() => setIsRedoUndoing(false), 100)
    }
  }, [currentIndex, history])

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setIsRedoUndoing(true)
      const newIndex = currentIndex + 1
      setCurrentIndex(newIndex)
      setState(history[newIndex])
      
      // Reset flag after a short delay
      setTimeout(() => setIsRedoUndoing(false), 100)
    }
  }, [currentIndex, history])

  const canUndo = currentIndex > 0
  const canRedo = currentIndex < history.length - 1

  const clearHistory = useCallback(() => {
    setHistory([state])
    setCurrentIndex(0)
  }, [state])

  return {
    state,
    updateState,
    undo,
    redo,
    canUndo,
    canRedo,
    historyLength: history.length,
    currentIndex,
    clearHistory
  }
}