'use client'

import React, { useState, useEffect } from 'react'
import { CvTemplate } from '@/lib/cv-templates/templates-data'
import { CvBuilderProvider } from '@/contexts/cv-builder-context'
import { CvBuilderInterface } from '@/components/cv-builder/cv-builder-interface'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Wand2 } from 'lucide-react'

interface TemplateBuilderPageProps {
  template: CvTemplate
  onBack: () => void
}

export function TemplateBuilderPage({ template, onBack }: TemplateBuilderPageProps) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading template data
    setTimeout(() => setIsLoading(false), 500)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading {template.name} template...</p>
        </div>
      </div>
    )
  }

  return (
    <CvBuilderProvider initialData={template.defaultData}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b sticky top-0 z-40">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Templates
                </Button>
                <div className="hidden md:block">
                  <h1 className="text-lg font-semibold text-gray-900">
                    Editing: {template.name}
                  </h1>
                  <p className="text-sm text-gray-500">{template.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Wand2 className="w-4 h-4" />
                  Template: {template.name}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* CV Builder Interface */}
        <div className="relative">
          {/* Apply template styling */}
          <style jsx global>{`
            .cv-preview {
              --cv-primary-color: ${template.styling.primaryColor};
              --cv-secondary-color: ${template.styling.secondaryColor};
              --cv-font-family: ${template.styling.fontFamily};
            }
            
            .cv-preview h1,
            .cv-preview h2,
            .cv-preview h3 {
              color: var(--cv-primary-color);
              font-family: var(--cv-font-family);
            }
            
            .cv-preview p,
            .cv-preview span,
            .cv-preview li {
              font-family: var(--cv-font-family);
            }
            
            .cv-preview .section-title {
              color: var(--cv-primary-color);
              ${template.styling.headerStyle === 'bold' ? 'font-weight: 700;' : ''}
              ${template.styling.headerStyle === 'minimal' ? 'font-weight: 400;' : ''}
            }
            
            ${template.styling.layout === 'two-column' ? `
              .cv-preview .cv-content {
                display: grid;
                grid-template-columns: 2fr 1fr;
                gap: 2rem;
              }
            ` : ''}
            
            ${template.styling.layout === 'modern-grid' ? `
              .cv-preview .cv-content {
                display: grid;
                grid-template-columns: 1fr 2fr;
                gap: 2rem;
              }
            ` : ''}
          `}</style>

          <CvBuilderInterface />
        </div>
      </div>
    </CvBuilderProvider>
  )
}