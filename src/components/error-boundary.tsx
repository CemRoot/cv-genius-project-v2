"use client"

import React from 'react'
import '@/styles/404.css'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('CVGenius Error Boundary caught an error:', error, errorInfo)
    this.setState({ errorInfo })
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback

      if (FallbackComponent && this.state.error) {
        return <FallbackComponent error={this.state.error} retry={this.retry} />
      }

      return (
        <section className="page_404">
          <div className="container">
            <div className="row">
              <div className="col-sm-12">
                <div className="col-sm-10 col-sm-offset-1 text-center">
                  <div className="four_zero_four_bg">
                    <h1 className="text-center">ERROR</h1>
                  </div>
                  
                  <div className="contant_box_404">
                    <h3 className="h2">
                      Oops! Something went wrong
                    </h3>
                    
                    <p>Don't worry, your CV data is safe in your browser. This is just a temporary hiccup.</p>
                    
                    {this.state.error && (
                      <div className="error-details">
                        <p>
                          <strong>Error:</strong> {this.state.error.message}
                        </p>
                        {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                          <p style={{ marginTop: '10px', fontSize: '12px' }}>
                            <strong>Component Stack:</strong> {this.state.errorInfo.componentStack}
                          </p>
                        )}
                      </div>
                    )}
                    
                    <div className="button-group">
                      <button onClick={this.retry} className="link_404">
                        Try Again
                      </button>
                      <a href="/" className="link_404">
                        Go Home
                      </a>
                    </div>
                    
                    <p style={{ fontSize: '14px', color: '#666', marginTop: '20px' }}>
                      If this problem persists, please let us know in our WhatsApp or Slack community.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )
    }

    return this.props.children
  }
}

// Hook version for functional components
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const captureError = React.useCallback((error: Error) => {
    setError(error)
  }, [])

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return { captureError, resetError }
}

export default ErrorBoundary