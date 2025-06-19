'use client'

import { useEffect } from 'react'

export default function ClientViewportScript() {
  useEffect(() => {
    function setVH() {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', vh + 'px')
      document.documentElement.style.setProperty('--vh-full', window.innerHeight + 'px')
      document.documentElement.style.setProperty('--vh-small', (window.innerHeight * 0.01) + 'px')
    }

    // Set initial values
    setVH()

    // Add event listeners
    window.addEventListener('resize', setVH)
    window.addEventListener('orientationchange', () => setTimeout(setVH, 100))

    // Cleanup function
    return () => {
      window.removeEventListener('resize', setVH)
      window.removeEventListener('orientationchange', () => setTimeout(setVH, 100))
    }
  }, [])

  return null
} 