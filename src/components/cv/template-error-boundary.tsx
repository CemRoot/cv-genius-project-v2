'use client'

import React from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { templateHealthChecker } from '@/lib/template-health-checker'

interface TemplateErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  healthReport: string | null
}

interface TemplateErrorBoundaryProps {
  children: React.ReactNode
  templateId?: string
  fallback?: React.ComponentType<{
    error: Error
    resetError: () => void
    templateId?: string
  }>
}

export class TemplateErrorBoundary extends React.Component<
  TemplateErrorBoundaryProps,
  TemplateErrorBoundaryState
> {
  constructor(props: TemplateErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      healthReport: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<TemplateErrorBoundaryState> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Template Error Boundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Generate health report for debugging
    if (process.env.NODE_ENV === 'development') {
      templateHealthChecker.generateReport().then(report => {
        this.setState({ healthReport: report })
        console.log('Template Health Report:', report)
      })
    }

    // Auto-repair attempt
    templateHealthChecker.autoRepair().then(repairs => {
      if (repairs.length > 0) {
        console.log('Auto-repairs performed:', repairs)
        // Optionally auto-retry after repairs
        setTimeout(() => {
          this.handleRetry()
        }, 1000)
      }
    })
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      healthReport: null
    })
  }

  handleReset = () => {
    // Clear template cache and reset
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cvgenius-template')
      localStorage.removeItem('cvgenius-cv-data')
    }
    this.handleRetry()
  }

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, healthReport } = this.state
      const { templateId, fallback: Fallback } = this.props

      // Use custom fallback if provided
      if (Fallback) {
        return (
          <Fallback
            error={error!}
            resetError={this.handleRetry}
            templateId={templateId}
          />
        )
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <AlertTriangle className="w-16 h-16 text-red-500" />
                </div>
                
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Template Rendering Error
                  </h1>
                  <p className="text-gray-600">
                    Something went wrong while loading the CV template.
                    {templateId && ` (Template: ${templateId})`}
                  </p>
                </div>

                {process.env.NODE_ENV === 'development' && error && (
                  <div className="text-left bg-red-50 p-4 rounded-lg border border-red-200">
                    <h3 className="font-semibold text-red-900 mb-2">Error Details:</h3>
                    <p className="text-sm text-red-800 font-mono">{error.message}</p>
                    {errorInfo && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-red-700">Stack Trace</summary>
                        <pre className="text-xs mt-2 text-red-600 overflow-auto">
                          {errorInfo.componentStack}
                        </pre>
                      </details>
                    )}
                  </div>
                )}

                {process.env.NODE_ENV === 'development' && healthReport && (
                  <div className="text-left bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-2">Health Report:</h3>
                    <pre className="text-xs text-blue-800 overflow-auto whitespace-pre-wrap">
                      {healthReport}
                    </pre>
                  </div>
                )}

                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={this.handleRetry}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Retry Template
                  </Button>
                  
                  <Button
                    onClick={this.handleReset}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reset & Clear Cache
                  </Button>

                  <Button
                    onClick={() => window.location.href = '/'}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Home className="w-4 h-4" />
                    Go Home
                  </Button>
                </div>

                <div className="text-sm text-gray-500">
                  <p>If this issue persists:</p>
                  <ul className="mt-2 space-y-1">
                    <li>• Try clearing your browser cache (Cmd+Shift+R)</li>
                    <li>• Check your internet connection</li>
                    <li>• Try a different template</li>
                    <li>• Contact support if the problem continues</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Higher-order component for easier use
export function withTemplateErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  templateId?: string
) {
  return function WrappedComponent(props: P) {
    return (
      <TemplateErrorBoundary templateId={templateId}>
        <Component {...props} />
      </TemplateErrorBoundary>
    )
  }
}

// Hook for manual error reporting
export function useTemplateErrorReporting() {
  const reportError = React.useCallback((error: Error, context?: string) => {
    console.error(`Template Error ${context ? `(${context})` : ''}:`, error)
    
    if (process.env.NODE_ENV === 'development') {
      templateHealthChecker.generateReport().then(report => {
        console.log('Health report after error:', report)
      })
    }
  }, [])

  return { reportError }
} 