'use client'

import { useState } from 'react'
import { EnhancedTemplateGallery } from '@/components/cv-templates/enhanced-template-gallery'
import { TemplateBuilderPage } from './template-builder-page'
import { CvTemplate } from '@/lib/cv-templates/templates-data'

export default function BuilderSimplePage() {
  const [selectedTemplate, setSelectedTemplate] = useState<CvTemplate | null>(null)
  
  if (selectedTemplate) {
    return (
      <TemplateBuilderPage 
        template={selectedTemplate}
        onBack={() => setSelectedTemplate(null)}
      />
    )
  }
  
  return <EnhancedTemplateGallery onSelectTemplate={setSelectedTemplate} />
}