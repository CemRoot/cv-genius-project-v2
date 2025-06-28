'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react'

interface DebugInfo {
  port: string
  origin: string
  serviceWorker: boolean
  cacheStatus: string[]
  networkStatus: boolean
  localStorage: { [key: string]: any }
  sessionStorage: { [key: string]: any }
}

export function TemplateDebugPanel() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  const collectDebugInfo = async () => {
    const info: DebugInfo = {
      port: window.location.port || '80',
      origin: window.location.origin,
      serviceWorker: 'serviceWorker' in navigator,
      cacheStatus: [],
      networkStatus: navigator.onLine,
      localStorage: {},
      sessionStorage: {}
    }

    // Check cache status
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys()
        info.cacheStatus = cacheNames
      } catch (e) {
        info.cacheStatus = ['Error reading caches']
      }
    }

    // Get storage info
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.includes('cv')) {
          info.localStorage[key] = localStorage.getItem(key)
        }
      }
    } catch (e) {
      info.localStorage = { error: 'Failed to read localStorage' }
    }

    try {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key && key.includes('template')) {
          info.sessionStorage[key] = sessionStorage.getItem(key)
        }
      }
    } catch (e) {
      info.sessionStorage = { error: 'Failed to read sessionStorage' }
    }

    setDebugInfo(info)
  }

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      collectDebugInfo()
    }
  }, [])

  const clearCaches = async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.map(name => caches.delete(name)))
      await collectDebugInfo()
    }
  }

  const clearStorage = () => {
    localStorage.clear()
    sessionStorage.clear()
    window.location.reload()
  }

  if (process.env.NODE_ENV !== 'development' || !debugInfo) {
    return null
  }

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="fixed bottom-4 right-4 z-50"
        onClick={() => setIsVisible(!isVisible)}
      >
        Debug
      </Button>

      {isVisible && (
        <Card className="fixed bottom-16 right-4 z-50 w-96 max-h-96 overflow-auto p-4">
          <h3 className="font-semibold mb-4">Template Debug Info</h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium">Port:</span>
              <span className="font-mono">{debugInfo.port}</span>
              {debugInfo.port === '3000' ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-yellow-500" />
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium">Origin:</span>
              <span className="font-mono text-xs">{debugInfo.origin}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium">Network:</span>
              {debugInfo.networkStatus ? (
                <>
                  <span className="text-green-600">Online</span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </>
              ) : (
                <>
                  <span className="text-red-600">Offline</span>
                  <XCircle className="w-4 h-4 text-red-500" />
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium">Service Worker:</span>
              {debugInfo.serviceWorker ? (
                <>
                  <span className="text-green-600">Available</span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </>
              ) : (
                <>
                  <span className="text-gray-600">Not Available</span>
                  <XCircle className="w-4 h-4 text-gray-500" />
                </>
              )}
            </div>

            <div>
              <span className="font-medium">Caches:</span>
              <div className="mt-1 text-xs font-mono bg-gray-100 p-2 rounded">
                {debugInfo.cacheStatus.length > 0 
                  ? debugInfo.cacheStatus.join(', ')
                  : 'No caches found'}
              </div>
            </div>

            <div>
              <span className="font-medium">Session Storage:</span>
              <div className="mt-1 text-xs font-mono bg-gray-100 p-2 rounded max-h-24 overflow-auto">
                {Object.keys(debugInfo.sessionStorage).length > 0
                  ? JSON.stringify(debugInfo.sessionStorage, null, 2)
                  : 'No template data in session'}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button size="sm" onClick={collectDebugInfo} variant="outline">
                <RefreshCw className="w-3 h-3 mr-1" />
                Refresh
              </Button>
              <Button size="sm" onClick={clearCaches} variant="outline">
                Clear Caches
              </Button>
              <Button size="sm" onClick={clearStorage} variant="destructive">
                Clear All Storage
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  )
}