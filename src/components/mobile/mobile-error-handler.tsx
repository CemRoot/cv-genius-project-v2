'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, WifiOff, Battery, RefreshCw, X, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface MobileError {
  id: string
  type: 'network' | 'battery' | 'permission' | 'storage' | 'general'
  title: string
  message: string
  action?: () => void
  actionLabel?: string
  dismissible?: boolean
}

export function useMobileErrorHandler() {
  const [errors, setErrors] = useState<MobileError[]>([])
  const [isOnline, setIsOnline] = useState(true)
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null)

  // Network monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      removeError('network-offline')
    }

    const handleOffline = () => {
      setIsOnline(false)
      addError({
        id: 'network-offline',
        type: 'network',
        title: 'No Internet Connection',
        message: 'Please check your connection and try again',
        dismissible: false
      })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Initial check
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Battery monitoring
  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const updateBatteryLevel = () => {
          setBatteryLevel(battery.level)
          
          if (battery.level < 0.15 && !battery.charging) {
            addError({
              id: 'low-battery',
              type: 'battery',
              title: 'Low Battery',
              message: 'Your device is running low on battery. Save your work frequently.',
              dismissible: true
            })
          } else {
            removeError('low-battery')
          }
        }

        updateBatteryLevel()
        battery.addEventListener('levelchange', updateBatteryLevel)
        battery.addEventListener('chargingchange', updateBatteryLevel)
      })
    }
  }, [])

  const addError = (error: MobileError) => {
    setErrors(prev => {
      const exists = prev.find(e => e.id === error.id)
      if (exists) return prev
      
      // Haptic feedback for errors
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100])
      }
      
      return [...prev, error]
    })
  }

  const removeError = (id: string) => {
    setErrors(prev => prev.filter(e => e.id !== id))
  }

  const checkPermission = async (permission: 'camera' | 'microphone') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: permission === 'camera',
        audio: permission === 'microphone'
      })
      stream.getTracks().forEach(track => track.stop())
      return true
    } catch (error) {
      addError({
        id: `permission-${permission}`,
        type: 'permission',
        title: `${permission === 'camera' ? 'Camera' : 'Microphone'} Access Denied`,
        message: `Please enable ${permission} access in your device settings`,
        action: () => {
          // Open settings (platform specific)
          alert(`Please go to Settings > Safari > Camera/Microphone and enable access for this website`)
        },
        actionLabel: 'Open Settings',
        dismissible: true
      })
      return false
    }
  }

  const checkStorage = async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const { usage, quota } = await navigator.storage.estimate()
      const percentUsed = usage && quota ? (usage / quota) * 100 : 0
      
      if (percentUsed > 90) {
        addError({
          id: 'storage-full',
          type: 'storage',
          title: 'Storage Almost Full',
          message: 'Your device is running out of storage space',
          action: () => {
            // Clear cache or old data
            localStorage.clear()
            removeError('storage-full')
          },
          actionLabel: 'Clear Cache',
          dismissible: true
        })
      }
    }
  }

  return {
    errors,
    addError,
    removeError,
    isOnline,
    batteryLevel,
    checkPermission,
    checkStorage
  }
}

interface MobileErrorDisplayProps {
  errors: MobileError[]
  onDismiss: (id: string) => void
}

export function MobileErrorDisplay({ errors, onDismiss }: MobileErrorDisplayProps) {
  const getIcon = (type: MobileError['type']) => {
    switch (type) {
      case 'network':
        return <WifiOff className="w-5 h-5" />
      case 'battery':
        return <Battery className="w-5 h-5" />
      case 'permission':
        return <AlertTriangle className="w-5 h-5" />
      case 'storage':
        return <AlertCircle className="w-5 h-5" />
      default:
        return <AlertCircle className="w-5 h-5" />
    }
  }

  const getColor = (type: MobileError['type']) => {
    switch (type) {
      case 'network':
        return 'bg-blue-50 border-blue-200 text-blue-900'
      case 'battery':
        return 'bg-orange-50 border-orange-200 text-orange-900'
      case 'permission':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900'
      case 'storage':
        return 'bg-purple-50 border-purple-200 text-purple-900'
      default:
        return 'bg-red-50 border-red-200 text-red-900'
    }
  }

  return (
    <AnimatePresence>
      {errors.map((error, index) => (
        <motion.div
          key={error.id}
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className={`fixed top-${4 + index * 20} left-4 right-4 z-50`}
          style={{ top: `${1 + index * 5}rem` }}
        >
          <Card className={`p-4 border ${getColor(error.type)}`}>
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{getIcon(error.type)}</div>
              
              <div className="flex-1">
                <h4 className="font-semibold text-sm">{error.title}</h4>
                <p className="text-sm mt-1 opacity-90">{error.message}</p>
                
                {error.action && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={error.action}
                    className="mt-3"
                  >
                    {error.actionLabel || 'Fix'}
                  </Button>
                )}
              </div>
              
              {error.dismissible !== false && (
                <button
                  onClick={() => onDismiss(error.id)}
                  className="p-1 hover:bg-black/10 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </Card>
        </motion.div>
      ))}
    </AnimatePresence>
  )
}

// Toast-style error notifications
export function MobileErrorToast({ 
  error, 
  onDismiss 
}: { 
  error: MobileError
  onDismiss: () => void 
}) {
  useEffect(() => {
    if (error.dismissible !== false) {
      const timer = setTimeout(onDismiss, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, onDismiss])

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-20 left-4 right-4 z-50"
    >
      <Card className="p-4 bg-gray-900 text-white border-gray-800">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <div className="flex-1">
            <p className="font-medium">{error.title}</p>
            <p className="text-sm opacity-90">{error.message}</p>
          </div>
          {error.action && (
            <Button
              size="sm"
              variant="ghost"
              onClick={error.action}
              className="text-white hover:bg-white/20"
            >
              {error.actionLabel || 'Retry'}
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  )
}