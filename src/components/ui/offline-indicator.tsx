'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wifi, WifiOff, CloudOff, Cloud, CheckCircle } from 'lucide-react'

interface OfflineIndicatorProps {
  className?: string
  showOnlineStatus?: boolean
}

export function OfflineIndicator({ className = '', showOnlineStatus = false }: OfflineIndicatorProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [showIndicator, setShowIndicator] = useState(false)

  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine
      setIsOnline(online)
      
      // Show indicator when going offline or coming back online
      if (!online || (online && !isOnline)) {
        setShowIndicator(true)
        // Hide after 3 seconds when back online
        if (online) {
          setTimeout(() => setShowIndicator(false), 3000)
        }
      }
    }

    updateOnlineStatus()
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [isOnline])

  if (!showIndicator && !showOnlineStatus) return null
  if (isOnline && !showOnlineStatus && showIndicator === false) return null

  return (
    <AnimatePresence>
      {(showIndicator || showOnlineStatus) && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed top-4 right-4 z-50 ${className}`}
        >
          <div 
            className={`px-4 py-2 rounded-lg shadow-lg border backdrop-blur-sm flex items-center gap-2 text-sm font-medium ${
              isOnline 
                ? 'bg-green-50/90 border-green-200 text-green-800' 
                : 'bg-red-50/90 border-red-200 text-red-800'
            }`}
          >
            {isOnline ? (
              <>
                <Wifi className="h-4 w-4" />
                <span>Back Online</span>
                <CheckCircle className="h-4 w-4" />
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4" />
                <span>Working Offline</span>
                <CloudOff className="h-4 w-4" />
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Simple hook for offline status
export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine)
    
    updateOnlineStatus()
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  return isOnline
}