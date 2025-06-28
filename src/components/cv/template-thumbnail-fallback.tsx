'use client'

import { useState } from 'react'
import { TemplateThumbnail } from './template-thumbnail'
import { AlertCircle } from 'lucide-react'

interface TemplateThumbnailWithFallbackProps {
  templateId: string
  className?: string
}

export function TemplateThumbnailWithFallback({ 
  templateId, 
  className = '' 
}: TemplateThumbnailWithFallbackProps) {
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return (
      <div className={`w-full h-full bg-gray-100 flex items-center justify-center ${className}`}>
        <div className="text-center p-4">
          <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Template preview unavailable</p>
        </div>
      </div>
    )
  }

  // Directly render the template thumbnail without loading state
  return (
    <div 
      className={`w-full h-full ${className}`}
      onError={() => setHasError(true)}
    >
      <TemplateThumbnail templateId={templateId} />
    </div>
  )
}