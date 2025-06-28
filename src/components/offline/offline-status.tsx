'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff, Wifi, Cloud, CloudOff, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useOfflineCV } from '@/lib/offline-storage'
import { ResponsiveText } from '@/components/responsive/responsive-text'

interface OfflineStatusProps {
  className?: string
  showSyncStatus?: boolean
}

export function OfflineStatus({ className, showSyncStatus = true }: OfflineStatusProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [showStatus, setShowStatus] = useState(false)
  const { syncStatus } = useOfflineCV()

  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine
      setIsOnline(online)
      
      // Show status briefly when connection changes
      setShowStatus(true)
      if (online) {
        setTimeout(() => setShowStatus(false), 3000)
      }
    }

    // Initial check
    updateOnlineStatus()

    // Listen for changes
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  return (
    <AnimatePresence>
      {(showStatus || !isOnline || (showSyncStatus && syncStatus.pendingCount > 0)) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={cn(
            'fixed top-0 left-0 right-0 z-50',
            className
          )}
        >
          <div className={cn(
            'px-4 py-2 text-center',
            isOnline ? 'bg-green-500' : 'bg-orange-500',
            'text-white transition-colors duration-300'
          )}>
            <div className="flex items-center justify-center gap-2">
              {isOnline ? (
                <>
                  <Wifi className="w-4 h-4" />
                  <ResponsiveText size="sm" className="font-medium">
                    Back online
                  </ResponsiveText>
                  {syncStatus.pendingCount > 0 && (
                    <>
                      <span className="mx-2">•</span>
                      {syncStatus.isSyncing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Syncing {syncStatus.pendingCount} changes...</span>
                        </>
                      ) : (
                        <span>{syncStatus.pendingCount} changes pending sync</span>
                      )}
                    </>
                  )}
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4" />
                  <ResponsiveText size="sm" className="font-medium">
                    You're offline - changes will be saved locally
                  </ResponsiveText>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Compact offline indicator
export function CompactOfflineIndicator({ className }: { className?: string }) {
  const [isOnline, setIsOnline] = useState(true)
  const { syncStatus } = useOfflineCV()

  useEffect(() => {
    const updateStatus = () => setIsOnline(navigator.onLine)
    
    updateStatus()
    window.addEventListener('online', updateStatus)
    window.addEventListener('offline', updateStatus)

    return () => {
      window.removeEventListener('online', updateStatus)
      window.removeEventListener('offline', updateStatus)
    }
  }, [])

  if (isOnline && syncStatus.pendingCount === 0) return null

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {!isOnline ? (
        <div className="flex items-center gap-1.5 px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
          <CloudOff className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">Offline</span>
        </div>
      ) : syncStatus.pendingCount > 0 ? (
        <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
          {syncStatus.isSyncing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Cloud className="w-3.5 h-3.5" />
          )}
          <span className="text-xs font-medium">
            {syncStatus.pendingCount} pending
          </span>
        </div>
      ) : null}
    </div>
  )
}

// Offline save indicator
interface OfflineSaveIndicatorProps {
  isSaving: boolean
  isOffline: boolean
  className?: string
}

export function OfflineSaveIndicator({ 
  isSaving, 
  isOffline, 
  className 
}: OfflineSaveIndicatorProps) {
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (!isSaving && showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [isSaving, showSuccess])

  useEffect(() => {
    if (!isSaving) {
      setShowSuccess(true)
    }
  }, [isSaving])

  return (
    <AnimatePresence mode="wait">
      {(isSaving || showSuccess) && (
        <motion.div
          key={isSaving ? 'saving' : 'saved'}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={cn(
            'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm',
            isSaving 
              ? 'bg-gray-100 text-gray-700' 
              : 'bg-green-100 text-green-700',
            className
          )}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Saving{isOffline ? ' offline' : ''}...</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Saved{isOffline ? ' offline' : ''}</span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}