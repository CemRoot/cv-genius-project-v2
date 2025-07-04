'use client'

import { useState, useEffect, useMemo } from 'react'
import { StaticTemplateGallery } from './components/static-template-gallery'
import { SimpleMultiStepForm } from './components/simple-multi-step-form'
import { SimpleSplitView } from './components/simple-split-view'
import { useCVStore } from '@/store/cv-store'
import { IrishCVTemplateManager } from '@/lib/irish-cv-template-manager'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Eye, Settings } from 'lucide-react'
import { ExportButton } from '@/components/cv/export-button'
import SectionReorderPanel from '@/components/cv/section-reorder-panel'

export function WebBuilderFlow() {
  const { currentCV, sessionState, updateSessionState } = useCVStore()
  
  // Initialize from sessionState or check if user has existing CV data
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(sessionState.selectedTemplateId || null)
  const [currentStep, setCurrentStep] = useState<'template' | 'form'>(() => {
    // If user has sessionState template OR existing CV data, skip template selection
    if (sessionState.selectedTemplateId || 
        (currentCV && currentCV.template && (
          currentCV.personal.fullName || 
          currentCV.experience.length > 0 || 
          currentCV.education.length > 0
        ))) {
      return 'form'
    }
    return 'template'
  })
  
  const [previewHtml, setPreviewHtml] = useState<string>('')
  const [previewCss, setPreviewCss] = useState<string>('')
  const [showSectionReorder, setShowSectionReorder] = useState<boolean>(false)
  
  // Create template manager instance
  const templateManager = useMemo(() => new IrishCVTemplateManager(), [])
  
  // Initialize - restore session state or determine from CV data
  useEffect(() => {
    // Priority 1: Use sessionState if available
    if (sessionState.selectedTemplateId) {
      setSelectedTemplate(sessionState.selectedTemplateId)
      setCurrentStep('form')
    } 
    // Priority 2: Use template from existing CV data (even if CV is empty)
    else if (currentCV && currentCV.template) {
      setSelectedTemplate(currentCV.template)
      setCurrentStep('form')
      // Update session state to reflect this
      updateSessionState({ selectedTemplateId: currentCV.template })
    } 
    // Priority 3: Force template selection only if no template exists
    else {
      sessionStorage.removeItem('selectedTemplate')
      setSelectedTemplate(null)
      setCurrentStep('template')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCV, sessionState.selectedTemplateId])
  
  // Update session state when template selection changes
  useEffect(() => {
    if (selectedTemplate) {
      updateSessionState({ 
        selectedTemplateId: selectedTemplate,
        builderMode: 'form'
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTemplate])
  
  // Debug: Her render'da state'i logla
  console.log('🟡 WebBuilderFlow RENDER:', { 
    selectedTemplate, 
    currentStep,
    willShowGallery: !selectedTemplate,
    sessionState: sessionState.selectedTemplateId,
    hasExistingData: !!(currentCV && (currentCV.personal.fullName || currentCV.experience.length > 0))
  })
  
  // Update preview when CV data changes
  useEffect(() => {
    if (selectedTemplate) {
      try {
        templateManager.selectTemplate(selectedTemplate)
        const html = templateManager.renderCV(currentCV || {
          personal: {
            fullName: '',
            email: '',
            phone: '',
            address: ''
          },
          experience: [],
          education: [],
          skills: [],
          projects: [],
          certifications: [],
          languages: [],
          interests: [],
          references: []
        })
        const css = templateManager.getTemplateCSS()
        setPreviewHtml(html)
        setPreviewCss(css)
      } catch (error) {
        console.error('Preview update error:', error)
        // Clear preview on error
        setPreviewHtml('')
        setPreviewCss('')
      }
    } else {
      // Clear preview when no template selected
      setPreviewHtml('')
      setPreviewCss('')
    }
  }, [currentCV, selectedTemplate, templateManager])

  // Show template gallery when no template is selected
  if (!selectedTemplate) {
    return (
      <StaticTemplateGallery 
        onSelectTemplate={(templateId) => {
          setSelectedTemplate(templateId)
          setCurrentStep('form')
          sessionStorage.setItem('selectedTemplate', templateId)
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleSplitView
        leftPanel={
          <div className="h-full flex flex-col">
            {/* Section Reorder Toggle */}
            <div className="bg-white border-b px-4 py-2 flex-shrink-0">
              <button
                onClick={() => setShowSectionReorder(!showSectionReorder)}
                className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-colors ${
                  showSectionReorder 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Settings className="w-4 h-4" />
                Section Order
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {showSectionReorder ? (
                <div className="h-full overflow-y-auto p-4">
                  <SectionReorderPanel />
                </div>
              ) : (
                <SimpleMultiStepForm 
                  templateId={selectedTemplate || 'classic'}
                  onBack={() => {
                    setSelectedTemplate(null)
                    setCurrentStep('template')
                    sessionStorage.removeItem('selectedTemplate')
                  }}
                />
              )}
            </div>
          </div>
        }
        rightPanel={
          <div className="h-full bg-white flex flex-col">
            {/* Preview Header */}
            <div className="border-b px-6 py-4 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold">Live Preview</h2>
                <Badge variant="secondary">Auto-updates</Badge>
              </div>
              <div className="flex gap-2">
                <ExportButton 
                  templateManager={templateManager}
                  cvData={currentCV}
                  templateId={selectedTemplate || undefined}
                />
              </div>
            </div>
            
            {/* Preview Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
              <div className="max-w-4xl mx-auto">
                {previewHtml ? (
                  <Card className="shadow-lg bg-white">
                    {/* Inject CSS */}
                    <style dangerouslySetInnerHTML={{ __html: previewCss }} />
                    {/* Render CV */}
                    <div 
                      className="cv-preview-container"
                      dangerouslySetInnerHTML={{ __html: previewHtml }}
                    />
                  </Card>
                ) : (
                  <Card className="shadow-lg bg-white p-12">
                    <div className="text-center text-gray-500">
                      <Eye className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">Start filling out your information</p>
                      <p className="text-sm mt-2">Your CV preview will appear here</p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </div>
        }
      />
    </div>
  )
}