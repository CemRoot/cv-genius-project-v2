'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface TemplateLoadingWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function TemplateLoadingWrapper({ children, fallback }: TemplateLoadingWrapperProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    // Ensure DOM is ready
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 100)

    // Clear any stale service worker caches
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('cv-genius') && name.includes('dynamic')) {
            caches.delete(name)
          }
        })
      })
    }

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Loading Templates...</h2>
          <p className="text-gray-600">Preparing your design options</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}