'use client'

import { useState, useEffect, useMemo } from 'react'
import { StaticTemplateGallery } from './components/static-template-gallery'
import { SimpleMultiStepForm } from './components/simple-multi-step-form'
import { SimpleSplitView } from './components/simple-split-view'
import { useCVStore } from '@/store/cv-store'
import { IrishCVTemplateManager } from '@/lib/irish-cv-template-manager'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Eye, Settings, AlertTriangle } from 'lucide-react'
import { ExportButton } from '@/components/cv/export-button'
import SectionReorderPanel from '@/components/cv/section-reorder-panel'
import { ErrorStateWithFallback } from '@/components/ui/error-state-with-fallback'
import { useCVPageCount } from '@/hooks/use-cv-page-count'

export function WebBuilderFlow() {
  const { currentCV, sessionState, updateSessionState, setTemplate } = useCVStore()
  
  // Initialize from sessionState or check if user has existing CV data
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(sessionState.selectedTemplateId || null)
  // Always start with template selection step - let useEffect handle the logic
  const [currentStep, setCurrentStep] = useState<'template' | 'form'>('template')
  
  const [previewHtml, setPreviewHtml] = useState<string>('')
  const [previewCss, setPreviewCss] = useState<string>('')
  const [showSectionReorder, setShowSectionReorder] = useState<boolean>(false)
  const [templateError, setTemplateError] = useState<{
    hasError: boolean
    title?: string
    message?: string
    canRetry?: boolean
  }>({ hasError: false })
  
  // Create template manager instance
  const templateManager = useMemo(() => new IrishCVTemplateManager(), [])
  
  // Get estimated page count
  const estimatedPageCount = useCVPageCount(selectedTemplate || undefined)
  
  // Initialize - restore session state or determine from CV data
  useEffect(() => {
    console.log('🔧 Template initialization useEffect:', {
      sessionStateId: sessionState.selectedTemplateId,
      currentCV: currentCV,
      cvTemplate: currentCV?.template,
      currentSelectedTemplate: selectedTemplate,
      currentStep
    })
    
    // Helper function to validate template exists and handle fallbacks
    const validateAndSetTemplate = (templateId: string, source: string) => {
      console.log(`🔄 Attempting to use ${source} template:`, templateId)
      
      // Get available templates for debugging
      const availableTemplates = templateManager.getAllTemplates().map(t => t.id)
      console.log('📋 Available templates:', availableTemplates)
      
      const success = templateManager.selectTemplate(templateId)
      if (success) {
        console.log('✅ Successfully selected template:', templateId)
        setSelectedTemplate(templateId)
        setCurrentStep('form')
        return templateId
      } else {
        console.log('❌ Template not found:', templateId)
        // Try fallback mapping for legacy templates
        const fallbackMap: { [key: string]: string } = {
          'harvard': 'classic',
          'modern': 'dublin-tech',
          'professional': 'irish-finance'
        }
        
        const fallbackId = fallbackMap[templateId] || 'classic'
        console.log('🔄 Using fallback template:', fallbackId)
        
        const fallbackSuccess = templateManager.selectTemplate(fallbackId)
        if (fallbackSuccess) {
          console.log('✅ Fallback template selected:', fallbackId)
          setSelectedTemplate(fallbackId)
          setCurrentStep('form')
          return fallbackId
        } else {
          console.error('❌ Even fallback template failed:', fallbackId)
          // Set error state for UI display
          setTemplateError({
            hasError: true,
            title: 'Template Not Available',
            message: `The template "${templateId}" is not available, and we couldn't load a fallback template. Please select a new template to continue.`,
            canRetry: false
          })
          return null
        }
      }
    }
    
    // Priority 1: Use sessionState if available
    if (sessionState.selectedTemplateId) {
      const resolvedTemplate = validateAndSetTemplate(sessionState.selectedTemplateId, 'session state')
      if (resolvedTemplate) {
        // Update session state if template was mapped to fallback
        if (resolvedTemplate !== sessionState.selectedTemplateId) {
          updateSessionState({ selectedTemplateId: resolvedTemplate })
        }
        return // Exit early - template is valid and set
      } else {
        // Template validation failed completely - force template selection
        console.log('❌ Session template validation failed completely, forcing template selection')
        sessionStorage.removeItem('selectedTemplate')
        updateSessionState({ selectedTemplateId: undefined })
        setSelectedTemplate(null)
        setCurrentStep('template')
        return
      }
    } 
    // Priority 2: Use template from existing CV data (only if template exists and is valid)
    else if (currentCV && currentCV.template && currentCV.template.trim()) {
      const resolvedTemplate = validateAndSetTemplate(currentCV.template, 'CV data')
      if (resolvedTemplate) {
        // Update session state and CV with resolved template
        updateSessionState({ selectedTemplateId: resolvedTemplate })
        if (resolvedTemplate !== currentCV.template) {
          setTemplate(resolvedTemplate)
        }
        return // Exit early - template is valid and set
      } else {
        // CV template validation failed - force template selection
        console.log('❌ CV template validation failed completely, forcing template selection')
        // Clear invalid template from CV to force fresh selection
        setTemplate('')
        setSelectedTemplate(null)
        setCurrentStep('template')
        return
      }
    } 
    // Priority 3: Force template selection for new users or empty templates
    else {
      console.log('❌ No valid template found, forcing template selection')
      // Clear all template-related storage and state
      sessionStorage.removeItem('selectedTemplate')
      updateSessionState({ selectedTemplateId: undefined })
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
    // Only render if we have a valid template selected
    if (selectedTemplate && typeof selectedTemplate === 'string' && selectedTemplate.trim()) {
      try {
        // Validate template exists before trying to select it
        const availableTemplates = templateManager.getAllTemplates().map(t => t.id)
        
        if (!availableTemplates.includes(selectedTemplate)) {
          console.warn('🚨 Preview: Template not available:', selectedTemplate, 'Available:', availableTemplates)
          // Don't render preview for invalid template - let the initialization useEffect handle fallback
          setPreviewHtml('')
          setPreviewCss('')
          return
        }
        
        const success = templateManager.selectTemplate(selectedTemplate)
        if (!success) {
          console.error('🚨 Preview: Failed to select template:', selectedTemplate)
          setTemplateError({
            hasError: true,
            title: 'Template Loading Error',
            message: `There was an error loading the "${selectedTemplate}" template. Please try selecting a different template.`,
            canRetry: true
          })
          setPreviewHtml('')
          setPreviewCss('')
          return
        }
        
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
        console.log('✅ Preview updated successfully for template:', selectedTemplate)
        // Clear any previous error state on successful render
        setTemplateError({ hasError: false })
      } catch (error) {
        console.error('Preview update error:', error)
        setTemplateError({
          hasError: true,
          title: 'Template Rendering Error',
          message: 'There was an error rendering your CV preview. Your data is safe - please try selecting a different template.',
          canRetry: true
        })
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

  // Show error state when there's a template error
  if (templateError.hasError) {
    console.log('🚨 Rendering error state:', templateError)
    return (
      <ErrorStateWithFallback
        title={templateError.title}
        message={templateError.message}
        onReturnToTemplates={() => {
          console.log('🔄 User clicked return to templates from error state')
          // Clear error state and return to template selection
          setTemplateError({ hasError: false })
          setSelectedTemplate(null)
          setCurrentStep('template')
          sessionStorage.removeItem('selectedTemplate')
          updateSessionState({ selectedTemplateId: undefined })
          // Clear invalid template from CV if exists
          if (currentCV?.template && currentCV.template.trim()) {
            setTemplate('')
          }
        }}
        onRetry={templateError.canRetry ? () => {
          console.log('🔄 User clicked retry from error state')
          // Clear error and try to re-render with current template
          setTemplateError({ hasError: false })
          // Force re-initialization by temporarily clearing and restoring template
          const currentTemplate = selectedTemplate
          setSelectedTemplate(null)
          setTimeout(() => setSelectedTemplate(currentTemplate), 100)
        } : undefined}
        className="mx-auto max-w-2xl mt-8"
      />
    )
  }

  // Show template gallery when no template is selected
  if (!selectedTemplate) {
    console.log('🎨 Rendering template gallery because selectedTemplate is:', selectedTemplate)
    return (
      <StaticTemplateGallery 
        onSelectTemplate={(templateId) => {
          console.log('🎯 Template selected from gallery:', templateId)
          
          // Validate the selected template before applying it
          const success = templateManager.selectTemplate(templateId)
          if (success) {
            setSelectedTemplate(templateId)
            setCurrentStep('form')
            sessionStorage.setItem('selectedTemplate', templateId)
            // Update CV template to match selection
            setTemplate(templateId)
            // Update session state
            updateSessionState({ selectedTemplateId: templateId })
            // Clear any error state on successful selection
            setTemplateError({ hasError: false })
            console.log('✅ Template gallery selection applied successfully:', templateId)
          } else {
            console.error('❌ Template gallery selection failed:', templateId)
            setTemplateError({
              hasError: true,
              title: 'Template Selection Failed',
              message: `Unable to load the "${templateId}" template. Please try a different template.`,
              canRetry: false
            })
          }
        }}
      />
    )
  }

  console.log('🏗️ Rendering main builder with template:', selectedTemplate)

  // Final safety check - ensure we have a valid template before rendering main builder
  if (!selectedTemplate || !selectedTemplate.trim()) {
    console.log('🚨 Safety check: No valid template, redirecting to gallery')
    return (
      <StaticTemplateGallery 
        onSelectTemplate={(templateId) => {
          console.log('🎯 Template selected from safety gallery:', templateId)
          
          const success = templateManager.selectTemplate(templateId)
          if (success) {
            setSelectedTemplate(templateId)
            setCurrentStep('form')
            sessionStorage.setItem('selectedTemplate', templateId)
            setTemplate(templateId)
            updateSessionState({ selectedTemplateId: templateId })
            // Clear any error state on successful selection
            setTemplateError({ hasError: false })
            console.log('✅ Safety template selection applied:', templateId)
          } else {
            console.error('❌ Safety template selection failed:', templateId)
            setTemplateError({
              hasError: true,
              title: 'Template Selection Failed',
              message: `Unable to load the "${templateId}" template. Please try a different template.`,
              canRetry: false
            })
          }
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
                {estimatedPageCount > 1 && (
                  <Badge 
                    variant={estimatedPageCount > 2 ? "destructive" : "default"} 
                    className="flex items-center gap-1"
                  >
                    {estimatedPageCount > 2 && <AlertTriangle className="w-3 h-3" />}
                    {estimatedPageCount} pages
                  </Badge>
                )}
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
                  <>
                    {/* Multi-page warning */}
                    {estimatedPageCount > 1 && (
                      <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-amber-800">
                              Not: CV'niz {estimatedPageCount} sayfa içermektedir.
                            </p>
                            <p className="text-xs text-amber-700 mt-1">
                              'Languages' ve 'References' gibi bazı bölümler yeni sayfada yer almaktadır. 
                              Lütfen PDF'nin tamamını kontrol ediniz.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    <Card className="shadow-lg bg-white">
                      {/* Inject CSS */}
                      <style dangerouslySetInnerHTML={{ __html: previewCss }} />
                      {/* Render CV */}
                      <div 
                        className="cv-preview-container"
                        dangerouslySetInnerHTML={{ __html: previewHtml }}
                      />
                    </Card>
                  </>
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