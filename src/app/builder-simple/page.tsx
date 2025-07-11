'use client'

import { useState, useEffect } from 'react'
import { ModernTemplateGallery } from '@/components/cv-templates/modern-template-gallery'
import { TemplateBuilderPage } from './template-builder-page'
import { MobileTemplateBuilder } from './mobile-template-builder'
import { CvTemplate } from '@/lib/cv-templates/templates-data'

export default function BuilderSimplePage() {
  const [selectedTemplate, setSelectedTemplate] = useState<CvTemplate | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  if (selectedTemplate) {
    if (isMobile) {
      return (
        <MobileTemplateBuilder 
          template={selectedTemplate}
          onBack={() => setSelectedTemplate(null)}
        />
      )
    }
    
    return (
      <TemplateBuilderPage 
        template={selectedTemplate}
        onBack={() => setSelectedTemplate(null)}
      />
    )
  }
  
  return <ModernTemplateGallery onSelectTemplate={setSelectedTemplate} />
}