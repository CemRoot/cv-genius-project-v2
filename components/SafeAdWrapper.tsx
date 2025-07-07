'use client'

import { useState, useEffect, ReactNode } from 'react'

interface SafeAdWrapperProps {
  children: ReactNode
  fallbackHeight?: string
  name?: string
}

export function SafeAdWrapper({ 
  children, 
  fallbackHeight = '250px',
  name = 'Ad Component'
}: SafeAdWrapperProps) {
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    try {
      // Wait for hydration to complete
      setMounted(true)
      
      // Debug logging for production
      if (process.env.NODE_ENV === 'production') {
        console.log(`[${name}] Mounted successfully`)
      }
    } catch (err) {
      console.error(`[${name}] Mount error:`, err)
      setError(err as Error)
    }
  }, [name])

  // Global error handler for React Hook errors
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleError = (event: ErrorEvent) => {
      if (event.error?.message?.includes('Hook') || 
          event.error?.message?.includes('Rendered more hooks')) {
        console.error(`[${name}] Hook Error:`, {
          message: event.error.message,
          stack: event.error.stack,
          timestamp: new Date().toISOString(),
          component: name
        })
        setError(event.error)
        event.preventDefault() // Prevent default error handling
      }
    }

    window.addEventListener('error', handleError)
    
    return () => {
      window.removeEventListener('error', handleError)
    }
  }, [name])

  // Show loading state during hydration
  if (!mounted) {
    return (
      <div 
        style={{ 
          minHeight: fallbackHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px'
        }}
      >
        <div style={{ textAlign: 'center', color: '#6b7280' }}>
          <div>Loading {name}...</div>
          {process.env.NODE_ENV === 'development' && (
            <div style={{ fontSize: '12px', marginTop: '4px' }}>
              Waiting for hydration
            </div>
          )}
        </div>
      </div>
    )
  }

  // Show error state if there was a problem
  if (error) {
    return process.env.NODE_ENV === 'development' ? (
      <div 
        style={{ 
          minHeight: fallbackHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '16px'
        }}
      >
        <div style={{ textAlign: 'center', color: '#dc2626' }}>
          <div>❌ {name} Error</div>
          <div style={{ fontSize: '12px', marginTop: '8px', fontFamily: 'monospace' }}>
            {error.message}
          </div>
        </div>
      </div>
    ) : null // Hide errors in production
  }

  // Render children safely
  return <>{children}</>
}