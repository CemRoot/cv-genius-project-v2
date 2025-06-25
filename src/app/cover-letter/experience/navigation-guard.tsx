'use client'

import { useEffect, useRef } from 'react'
import { useCoverLetter } from '@/contexts/cover-letter-context'

export function NavigationGuard({ children }: { children: React.ReactNode }) {
  const { state, setCreationMode } = useCoverLetter()
  const hasSetCreationMode = useRef(false)

  useEffect(() => {
    // If no creation mode is set, default to 'create' mode
    // This handles the case where users come directly from the landing page
    // Use ref to ensure this only happens once
    if (!state.creationMode && !hasSetCreationMode.current) {
      hasSetCreationMode.current = true
      setCreationMode('create')
    }
  }, [state.creationMode, setCreationMode])

  return <>{children}</>
}