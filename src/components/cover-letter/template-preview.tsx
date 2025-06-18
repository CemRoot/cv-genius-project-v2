'use client'

import { useState, useEffect } from 'react'
import { CoverLetterTemplate, CoverLetterContent } from '@/lib/cover-letter-templates'
import { Skeleton } from '@/components/ui/skeleton'

interface TemplatePreviewProps {
  templateId: string
  sampleData?: Partial<CoverLetterContent>
  className?: string
  showFullPreview?: boolean
  scale?: number
}

interface PreviewResponse {
  success: boolean
  template: CoverLetterTemplate
  previewHTML: string
  templateCSS: string
}

export function TemplatePreview({
  templateId,
  sampleData,
  className = '',
  showFullPreview = false,
  scale = 0.6
}: TemplatePreviewProps) {
  const [previewHTML, setPreviewHTML] = useState<string>('')
  const [templateCSS, setTemplateCSS] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPreview()
  }, [templateId, sampleData])

  const fetchPreview = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/cover-letter-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId,
          sampleData
        })
      })

      const data: PreviewResponse = await response.json()

      if (data.success) {
        setPreviewHTML(data.previewHTML)
        setTemplateCSS(data.templateCSS)
      } else {
        setError('Failed to load template preview')
      }
    } catch (err) {
      console.error('Error fetching template preview:', err)
      setError('Failed to load template preview')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`template-preview-container ${className}`}>
        <Skeleton className="w-full h-48" />
      </div>
    )
  }

  if (error) {
    return (
      <div className={`template-preview-container ${className}`}>
        <div className="flex items-center justify-center h-48 bg-red-50 border-2 border-red-200 rounded-lg">
          <div className="text-center">
            <svg className="w-12 h-12 text-red-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`template-preview-container ${className}`}>
      <style dangerouslySetInnerHTML={{ __html: templateCSS }} />
      <div 
        className={`template-preview ${showFullPreview ? 'full-preview' : ''}`}
        style={{ 
          transform: showFullPreview ? 'none' : `scale(${scale})`,
          transformOrigin: 'top left',
          width: showFullPreview ? '100%' : `${100 / scale}%`,
          height: showFullPreview ? 'auto' : `${100 / scale}%`
        }}
        dangerouslySetInnerHTML={{ __html: previewHTML }}
      />
    </div>
  )
}

// Full-size template viewer component
interface TemplateViewerProps {
  templateId: string
  userData: CoverLetterContent
  className?: string
  editable?: boolean
  onContentChange?: (content: CoverLetterContent) => void
}

export function TemplateViewer({
  templateId,
  userData,
  className = '',
  editable = false,
  onContentChange
}: TemplateViewerProps) {
  const [fullHTML, setFullHTML] = useState<string>('')
  const [templateCSS, setTemplateCSS] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    generateFullTemplate()
  }, [templateId, userData])

  const generateFullTemplate = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/cover-letter-templates/${templateId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userData,
          options: {
            includeFullHTML: true,
            editable
          }
        })
      })

      const data = await response.json()

      if (data.success) {
        setFullHTML(data.fullHTML)
        setTemplateCSS(data.css)
      } else {
        setError('Failed to generate template')
      }
    } catch (err) {
      console.error('Error generating template:', err)
      setError('Failed to generate template')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`template-viewer ${className}`}>
        <Skeleton className="w-full h-96" />
      </div>
    )
  }

  if (error) {
    return (
      <div className={`template-viewer ${className}`}>
        <div className="flex items-center justify-center h-96 bg-red-50 border-2 border-red-200 rounded-lg">
          <div className="text-center">
            <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-600 text-lg font-medium mb-2">Template Error</p>
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`template-viewer ${className}`}>
      <style dangerouslySetInnerHTML={{ __html: templateCSS }} />
      <div 
        className={`template-content ${editable ? 'editable' : ''}`}
        dangerouslySetInnerHTML={{ __html: fullHTML }}
      />
    </div>
  )
}

// Template comparison component
interface TemplateComparisonProps {
  templateIds: string[]
  sampleData?: Partial<CoverLetterContent>
  onSelect?: (templateId: string) => void
  selectedTemplate?: string
}

export function TemplateComparison({
  templateIds,
  sampleData,
  onSelect,
  selectedTemplate
}: TemplateComparisonProps) {
  return (
    <div className="template-comparison grid gap-6">
      {templateIds.map((templateId) => (
        <div 
          key={templateId}
          className={`template-comparison-item cursor-pointer transition-all duration-200 ${
            selectedTemplate === templateId 
              ? 'ring-2 ring-blue-500 shadow-lg' 
              : 'hover:shadow-md'
          }`}
          onClick={() => onSelect?.(templateId)}
        >
          <div className="template-header p-4 bg-gray-50 border-b">
            <h3 className="font-medium text-gray-900">Template {templateId}</h3>
            {selectedTemplate === templateId && (
              <div className="text-blue-600 text-sm font-medium">Selected</div>
            )}
          </div>
          <TemplatePreview 
            templateId={templateId}
            sampleData={sampleData}
            scale={0.5}
          />
        </div>
      ))}
    </div>
  )
}