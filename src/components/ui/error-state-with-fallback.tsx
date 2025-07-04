import React from 'react'
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react'
import { Button } from './button'

interface ErrorStateWithFallbackProps {
  title?: string
  message?: string
  onReturnToTemplates: () => void
  onRetry?: () => void
  className?: string
}

export function ErrorStateWithFallback({
  title = "Template Error",
  message = "We're having trouble loading your CV template. Don't worry - your data is safe!",
  onReturnToTemplates,
  onRetry,
  className = ""
}: ErrorStateWithFallbackProps) {
  return (
    <div className={`flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-red-50 rounded-lg border border-red-200 ${className}`}>
      {/* Error Icon */}
      <div className="mb-6">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto" />
      </div>

      {/* Error Content */}
      <div className="mb-8 max-w-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          {title}
        </h2>
        <p className="text-gray-600 leading-relaxed">
          {message}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        {/* Primary: Template Selection Fallback - Attention-grabbing */}
        <Button
          onClick={onReturnToTemplates}
          className="
            relative overflow-hidden
            bg-blue-600 hover:bg-blue-700 text-white
            px-6 py-3 rounded-lg font-medium
            transition-all duration-200
            animate-pulse-subtle
            focus:ring-4 focus:ring-blue-300
            focus:outline-none
            shadow-lg hover:shadow-xl
            transform hover:scale-105
            w-full sm:flex-1
          "
          aria-label="Return to template selection to fix the error"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="font-semibold">Choose Template</span>
          
          {/* Subtle glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 animate-pulse-glow"></div>
        </Button>

        {/* Secondary: Retry (if available) */}
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            className="
              border-gray-300 text-gray-700 hover:bg-gray-50
              px-4 py-3 rounded-lg
              transition-colors duration-200
              w-full sm:w-auto
            "
            aria-label="Try loading the template again"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Retry
          </Button>
        )}
      </div>

      {/* Additional Help Text */}
      <div className="mt-6 text-sm text-gray-500 max-w-md">
        💡 <strong>Quick fix:</strong> Select a new template and your information will be preserved.
      </div>
    </div>
  )
}

// CSS-in-JS styles for the component (add to your global CSS or styled-components)
export const errorStateStyles = `
  /* Subtle pulse animation - accessibility friendly */
  @keyframes pulse-subtle {
    0%, 100% { 
      transform: scale(1);
      box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06);
    }
    50% { 
      transform: scale(1.02);
      box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.2), 0 4px 6px -2px rgba(59, 130, 246, 0.1);
    }
  }

  @keyframes pulse-glow {
    0%, 100% { opacity: 0; }
    50% { opacity: 0.1; }
  }

  .animate-pulse-subtle {
    animation: pulse-subtle 2s infinite;
  }

  .animate-pulse-glow {
    animation: pulse-glow 2s infinite;
  }

  /* Respect user preference for reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .animate-pulse-subtle,
    .animate-pulse-glow {
      animation: none;
    }
    
    /* Provide alternative visual emphasis without animation */
    .animate-pulse-subtle {
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
      border: 2px solid #3b82f6;
    }
  }

  /* Mobile optimizations */
  @media (max-width: 640px) {
    .animate-pulse-subtle {
      animation-duration: 2.5s; /* Slower on mobile for better UX */
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .animate-pulse-subtle {
      border: 3px solid currentColor;
      animation: none;
    }
  }
` 