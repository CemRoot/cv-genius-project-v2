'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { X, Download } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useResponsive } from '@/hooks/use-responsive'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true)
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const { isMobile } = useResponsive()

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      registerServiceWorker()
    }

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }
  }, [])

  // Network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Initial check
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const registerServiceWorker = async () => {
    try {
      // Check if service worker file exists first
      const swResponse = await fetch('/sw.js', { method: 'HEAD' })
      if (!swResponse.ok) {
        console.warn('[PWA] Service Worker file not found, skipping registration')
        return
      }

      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'imports'
      })
      console.log('[PWA] Service Worker registered:', registration)
      setSwRegistration(registration)

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true)
            }
          })
        }
      })

      // Check for updates periodically (only in production)
      if (process.env.NODE_ENV === 'production') {
        setInterval(() => {
          registration.update()
        }, 60 * 60 * 1000) // Every hour
      }
    } catch (error) {
      // Don't show errors in development to avoid confusion
      if (process.env.NODE_ENV === 'production') {
        console.error('[PWA] Service Worker registration failed:', error)
      } else {
        console.warn('[PWA] Service Worker registration failed (development):', error)
      }
    }
  }

  const handleInstall = async () => {
    if (!installPrompt) return

    try {
      await installPrompt.prompt()
      const { outcome } = await installPrompt.userChoice
      
      if (outcome === 'accepted') {
        setIsInstalled(true)
        setInstallPrompt(null)
      }
    } catch (error) {
      console.error('[PWA] Install failed:', error)
    }
  }

  const handleUpdate = () => {
    if (swRegistration?.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }

  return (
    <>
      {children}

      {/* Offline indicator */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white p-2 text-center"
          >
            <p className="text-sm font-medium">
              You're offline. Some features may be limited.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Update available notification */}
      <AnimatePresence>
        {updateAvailable && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed ${isMobile ? 'bottom-20' : 'bottom-4'} left-4 right-4 z-50 max-w-md mx-auto`}
          >
            <Card className="p-4 shadow-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm mb-1">
                    Update Available
                  </h3>
                  <p className="text-sm text-gray-600">
                    A new version of CV Genius is available.
                  </p>
                </div>
                <button
                  onClick={() => setUpdateAvailable(false)}
                  className="ml-4 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <Button
                onClick={handleUpdate}
                size="sm"
                className="mt-3 w-full"
              >
                Update Now
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Install prompt */}
      <AnimatePresence>
        {installPrompt && !isInstalled && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed ${isMobile ? 'bottom-20' : 'bottom-4'} left-4 right-4 z-50 max-w-md mx-auto`}
          >
            <Card className="p-4 shadow-lg bg-gradient-to-r from-cvgenius-purple to-purple-700 text-white">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm mb-1 flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Install CV Genius
                  </h3>
                  <p className="text-sm opacity-90">
                    Install our app for offline access and better performance
                  </p>
                </div>
                <button
                  onClick={() => setInstallPrompt(null)}
                  className="ml-4 text-white/60 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-2 mt-3">
                <Button
                  onClick={handleInstall}
                  size="sm"
                  variant="secondary"
                  className="flex-1"
                >
                  Install
                </Button>
                <Button
                  onClick={() => setInstallPrompt(null)}
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                >
                  Not Now
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Hook to access PWA features
export function usePWA() {
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // Check if installable
    const checkInstallable = (e: Event) => {
      e.preventDefault()
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', checkInstallable)

    // Check if installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }

    // Check online status
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('beforeinstallprompt', checkInstallable)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return {
    isInstallable,
    isInstalled,
    isOnline,
    isPWA: 'serviceWorker' in navigator
  }
}