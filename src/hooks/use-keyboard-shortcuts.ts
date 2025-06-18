import { useEffect } from 'react'

interface KeyboardShortcuts {
  onUndo?: () => void
  onRedo?: () => void
  onSave?: () => void
  enabled?: boolean
}

export function useKeyboardShortcuts({ onUndo, onRedo, onSave, enabled = true }: KeyboardShortcuts) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when not in input fields
      const target = event.target as HTMLElement
      const isInputField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable

      if (isInputField) return

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const ctrlKey = isMac ? event.metaKey : event.ctrlKey

      if (ctrlKey && !event.shiftKey && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        onUndo?.()
      } else if ((ctrlKey && event.shiftKey && event.key.toLowerCase() === 'z') ||
                 (ctrlKey && event.key.toLowerCase() === 'y')) {
        event.preventDefault()
        onRedo?.()
      } else if (ctrlKey && event.key.toLowerCase() === 's') {
        event.preventDefault()
        onSave?.()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onUndo, onRedo, onSave, enabled])
}