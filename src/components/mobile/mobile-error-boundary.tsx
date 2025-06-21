'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, WifiOff, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  isOnline: boolean
  errorCount: number
}

export class MobileErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
      errorCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      isOnline: true,
      errorCount: 0
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Mobile Error Boundary caught an error:', error, errorInfo)
    
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }))

    // Log to error reporting service in production
    if (process.env.NODE_ENV === 'production') {
      // logErrorToService(error, errorInfo)
    }
  }

  componentDidMount() {
    // Monitor online/offline status
    window.addEventListener('online', this.handleOnline)
    window.addEventListener('offline', this.handleOffline)
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.handleOnline)
    window.removeEventListener('offline', this.handleOffline)
  }

  handleOnline = () => {
    this.setState({ isOnline: true })
  }

  handleOffline = () => {
    this.setState({ isOnline: false })
  }

  handleReset = () => {
    // Haptic feedback on mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(10)
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    })
  }

  handleReload = () => {
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10)
    }
    window.location.reload()
  }

  handleGoHome = () => {
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10)
    }
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Custom fallback provided
      if (this.props.fallback) {
        return <>{this.props.fallback}</>
      }

      const { error, isOnline, errorCount } = this.state
      const isNetworkError = !isOnline || error.message.includes('fetch') || error.message.includes('network')
      
      return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md w-full"
            >
              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 space-y-6">
                {/* Error Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="flex justify-center"
                >
                  <div className={`p-4 rounded-full ${isNetworkError ? 'bg-orange-100' : 'bg-red-100'}`}>
                    {isNetworkError ? (
                      <WifiOff className="h-12 w-12 text-orange-600" />
                    ) : (
                      <AlertTriangle className="h-12 w-12 text-red-600" />
                    )}
                  </div>
                </motion.div>

                {/* Error Message */}
                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {isNetworkError ? 'Connection Lost' : 'Oops! Something went wrong'}
                  </h1>
                  <p className="text-gray-600">
                    {isNetworkError 
                      ? "Please check your internet connection and try again."
                      : "Don't worry, your work is safe. Let's get you back on track."}
                  </p>
                </div>

                {/* Error Details (Development only) */}
                {process.env.NODE_ENV === 'development' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gray-50 rounded-lg p-4 text-xs font-mono text-gray-600 max-h-32 overflow-auto"
                  >
                    {error.message}
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={this.handleReload}
                    size="lg"
                    className="w-full h-12 text-base font-medium"
                    loading={false}
                  >
                    <RefreshCw className="h-5 w-5 mr-2" />
                    Try Again
                  </Button>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={this.handleGoHome}
                      variant="outline"
                      size="lg"
                      className="h-12 text-base"
                    >
                      <Home className="h-5 w-5 mr-2" />
                      Home
                    </Button>
                    
                    <Button
                      onClick={() => {
                        // Open email client with error report
                        const subject = encodeURIComponent('CV Genius Error Report')
                        const body = encodeURIComponent(`Error: ${error.message}\n\nPlease describe what you were doing when this error occurred:`)
                        window.location.href = `mailto:support@cvgenius.ie?subject=${subject}&body=${body}`
                      }}
                      variant="outline"
                      size="lg"
                      className="h-12 text-base"
                    >
                      <Send className="h-5 w-5 mr-2" />
                      Report
                    </Button>
                  </div>
                </div>

                {/* Additional Help */}
                <div className="text-center text-sm text-gray-500">
                  {errorCount > 2 && (
                    <p className="mb-2 text-orange-600">
                      This error keeps happening. Try clearing your browser cache.
                    </p>
                  )}
                  <p>
                    Need help? Contact us at{' '}
                    <a href="mailto:support@cvgenius.ie" className="text-blue-600 underline">
                      support@cvgenius.ie
                    </a>
                  </p>
                </div>

                {/* Offline Indicator */}
                {!isOnline && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center gap-2"
                  >
                    <WifiOff className="h-4 w-4 text-orange-600" />
                    <span className="text-sm text-orange-700">You're currently offline</span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook for functional components
export function useMobileErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  const resetError = () => setError(null)
  const throwError = (error: Error) => setError(error)

  return { throwError, resetError }
}