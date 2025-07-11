'use client'

import React, { useState, useEffect } from 'react'
import { CvTemplate } from '@/lib/cv-templates/templates-data'
import { CvBuilderProvider } from '@/contexts/cv-builder-context'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Wand2, Menu, X, Eye, Edit3, Download, Save, Palette } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import dynamic from 'next/dynamic'
import { convertTemplateToCvBuilder } from '@/lib/cv-templates/template-types'
import { ProgressSteps, ProgressStep } from '@/components/ui/progress-steps'

type SectionKey = 'personal' | 'summary' | 'experience' | 'education' | 'skills' | 'certifications' | 'languages' | 'volunteer' | 'awards' | 'publications' | 'references'

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
  const [activeSection, setActiveSection] = useState<SectionKey>('personal')

  useEffect(() => {
    // Simulate loading template data
    setTimeout(() => setIsLoading(false), 600)
  }, [])

  // Define CV building steps for mobile
  const mobileSteps: ProgressStep[] = [
    {
      id: 'template',
      title: 'Template',
      completed: true
    },
    {
      id: 'content',
      title: 'Content',
      current: true,
      completed: false
    },
    {
      id: 'style',
      title: 'Style',
      completed: false
    },
    {
      id: 'done',
      title: 'Done',
      completed: false
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white rounded-2xl shadow-xl p-6 max-w-sm mx-4"
        >
          <div className="w-14 h-14 mx-auto mb-4 relative">
            <div className="absolute inset-0 rounded-full border-3 border-blue-100"></div>
            <div className="absolute inset-0 rounded-full border-3 border-blue-600 border-t-transparent animate-spin"></div>
            <div className="absolute inset-2 rounded-full bg-blue-50 flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Loading Template
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Setting up <span className="font-medium text-blue-600">{template.name}</span>...
          </p>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <motion.div 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-1.5 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
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
        {/* Enhanced Mobile Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow-sm border-b sticky top-0 z-50 lg:hidden"
        >
          <div className="flex items-center justify-between p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="flex items-center gap-2 hover:bg-blue-50 text-gray-700 hover:text-blue-600 -ml-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </Button>
            
            <div className="flex-1 mx-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="w-6 h-6 rounded-md flex items-center justify-center" 
                     style={{ backgroundColor: template.styling.primaryColor + '20', color: template.styling.primaryColor }}>
                  <Palette className="w-3 h-3" />
                </div>
                <h1 className="text-base font-semibold text-gray-900 truncate">
                  {template.name}
                </h1>
              </div>
            </div>
            
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="hover:bg-blue-50 text-gray-700 hover:text-blue-600 -mr-2"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[85%] max-w-sm p-0 bg-white">
                <div className="h-full overflow-y-auto">
                  <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-900">Edit CV</h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSidebarOpen(false)}
                        className="hover:bg-white/50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Choose a section to edit
                    </p>
                  </div>
                  <CvBuilderSidebar 
                    activeSection={activeSection}
                    onSectionChange={(section) => {
                      setActiveSection(section)
                      setSidebarOpen(false) // Close sidebar when section is selected
                    }}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Mobile Progress Steps */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="px-4 pb-3"
          >
            <ProgressSteps 
              steps={mobileSteps} 
              variant="horizontal"
              className="max-w-xs mx-auto"
            />
          </motion.div>
          
          {/* Enhanced Mobile Action Bar */}
          <div className="flex items-center gap-2 p-3 border-t bg-gradient-to-r from-gray-50 to-blue-50">
            <Button
              variant={showPreview ? 'outline' : 'default'}
              size="sm"
              onClick={() => setShowPreview(false)}
              className={`flex-1 text-sm ${!showPreview ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'hover:bg-blue-50'}`}
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button
              variant={showPreview ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowPreview(true)}
              className={`flex-1 text-sm ${showPreview ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'hover:bg-blue-50'}`}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="px-3 hover:bg-green-50 hover:text-green-700 hover:border-green-200"
            >
              <Save className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="px-3 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </motion.header>

        {/* Enhanced Desktop Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden lg:block bg-white shadow-sm border-b sticky top-0 z-50"
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
                
                <nav className="flex items-center gap-2 text-sm text-gray-500">
                  <span>CV Builder</span>
                  <span>/</span>
                  <span className="text-blue-600 font-medium">Mobile Editor</span>
                </nav>
                
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
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                  <Wand2 className="w-4 h-4" />
                  <span>{template.name}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save
                  </Button>
                  <Button size="sm" className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600">
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Enhanced Mobile Content */}
        <div className="lg:hidden">
          <AnimatePresence mode="wait">
            {!showPreview ? (
              <motion.div
                key="editor"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-4 min-h-[calc(100vh-180px)]"
              >
                <div className="bg-white rounded-xl shadow-sm p-6 mb-4 border border-gray-100">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Edit3 className="w-6 h-6 text-blue-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">
                      Ready to Edit
                    </h2>
                    <p className="text-gray-600 text-sm mb-4">
                      Tap the menu icon <Menu className="w-4 h-4 inline mx-1" /> to choose a section and start editing your CV
                    </p>
                    <Button
                      onClick={() => setSidebarOpen(true)}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      <Menu className="w-4 h-4 mr-2" />
                      Open Editor
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-4 min-h-[calc(100vh-180px)]"
              >
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 h-full max-h-[calc(100vh-200px)]">
                  <div className="p-3 bg-gradient-to-r from-gray-50 to-blue-50 border-b">
                    <p className="text-sm text-gray-600 text-center font-medium">
                      CV Preview
                    </p>
                  </div>
                  <div className="overflow-y-auto h-[calc(100%-50px)]">
                    <div className="transform scale-[0.65] sm:scale-75 origin-top">
                      <CvBuilderPreview />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Desktop Content */}
        <div className="hidden lg:block">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex h-[calc(100vh-73px)]"
          >
            {/* Sidebar */}
            <div className="w-80 bg-white border-r overflow-y-auto">
              <CvBuilderSidebar 
                activeSection={activeSection}
                onSectionChange={setActiveSection}
              />
            </div>
            
            {/* Preview */}
            <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
              <div className="max-w-4xl mx-auto">
                <CvBuilderPreview />
              </div>
            </div>
          </motion.div>
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
      </div>
    </CvBuilderProvider>
  )
}