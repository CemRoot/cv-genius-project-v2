import { useCallback } from 'react'
import { formatTextInput } from '@/lib/utils'

export function useTextCleaning() {
  const handlePaste = useCallback((
    event: React.ClipboardEvent<HTMLTextAreaElement | HTMLInputElement>,
    setValue: (value: string) => void
  ) => {
    // Clean pasted text from PDF after paste completes
    setTimeout(() => {
      const currentValue = event.currentTarget.value
      const cleanedValue = formatTextInput(currentValue)
      if (cleanedValue !== currentValue) {
        setValue(cleanedValue)
      }
    }, 10)
  }, [])

  return { handlePaste }
}