'use client'

import React, { useState, useEffect } from 'react'
import { CvTemplate } from '@/lib/cv-templates/templates-data'
import { CvBuilderProvider } from '@/contexts/cv-builder-context'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Wand2, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import dynamic from 'next/dynamic'

// Dynamically import CV builder components for better mobile performance
const CvBuilderSidebar = dynamic(() => 
  import('@/components/cv-builder/cv-builder-sidebar').then(mod => ({ default: mod.CvBuilderSidebar })),
  { ssr: false }
)

const CvBuilderPreview = dynamic(() => 
  import('@/components/cv-builder/cv-builder-preview').then(mod => ({ default: mod.CvBuilderPreview })),
  { ssr: false }
)

const CvBuilderToolbar = dynamic(() => 
  import('@/components/cv-builder/cv-builder-toolbar').then(mod => ({ default: mod.CvBuilderToolbar })),
  { ssr: false }
)

interface MobileTemplateBuilderProps {
  template: CvTemplate
  onBack: () => void
}

export function MobileTemplateBuilder({ template, onBack }: MobileTemplateBuilderProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [showPreview, setShowPreview] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    // Simulate loading template data
    setTimeout(() => setIsLoading(false), 300)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading {template.name} template...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <CvBuilderProvider initialData={template.defaultData}>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <div className="bg-white shadow-sm border-b sticky top-0 z-40 lg:hidden">
          <div className="flex items-center justify-between p-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            
            <div className="flex-1 mx-3 text-center">
              <h1 className="text-sm font-semibold text-gray-900 truncate">
                {template.name}
              </h1>
            </div>
            
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[85%] max-w-sm p-0">
                <div className="h-full overflow-y-auto">
                  <div className="p-4 border-b">
                    <h2 className="text-lg font-semibold">Edit Sections</h2>
                  </div>
                  <CvBuilderSidebar />
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          {/* Mobile Action Bar */}
          <div className="flex items-center gap-2 p-3 border-t bg-gray-50">
            <Button
              variant={showPreview ? 'outline' : 'default'}
              size="sm"
              onClick={() => setShowPreview(false)}
              className="flex-1 text-xs"
            >
              Edit
            </Button>
            <Button
              variant={showPreview ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowPreview(true)}
              className="flex-1 text-xs"
            >
              Preview
            </Button>
            <div className="flex-1">
              <CvBuilderToolbar />
            </div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block bg-white shadow-sm border-b sticky top-0 z-40">
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
                <div>
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

        {/* Mobile Content */}
        <div className="lg:hidden">
          <AnimatePresence mode="wait">
            {!showPreview ? (
              <motion.div
                key="editor"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-4"
              >
                <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                  <h2 className="text-sm font-semibold text-gray-700 mb-2">
                    Tap the menu icon to edit sections
                  </h2>
                  <p className="text-xs text-gray-500">
                    Use the preview button to see your CV
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-4"
              >
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="transform scale-[0.6] sm:scale-75 origin-top">
                    <CvBuilderPreview />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Desktop Content */}
        <div className="hidden lg:block">
          <div className="flex h-[calc(100vh-73px)]">
            {/* Sidebar */}
            <div className="w-80 bg-white border-r overflow-y-auto">
              <CvBuilderSidebar />
            </div>
            
            {/* Preview */}
            <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
              <div className="max-w-4xl mx-auto">
                <CvBuilderPreview />
              </div>
            </div>
          </div>
        </div>

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
            @media (min-width: 768px) {
              .cv-preview .cv-content {
                display: grid;
                grid-template-columns: 2fr 1fr;
                gap: 2rem;
              }
            }
          ` : ''}
          
          ${template.styling.layout === 'modern-grid' ? `
            @media (min-width: 768px) {
              .cv-preview .cv-content {
                display: grid;
                grid-template-columns: 1fr 2fr;
                gap: 2rem;
              }
            }
          ` : ''}
        `}</style>
      </div>
    </CvBuilderProvider>
  )
}