'use client'

import { useState } from 'react'
import { TemplateCarousel } from './components/template-carousel'
import { MobileWizard } from './components/mobile-wizard'
import { useCVStore } from '@/store/cv-store'

export function MobileBuilderFlow() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<'template' | 'wizard'>('template')
  const { currentCV } = useCVStore()

  if (currentStep === 'template' && !selectedTemplate) {
    return (
      <TemplateCarousel 
        onSelectTemplate={(templateId) => {
          setSelectedTemplate(templateId)
          setCurrentStep('wizard')
        }}
      />
    )
  }

  return (
    <MobileWizard 
      templateId={selectedTemplate || 'modern'}
      onBack={() => {
        setSelectedTemplate(null)
        setCurrentStep('template')
      }}
    />
  )
}