'use client'

import React, { useState, useEffect } from 'react'
import { CvTemplate } from '@/lib/cv-templates/templates-data'
import { CvBuilderProvider } from '@/contexts/cv-builder-context'
import { CvBuilderInterface } from '@/components/cv-builder/cv-builder-interface'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Wand2, Save, Download, Eye, Settings, Palette } from 'lucide-react'
import { convertTemplateToCvBuilder } from '@/lib/cv-templates/template-types'
import { motion } from 'framer-motion'
import { ProgressSteps, ProgressStep } from '@/components/ui/progress-steps'

interface TemplateBuilderPageProps {
  template: CvTemplate
  onBack: () => void
}

export function TemplateBuilderPage({ template, onBack }: TemplateBuilderPageProps) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading template data
    setTimeout(() => setIsLoading(false), 800)
  }, [])

  // Define CV building steps
  const buildingSteps: ProgressStep[] = [
    {
      id: 'template',
      title: 'Choose Template',
      description: 'Template selected',
      completed: true
    },
    {
      id: 'content',
      title: 'Add Content',
      description: 'Fill in your details',
      current: true,
      completed: false
    },
    {
      id: 'customize',
      title: 'Customize',
      description: 'Style your CV',
      completed: false
    },
    {
      id: 'download',
      title: 'Download',
      description: 'Get your CV',
      completed: false
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md mx-4"
        >
          <div className="w-16 h-16 mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
            <div className="absolute inset-2 rounded-full bg-blue-50 flex items-center justify-center">
              <Wand2 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Preparing Your Template
          </h3>
          <p className="text-gray-600 mb-4">
            Setting up <span className="font-medium text-blue-600">{template.name}</span> for editing...
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </motion.div>
      </div>
    )
  }

  // Convert template data to CV builder format
  const cvBuilderData = convertTemplateToCvBuilder(template.defaultData)

  return (
    <CvBuilderProvider initialData={cvBuilderData} template={template}>
      <div className="min-h-screen bg-gray-50">
        {/* Enhanced Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow-sm border-b sticky top-0 z-50"
        >
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="flex items-center gap-2 hover:bg-blue-50 text-gray-600 hover:text-blue-600"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Templates</span>
                </Button>
                
                {/* Breadcrumb */}
                <nav className="hidden md:flex items-center gap-2 text-sm text-gray-500">
                  <span>CV Builder</span>
                  <span>/</span>
                  <span className="text-blue-600 font-medium">Editing</span>
                </nav>
                
                <div className="hidden lg:block">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" 
                         style={{ backgroundColor: template.styling.primaryColor + '20', color: template.styling.primaryColor }}>
                      <Palette className="w-4 h-4" />
                    </div>
                    <div>
                      <h1 className="text-lg font-semibold text-gray-900">
                        {template.name}
                      </h1>
                      <p className="text-sm text-gray-500">{template.description}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Template Info Badge */}
                <div className="hidden sm:flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                  <Wand2 className="w-4 h-4" />
                  <span>{template.name}</span>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden md:flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden md:flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Download</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="border-t bg-gray-50/50"
          >
            <div className="container mx-auto px-4 py-3">
              <ProgressSteps 
                steps={buildingSteps} 
                className="max-w-md mx-auto"
                variant="horizontal"
              />
            </div>
          </motion.div>
        </motion.header>

        {/* CV Builder Interface */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <CvBuilderInterface />
        </motion.div>
      </div>
    </CvBuilderProvider>
  )
}