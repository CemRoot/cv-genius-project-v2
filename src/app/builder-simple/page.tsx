'use client'

import { useState, useEffect } from 'react'
import { ModernTemplateGallery } from '@/components/cv-templates/modern-template-gallery'
import { TemplateBuilderPage } from './template-builder-page'
import { MobileTemplateBuilder } from './mobile-template-builder'
import { CvTemplate } from '@/lib/cv-templates/templates-data'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Sparkles, Zap, FileText, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

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
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header with Navigation */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 hover:bg-blue-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Home</span>
                </Button>
              </Link>
              
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-sm text-gray-600">
                <span>Home</span>
                <span>/</span>
                <span className="text-blue-600 font-medium">CV Builder</span>
              </nav>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/templates">
                  <FileText className="w-4 h-4 mr-2" />
                  Browse Templates
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 lg:py-20">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto mb-12"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-blue-600" />
              <span className="text-blue-600 font-medium text-sm uppercase tracking-wide">
                Simple CV Builder
              </span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Create Your Perfect
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> CV</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Choose from professional templates and build your CV in minutes. 
              No design skills required – just pick a template and start editing.
            </p>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-xl p-4 border"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Quick & Easy</h3>
                  <p className="text-sm text-gray-600">Build in minutes</p>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-xl p-4 border"
              >
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Professional</h3>
                  <p className="text-sm text-gray-600">ATS-friendly designs</p>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-xl p-4 border"
              >
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">No Signup</h3>
                  <p className="text-sm text-gray-600">Start immediately</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Template Gallery Section */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                Choose Your Template
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Select from our collection of professional CV templates. 
                Each template is designed to help you stand out and get noticed by employers.
              </p>
            </div>
            
            <ModernTemplateGallery onSelectTemplate={setSelectedTemplate} />
          </motion.div>
        </div>
      </section>
    </div>
  )
}