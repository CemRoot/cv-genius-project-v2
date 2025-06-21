'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { WifiOff, RefreshCw, Home, FileText, Settings } from 'lucide-react'

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true)
  const [lastSync, setLastSync] = useState<Date | null>(null)

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine)

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true)
      setLastSync(new Date())
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleRetry = () => {
    if (navigator.onLine) {
      window.location.reload()
    }
  }

  const handleGoHome = () => {
    window.location.href = '/'
  }

  const handleViewCachedContent = () => {
    // Navigate to cached content
    window.location.href = '/builder'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 p-3 rounded-full bg-gray-100 dark:bg-gray-800 w-16 h-16 flex items-center justify-center">
              <WifiOff className="h-8 w-8 text-gray-600 dark:text-gray-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              You're Offline
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              {isOnline 
                ? "Connection restored! You can retry loading the page."
                : "No internet connection detected. You can still access some features."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Connection Status */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </span>
              <div className="flex items-center space-x-2">
                <div 
                  className={`w-2 h-2 rounded-full ${
                    isOnline ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>

            {/* Last Sync Info */}
            {lastSync && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Last Sync
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {lastSync.toLocaleTimeString()}
                </span>
              </div>
            )}

            {/* Available Offline Features */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Available Offline:
              </h3>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-3 p-2 rounded-md bg-green-50 dark:bg-green-900/20">
                  <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-green-700 dark:text-green-300">
                    CV Builder (cached templates)
                  </span>
                </div>
                
                <div className="flex items-center space-x-3 p-2 rounded-md bg-green-50 dark:bg-green-900/20">
                  <Settings className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-green-700 dark:text-green-300">
                    Previous CV drafts
                  </span>
                </div>
                
                <div className="flex items-center space-x-3 p-2 rounded-md bg-yellow-50 dark:bg-yellow-900/20">
                  <WifiOff className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-sm text-yellow-700 dark:text-yellow-300">
                    ATS Check (requires connection)
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              {isOnline ? (
                <Button 
                  onClick={handleRetry}
                  className="w-full"
                  size="lg"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Page
                </Button>
              ) : (
                <Button 
                  onClick={handleViewCachedContent}
                  className="w-full"
                  size="lg"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Continue Building CV
                </Button>
              )}
              
              <Button 
                onClick={handleGoHome}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Home className="h-4 w-4 mr-2" />
                Go to Home
              </Button>
            </div>

            {/* Offline Tips */}
            <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
                💡 Offline Tips
              </h4>
              <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                <li>• Your CV drafts are saved locally</li>
                <li>• Templates are cached for offline use</li>
                <li>• Changes will sync when connection returns</li>
                <li>• Voice features work without internet</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Debug Info (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="mt-4 opacity-75">
            <CardContent className="pt-4">
              <h4 className="text-sm font-semibold mb-2">Debug Info</h4>
              <div className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
                <div>Navigator Online: {navigator.onLine ? 'true' : 'false'}</div>
                <div>User Agent: {navigator.userAgent.slice(0, 50)}...</div>
                <div>Timestamp: {new Date().toISOString()}</div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}