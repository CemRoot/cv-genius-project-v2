"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  FileText, 
  Eye, 
  Download, 
  Settings, 
  Zap,
  Bot,
  Target,
  CheckCircle,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  RotateCw,
  X,
  Plus,
  Menu
} from 'lucide-react'

// Import existing components
import { CvBuilderPreview } from './cv-builder-preview'
import { PersonalInfoForm } from './forms/personal-info-form'
import { ExperienceForm } from './forms/experience-form'
import { EducationForm } from './forms/education-form'
import { SkillsForm } from './forms/skills-form'
import { SummaryForm } from './forms/summary-form'
import { LanguagesForm } from './forms/languages-form'
import { CertificationsForm } from './forms/certifications-form'
import { ReferencesForm } from './forms/references-form'
import { AwardsForm } from './forms/awards-form'
import { PublicationsForm } from './forms/publications-form'
import { VolunteerForm } from './forms/volunteer-form'
import { AutoSaveStatus } from './auto-save-status'

// Import new ATS components
import { ATSOptimizationPanel } from './ats-optimization-panel'
import MobilePDFPreviewModal from './mobile-pdf-preview'

// Context and hooks
import { useCvBuilder } from '@/contexts/cv-builder-context'
import { useGeneratePdf } from '@/hooks/use-generate-pdf'
import { groupSectionsByPriority, getSectionConfig } from '@/lib/cv-section-utils'

export function CvBuilderInterface() {
  const { 
    document: cvData, 
    updatePersonal, 
    updateSection,
    toggleSectionVisibility,
    template,
    hasUnsavedChanges,
    isSaving,
    lastSaved 
  } = useCvBuilder()

  const { generatePdf, downloadPdf, isGenerating, progress, error: pdfError } = useGeneratePdf()

  // State for interface
  const [activeTab, setActiveTab] = useState('builder')
  const [selectedSection, setSelectedSection] = useState('personal')
  const [showATSPanel, setShowATSPanel] = useState(false)
  const [atsOptimizationSuggestions, setATSOptimizationSuggestions] = useState<string[]>([])
  const [jobDescription, setJobDescription] = useState('')
  const [targetIndustry, setTargetIndustry] = useState('technology')
  const [previewZoom, setPreviewZoom] = useState(100)
  const [isMobilePreviewOpen, setMobilePreviewOpen] = useState(false)
  const [isFabMenuOpen, setFabMenuOpen] = useState(false)

  // Handle ATS optimization suggestions
  const handleATSOptimizationChange = (suggestions: string[]) => {
    setATSOptimizationSuggestions(suggestions)
  }

  // Handle zoom controls
  const handleZoomIn = () => {
    setPreviewZoom(prev => Math.min(prev + 10, 200))
  }

  const handleZoomOut = () => {
    setPreviewZoom(prev => Math.max(prev - 10, 50))
  }

  const handleZoomReset = () => {
    setPreviewZoom(100)
  }

  // Add keyboard shortcuts for zoom
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '+' || e.key === '=') {
          e.preventDefault()
          setPreviewZoom(prev => Math.min(prev + 10, 200))
        } else if (e.key === '-') {
          e.preventDefault()
          setPreviewZoom(prev => Math.max(prev - 10, 50))
        } else if (e.key === '0') {
          e.preventDefault()
          setPreviewZoom(100)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Close FAB menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isFabMenuOpen) {
        const target = event.target as Element
        const fabContainer = document.querySelector('[data-fab-container]')
        
        if (fabContainer && !fabContainer.contains(target)) {
          setFabMenuOpen(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isFabMenuOpen])

  // Generate and download PDF using React-PDF templates
  const handleATSOptimizedDownload = async () => {
    // Ensure this only runs on client-side
    if (typeof window === 'undefined') {
      console.error('PDF download attempted on server-side')
      return
    }
    
    console.log('Starting PDF download...')
    console.log('CV Data:', cvData)
    console.log('Selected Template:', template?.id || 'classic')
    
    try {
      // Dynamic import with proper client-side check
      const { exportCVToPDF } = await import('@/lib/pdf-export-service')
      
      // Convert CV Builder data to CVData format for React-PDF
      const experienceSection = cvData.sections.find(s => s.type === 'experience')
      const educationSection = cvData.sections.find(s => s.type === 'education')
      const skillsSection = cvData.sections.find(s => s.type === 'skills')
      const languagesSection = cvData.sections.find(s => s.type === 'languages')
      const referencesSection = cvData.sections.find(s => s.type === 'references')
      
      // Transform experience items to match CV type
      const transformedExperience = experienceSection?.items?.map((exp: any) => ({
        id: exp.id || `exp-${Math.random()}`,
        company: exp.company,
        position: exp.role, // Map role to position
        location: exp.location || '',
        startDate: exp.start, // Keep as-is, PDF template will handle formatting
        endDate: exp.end || '',
        current: exp.end === 'Present' || !exp.end,
        description: exp.bullets?.join(' • ') || '',
        achievements: exp.bullets || [],
        // Also include original fields for backward compatibility
        role: exp.role,
        start: exp.start,
        end: exp.end,
        bullets: exp.bullets
      })) || []
      
      // Transform education items to match CV type
      const transformedEducation = educationSection?.items?.map((edu: any) => ({
        id: edu.id || `edu-${Math.random()}`,
        institution: edu.institution,
        degree: edu.degree,
        field: edu.field,
        location: edu.location || '',
        startDate: edu.start, // Keep as-is, PDF template will handle formatting
        endDate: edu.end || '',
        current: edu.end === 'Present' || !edu.end,
        grade: edu.grade,
        description: edu.description,
        // Also include original fields for backward compatibility
        start: edu.start,
        end: edu.end
      })) || []
      
      // Transform languages to match CV type
      const transformedLanguages = languagesSection?.items?.map((lang: any) => ({
        id: lang.id || `lang-${Math.random()}`,
        name: lang.name,
        level: lang.proficiency, // Map proficiency to level
        certification: lang.certification,
        // Also include original field for backward compatibility
        proficiency: lang.proficiency
      })) || []
      
      const cvDataForPDF = {
        id: cvData.id,
        personal: {
          fullName: cvData.personal.fullName,
          email: cvData.personal.email,
          phone: cvData.personal.phone,
          address: cvData.personal.address,
          linkedin: cvData.personal.linkedin,
          website: cvData.personal.website,
          title: cvData.personal.title,
          summary: cvData.sections.find(s => s.type === 'summary')?.markdown,
          stamp: cvData.personal.workPermit // Map workPermit to stamp for PDF
        },
        experience: transformedExperience,
        education: transformedEducation,
        skills: skillsSection?.items || [],
        languages: transformedLanguages,
        certifications: cvData.sections.find(s => s.type === 'certifications')?.items || [],
        projects: [],
        interests: [],
        references: referencesSection?.items || [],
        sections: cvData.sections,
        sectionVisibility: cvData.sectionVisibility || {}, // Include section visibility
        template: template?.id || 'classic', // Use selected template ID
        lastModified: cvData.updatedAt || new Date().toISOString(),
        version: 1
      } as any // Type assertion for compatibility
      
      console.log('🎯 Using Template ID for PDF:', template?.id || 'classic')
      
      // Use React-PDF export service with correct template
      await exportCVToPDF(cvDataForPDF, {
        filename: `${cvData.personal.fullName || 'CV'}_${template?.id || 'classic'}.pdf`,
        quality: 'high',
        enableOptimization: true,
        templateId: template?.id || 'classic'
      })
      
      console.log('✅ PDF downloaded successfully with template:', template?.id || 'classic')
      
    } catch (error) {
      console.error('❌ PDF generation failed:', error)
      alert(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const renderBuilderContent = () => {
    switch (selectedSection) {
      case 'personal':
        return <PersonalInfoForm />
      case 'summary':
        return <SummaryForm />
      case 'experience':
        return <ExperienceForm />
      case 'education':
        return <EducationForm />
      case 'skills':
        return <SkillsForm />
      case 'languages':
        return <LanguagesForm />
      case 'certifications':
        return <CertificationsForm />
      case 'references':
        return <ReferencesForm />
      case 'awards':
        return <AwardsForm />
      case 'publications':
        return <PublicationsForm />
      case 'volunteer':
        return <VolunteerForm />
      default:
        return <PersonalInfoForm />
    }
  }

  const getSectionCompleteness = (sectionType: string) => {
    switch (sectionType) {
      case 'personal':
        const personal = cvData.personal
        const requiredFields = ['fullName', 'email', 'phone', 'address']
        const filledFields = requiredFields.filter(field => personal[field as keyof typeof personal])
        return Math.round((filledFields.length / requiredFields.length) * 100)
      
      case 'summary':
        const summarySection = cvData.sections.find(s => s.type === 'summary')
        return summarySection && 'markdown' in summarySection && summarySection.markdown ? 100 : 0
      
      case 'experience':
        const experienceSection = cvData.sections.find(s => s.type === 'experience')
        return experienceSection && 'items' in experienceSection && experienceSection.items.length > 0 ? 100 : 0
      
      case 'education':
        const educationSection = cvData.sections.find(s => s.type === 'education')
        return educationSection && 'items' in educationSection && educationSection.items.length > 0 ? 100 : 0
      
      case 'skills':
        const skillsSection = cvData.sections.find(s => s.type === 'skills')
        return skillsSection && 'items' in skillsSection && skillsSection.items.length >= 3 ? 100 : 0
      
      case 'languages':
        const languagesSection = cvData.sections.find(s => s.type === 'languages')
        return languagesSection && 'items' in languagesSection && languagesSection.items.length > 0 ? 100 : 0
      
      case 'certifications':
        const certificationsSection = cvData.sections.find(s => s.type === 'certifications')
        return certificationsSection && 'items' in certificationsSection && certificationsSection.items.length > 0 ? 100 : 0
      
      case 'references':
        const referencesSection = cvData.sections.find(s => s.type === 'references')
        return referencesSection && 'items' in referencesSection && referencesSection.items.length > 0 ? 100 : 0
      
      case 'awards':
        const awardsSection = cvData.sections.find(s => s.type === 'awards')
        return awardsSection && 'items' in awardsSection && awardsSection.items.length > 0 ? 100 : 0
      
      case 'publications':
        const publicationsSection = cvData.sections.find(s => s.type === 'publications')
        return publicationsSection && 'items' in publicationsSection && publicationsSection.items.length > 0 ? 100 : 0
      
      case 'volunteer':
        const volunteerSection = cvData.sections.find(s => s.type === 'volunteer')
        return volunteerSection && 'items' in volunteerSection && volunteerSection.items.length > 0 ? 100 : 0
      
      default:
        return 0
    }
  }

  // Get sections organized by priority
  const sectionGroups = groupSectionsByPriority()
  const allSections = [...sectionGroups.essential, ...sectionGroups.important, ...sectionGroups.optional, ...sectionGroups.academic]

  return (
    <>
      {/* Mobile Scroll Optimization */}
      <style jsx>{`
        @media (max-width: 1023px) {
          .mobile-scroll {
            -webkit-overflow-scrolling: touch;
            overflow-scrolling: touch;
            scroll-behavior: smooth;
            overscroll-behavior-y: contain;
            touch-action: pan-y;
          }
          
          /* iOS Safari specific */
          @supports (-webkit-touch-callout: none) {
            .mobile-scroll {
              -webkit-overflow-scrolling: touch;
              will-change: scroll-position;
            }
          }
        }
      `}</style>
      <div className="h-screen bg-muted flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col p-4">
        {/* Header */}
        <div className="mb-4 flex-shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">CV Builder</h1>
              <p className="text-sm text-muted-foreground">Create an ATS-optimized professional CV</p>
            </div>
            <div className="flex items-center space-x-3">
              <AutoSaveStatus 
                hasUnsavedChanges={hasUnsavedChanges}
                isSaving={isSaving}
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowATSPanel(!showATSPanel)}
                className={showATSPanel ? 'bg-blue-50 border-blue-300' : ''}
              >
                <Bot className="h-4 w-4 mr-2" />
                ATS Check
              </Button>
              <Button size="sm" onClick={handleATSOptimizedDownload} disabled={isGenerating}>
                <Download className="h-4 w-4 mr-2" />
                {isGenerating ? 'Generating...' : 'Download'}
              </Button>
            </div>
          </div>

          {/* ATS Optimization Suggestions */}
          {atsOptimizationSuggestions.length > 0 && (
            <Alert className="mb-4 border-blue-200 bg-blue-50">
              <Target className="h-4 w-4" />
              <AlertDescription>
                <strong>ATS Tips:</strong>
                <ul className="mt-1 space-y-1">
                  {atsOptimizationSuggestions.slice(0, 2).map((suggestion, index) => (
                    <li key={index} className="text-xs">• {suggestion}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* --- MOBİL GÖRÜNÜM (Sadece mobilde görünür) --- */}
          <div className="lg:hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col h-[calc(100dvh-12rem)] min-h-[500px]">
              <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
                <TabsTrigger value="builder">CV Builder</TabsTrigger>
                <TabsTrigger value="preview">Live Preview</TabsTrigger>
              </TabsList>
              
              <TabsContent value="builder" className="flex-1 mt-4 data-[state=active]:flex data-[state=active]:flex-col">
                <Card className="flex-1 flex flex-col">
                  <CardHeader className="pb-3 flex-shrink-0">
                    <CardTitle className="flex items-center text-lg">
                      <FileText className="h-5 w-5 mr-2" />
                      CV Builder
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 p-0 flex flex-col">
                    {/* Mobil İçin Kaydırılabilir Alan */}
                    <div className="h-[calc(100dvh-16rem)] overflow-y-auto p-6 pt-0 pb-24 mobile-scroll">
                      <div className="space-y-1 mb-4">
                        {/* Essential Sections */}
                        <div className="mb-3">
                          <div className="flex items-center mb-2">
                            <div className="h-2 w-2 bg-red-500 rounded-full mr-2"></div>
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Essential</span>
                          </div>
                          {sectionGroups.essential.map((section) => {
                            const completeness = getSectionCompleteness(section.id)
                            const isVisible = cvData.sectionVisibility?.[section.id as keyof typeof cvData.sectionVisibility] ?? section.defaultVisible
                            
                            return (
                              <div key={section.id} className="mb-1">
                                <div className={`flex items-center justify-between p-2 rounded-lg border-2 transition-all ${
                                  selectedSection === section.id 
                                    ? 'bg-blue-50 border-blue-300 shadow-sm' 
                                    : 'hover:bg-muted border-red-200 hover:border-red-300'
                                }`}>
                                  <button
                                    onClick={() => setSelectedSection(section.id)}
                                    className="flex items-center flex-1"
                                  >
                                    <FileText className="h-4 w-4 mr-2 text-red-600" />
                                    <span className="font-semibold text-sm text-foreground">{section.label}</span>
                                  </button>
                                  
                                  <div className="flex items-center space-x-2">
                                    {completeness === 100 ? (
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                    ) : completeness > 0 ? (
                                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                    ) : (
                                      <div className="h-4 w-4 rounded-full border-2 border-red-300" />
                                    )}
                                    <Badge variant="outline" className="text-xs px-1.5 font-medium">
                                      {completeness}%
                                    </Badge>
                                    
                                    <button
                                      onClick={() => toggleSectionVisibility(section.id as any, !isVisible)}
                                      className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                                        isVisible 
                                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                                      }`}
                                    >
                                      {isVisible ? 'ON' : 'OFF'}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        {/* Important Sections */}
                        <div className="mb-3">
                          <div className="flex items-center mb-2">
                            <div className="h-2 w-2 bg-orange-500 rounded-full mr-2"></div>
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Important</span>
                          </div>
                          {sectionGroups.important.map((section) => {
                            const completeness = getSectionCompleteness(section.id)
                            const isVisible = cvData.sectionVisibility?.[section.id as keyof typeof cvData.sectionVisibility] ?? section.defaultVisible
                            
                            return (
                              <div key={section.id} className="mb-1">
                                <div className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                                  selectedSection === section.id 
                                    ? 'bg-blue-50 border-blue-300 shadow-sm' 
                                    : 'hover:bg-muted border-orange-200 hover:border-orange-300'
                                }`}>
                                  <button
                                    onClick={() => setSelectedSection(section.id)}
                                    className="flex items-center flex-1"
                                  >
                                    <FileText className="h-4 w-4 mr-2 text-orange-600" />
                                    <span className="font-medium text-sm text-gray-800">{section.label}</span>
                                  </button>
                                  
                                  <div className="flex items-center space-x-2">
                                    {completeness === 100 ? (
                                      <CheckCircle className="h-3 w-3 text-green-600" />
                                    ) : completeness > 0 ? (
                                      <AlertTriangle className="h-3 w-3 text-yellow-600" />
                                    ) : (
                                      <div className="h-3 w-3 rounded-full border-2 border-orange-300" />
                                    )}
                                    <Badge variant="outline" className="text-xs px-1">
                                      {completeness}%
                                    </Badge>
                                    
                                    <button
                                      onClick={() => toggleSectionVisibility(section.id as any, !isVisible)}
                                      className={`px-1.5 py-0.5 text-xs rounded transition-colors ${
                                        isVisible 
                                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                      }`}
                                    >
                                      {isVisible ? 'ON' : 'OFF'}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        {/* Optional Sections */}
                        <div>
                          <div className="flex items-center mb-2">
                            <div className="h-2 w-2 bg-gray-400 rounded-full mr-2"></div>
                            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Optional</span>
                          </div>
                          {[...sectionGroups.optional, ...sectionGroups.academic].map((section) => {
                            const completeness = getSectionCompleteness(section.id)
                            const isVisible = cvData.sectionVisibility?.[section.id as keyof typeof cvData.sectionVisibility] ?? section.defaultVisible
                            
                            return (
                              <div key={section.id} className="mb-1">
                                <div className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                                  selectedSection === section.id 
                                    ? 'bg-blue-50 border-blue-300 shadow-sm' 
                                    : 'hover:bg-muted border-gray-200 hover:border-gray-300'
                                }`}>
                                  <button
                                    onClick={() => setSelectedSection(section.id)}
                                    className="flex items-center flex-1"
                                  >
                                    <FileText className="h-4 w-4 mr-2 text-gray-500" />
                                    <span className="font-medium text-sm text-muted-foreground">{section.label}</span>
                                    {section.priority === 'academic' && (
                                      <span className="ml-1 text-xs text-purple-600 font-medium">(Academic)</span>
                                    )}
                                  </button>
                                  
                                  <div className="flex items-center space-x-2">
                                    {completeness === 100 ? (
                                      <CheckCircle className="h-3 w-3 text-green-600" />
                                    ) : completeness > 0 ? (
                                      <AlertTriangle className="h-3 w-3 text-yellow-600" />
                                    ) : (
                                      <div className="h-3 w-3 rounded-full border-2 border-gray-300" />
                                    )}
                                    <Badge variant="outline" className="text-xs px-1">
                                      {completeness}%
                                    </Badge>
                                    
                                    <button
                                      onClick={() => toggleSectionVisibility(section.id as any, !isVisible)}
                                      className={`px-1.5 py-0.5 text-xs rounded transition-colors ${
                                        isVisible 
                                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                      }`}
                                    >
                                      {isVisible ? 'ON' : 'OFF'}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Section Form - Also Scrollable */}
                      <div className="border-t pt-4">
                        {renderBuilderContent()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="preview" className="flex-1 mt-4 data-[state=active]:flex data-[state=active]:flex-col">
                {/* Mobile Optimized Live Preview */}
                <div className="flex-1 flex flex-col bg-white rounded-lg border">
                  {/* Mobile Preview Header */}
                  <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center">
                      <Eye className="h-5 w-5 mr-2 text-blue-600" />
                      <span className="font-semibold text-gray-900">Live Preview</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleZoomOut}
                        disabled={previewZoom <= 75}
                        className="h-8 w-8 p-0"
                      >
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-medium text-gray-600 min-w-[45px] text-center">
                        {previewZoom}%
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleZoomIn}
                        disabled={previewZoom >= 150}
                        className="h-8 w-8 p-0"
                      >
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Mobil Preview İçeriği - Kaydırılabilir */}
                  <div className="h-[calc(100dvh-20rem)] overflow-y-auto bg-gray-100 p-4 pb-24 mobile-scroll">
                    <div className="max-w-sm mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                      {/* Mobile CV Preview */}
                      <div className="p-4 space-y-4" style={{ fontSize: '12px', lineHeight: '1.4' }}>
                        {/* Header */}
                        <div className="text-center border-b pb-3">
                          <h1 className="text-lg font-bold text-gray-900">
                            {cvData.personal.fullName || 'Your Name'}
                          </h1>
                          {cvData.personal.title && (
                            <p className="text-sm text-blue-600 font-medium mt-1">
                              {cvData.personal.title}
                            </p>
                          )}
                          <div className="text-xs text-gray-600 mt-2 space-y-1">
                            {cvData.personal.email && (
                              <div>{cvData.personal.email}</div>
                            )}
                            {cvData.personal.phone && (
                              <div>{cvData.personal.phone}</div>
                            )}
                            {cvData.personal.address && (
                              <div>{cvData.personal.address}</div>
                            )}
                          </div>
                        </div>

                        {/* Summary */}
                        {(() => {
                          const summarySection = cvData.sections.find(s => s.type === 'summary')
                          const isVisible = cvData.sectionVisibility?.summary ?? true
                          if (summarySection && 'markdown' in summarySection && summarySection.markdown && isVisible) {
                            return (
                              <div>
                                <h3 className="text-sm font-bold text-gray-900 mb-2 border-b">Summary</h3>
                                <p className="text-xs text-gray-700 leading-relaxed">
                                  {summarySection.markdown}
                                </p>
                              </div>
                            )
                          }
                        })()}

                        {/* Experience */}
                        {(() => {
                          const experienceSection = cvData.sections.find(s => s.type === 'experience')
                          const isVisible = cvData.sectionVisibility?.experience ?? true
                          if (experienceSection && 'items' in experienceSection && experienceSection.items.length > 0 && isVisible) {
                            return (
                              <div>
                                <h3 className="text-sm font-bold text-gray-900 mb-2 border-b">Experience</h3>
                                <div className="space-y-3">
                                  {experienceSection.items.slice(0, 2).map((exp: any, index: number) => (
                                    <div key={index} className="text-xs">
                                      <div className="font-semibold text-gray-900">{exp.role}</div>
                                      <div className="text-blue-600">{exp.company}</div>
                                      <div className="text-gray-500">{exp.start} - {exp.end || 'Present'}</div>
                                      {exp.bullets && exp.bullets.length > 0 && (
                                        <ul className="mt-1 space-y-1">
                                          {exp.bullets.slice(0, 2).map((bullet: string, i: number) => (
                                            <li key={i} className="text-gray-700">• {bullet}</li>
                                          ))}
                                        </ul>
                                      )}
                                    </div>
                                  ))}
                                  {experienceSection.items.length > 2 && (
                                    <div className="text-xs text-gray-500 italic">
                                      +{experienceSection.items.length - 2} more experience{experienceSection.items.length > 3 ? 's' : ''}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          }
                        })()}

                        {/* Education */}
                        {(() => {
                          const educationSection = cvData.sections.find(s => s.type === 'education')
                          const isVisible = cvData.sectionVisibility?.education ?? true
                          if (educationSection && 'items' in educationSection && educationSection.items.length > 0 && isVisible) {
                            return (
                              <div>
                                <h3 className="text-sm font-bold text-gray-900 mb-2 border-b">Education</h3>
                                <div className="space-y-2">
                                  {educationSection.items.slice(0, 2).map((edu: any, index: number) => (
                                    <div key={index} className="text-xs">
                                      <div className="font-semibold text-gray-900">{edu.degree}</div>
                                      <div className="text-blue-600">{edu.institution}</div>
                                      <div className="text-gray-500">{edu.start} - {edu.end || 'Present'}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          }
                        })()}

                        {/* Skills */}
                        {(() => {
                          const skillsSection = cvData.sections.find(s => s.type === 'skills')
                          const isVisible = cvData.sectionVisibility?.skills ?? true
                          if (skillsSection && 'items' in skillsSection && skillsSection.items.length > 0 && isVisible) {
                            return (
                              <div>
                                <h3 className="text-sm font-bold text-gray-900 mb-2 border-b">Skills</h3>
                                <div className="flex flex-wrap gap-1">
                                  {skillsSection.items.slice(0, 8).map((skill: any, index: number) => (
                                    <span 
                                      key={index} 
                                      className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                                    >
                                      {typeof skill === 'string' ? skill : skill.name}
                                    </span>
                                  ))}
                                  {skillsSection.items.length > 8 && (
                                    <span className="text-xs text-gray-500">
                                      +{skillsSection.items.length - 8} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )
                          }
                        })()}
                      </div>
                    </div>
                    
                    {/* Preview Actions */}
                    <div className="text-center mt-4 space-y-3">
                      <div className="text-xs text-gray-500">
                        This is a simplified mobile preview.
                      </div>
                      <div className="flex gap-2 justify-center">
                        <Button
                          size="sm"
                          onClick={() => setMobilePreviewOpen(true)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          PDF Preview
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleATSOptimizedDownload}
                          disabled={isGenerating}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* --- MASAÜSTÜ GÖRÜNÜM (Sadece masaüstünde görünür) --- */}
          <div className="hidden lg:grid lg:grid-cols-12 lg:gap-4 h-full">
            {/* Sütun 1: CV Builder Formu */}
            <div className="lg:col-span-4">
              {/* BU İÇERİK KENDİ İÇİNDE KAYDIRILA౭BILIR OLMALI */}
              <div className="h-full overflow-y-auto">
                <Card className="h-full flex flex-col">
                  <CardHeader className="pb-3 flex-shrink-0">
                    <CardTitle className="flex items-center text-lg">
                      <FileText className="h-5 w-5 mr-2" />
                      CV Builder
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 p-0 flex flex-col">
                    {/* Masaüstü İçin Kaydırılabilir Alan */}
                    <div className="overflow-y-auto p-6 pt-0 pb-6 flex-1 min-h-0">
                  <div className="space-y-1 mb-4">
                    {/* Essential Sections */}
                    <div className="mb-3">
                      <div className="flex items-center mb-2">
                        <div className="h-2 w-2 bg-red-500 rounded-full mr-2"></div>
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Essential</span>
                      </div>
                      {sectionGroups.essential.map((section) => {
                        const completeness = getSectionCompleteness(section.id)
                        const isVisible = cvData.sectionVisibility?.[section.id as keyof typeof cvData.sectionVisibility] ?? section.defaultVisible
                        
                        return (
                          <div key={section.id} className="mb-1">
                            <div className={`flex items-center justify-between p-2 rounded-lg border-2 transition-all ${
                              selectedSection === section.id 
                                ? 'bg-blue-50 border-blue-300 shadow-sm' 
                                : 'hover:bg-muted border-red-200 hover:border-red-300'
                            }`}>
                              <button
                                onClick={() => setSelectedSection(section.id)}
                                className="flex items-center flex-1"
                              >
                                <FileText className="h-4 w-4 mr-2 text-red-600" />
                                <span className="font-semibold text-sm text-foreground">{section.label}</span>
                              </button>
                              
                              <div className="flex items-center space-x-2">
                                {completeness === 100 ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : completeness > 0 ? (
                                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                ) : (
                                  <div className="h-4 w-4 rounded-full border-2 border-red-300" />
                                )}
                                <Badge variant="outline" className="text-xs px-1.5 font-medium">
                                  {completeness}%
                                </Badge>
                                
                                <button
                                  onClick={() => toggleSectionVisibility(section.id as any, !isVisible)}
                                  className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                                    isVisible 
                                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                                  }`}
                                >
                                  {isVisible ? 'ON' : 'OFF'}
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Important Sections */}
                    <div className="mb-3">
                      <div className="flex items-center mb-2">
                        <div className="h-2 w-2 bg-orange-500 rounded-full mr-2"></div>
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Important</span>
                      </div>
                      {sectionGroups.important.map((section) => {
                        const completeness = getSectionCompleteness(section.id)
                        const isVisible = cvData.sectionVisibility?.[section.id as keyof typeof cvData.sectionVisibility] ?? section.defaultVisible
                        
                        return (
                          <div key={section.id} className="mb-1">
                            <div className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                              selectedSection === section.id 
                                ? 'bg-blue-50 border-blue-300 shadow-sm' 
                                : 'hover:bg-muted border-orange-200 hover:border-orange-300'
                            }`}>
                              <button
                                onClick={() => setSelectedSection(section.id)}
                                className="flex items-center flex-1"
                              >
                                <FileText className="h-4 w-4 mr-2 text-orange-600" />
                                <span className="font-medium text-sm text-gray-800">{section.label}</span>
                              </button>
                              
                              <div className="flex items-center space-x-2">
                                {completeness === 100 ? (
                                  <CheckCircle className="h-3 w-3 text-green-600" />
                                ) : completeness > 0 ? (
                                  <AlertTriangle className="h-3 w-3 text-yellow-600" />
                                ) : (
                                  <div className="h-3 w-3 rounded-full border-2 border-orange-300" />
                                )}
                                <Badge variant="outline" className="text-xs px-1">
                                  {completeness}%
                                </Badge>
                                
                                <button
                                  onClick={() => toggleSectionVisibility(section.id as any, !isVisible)}
                                  className={`px-1.5 py-0.5 text-xs rounded transition-colors ${
                                    isVisible 
                                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                >
                                  {isVisible ? 'ON' : 'OFF'}
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Optional Sections */}
                    <div>
                      <div className="flex items-center mb-2">
                        <div className="h-2 w-2 bg-gray-400 rounded-full mr-2"></div>
                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Optional</span>
                      </div>
                      {[...sectionGroups.optional, ...sectionGroups.academic].map((section) => {
                        const completeness = getSectionCompleteness(section.id)
                        const isVisible = cvData.sectionVisibility?.[section.id as keyof typeof cvData.sectionVisibility] ?? section.defaultVisible
                        
                        return (
                          <div key={section.id} className="mb-1">
                            <div className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                              selectedSection === section.id 
                                ? 'bg-blue-50 border-blue-300 shadow-sm' 
                                : 'hover:bg-muted border-gray-200 hover:border-gray-300'
                            }`}>
                              <button
                                onClick={() => setSelectedSection(section.id)}
                                className="flex items-center flex-1"
                              >
                                <FileText className="h-4 w-4 mr-2 text-gray-500" />
                                <span className="font-medium text-sm text-muted-foreground">{section.label}</span>
                                {section.priority === 'academic' && (
                                  <span className="ml-1 text-xs text-purple-600 font-medium">(Academic)</span>
                                )}
                              </button>
                              
                              <div className="flex items-center space-x-2">
                                {completeness === 100 ? (
                                  <CheckCircle className="h-3 w-3 text-green-600" />
                                ) : completeness > 0 ? (
                                  <AlertTriangle className="h-3 w-3 text-yellow-600" />
                                ) : (
                                  <div className="h-3 w-3 rounded-full border-2 border-gray-300" />
                                )}
                                <Badge variant="outline" className="text-xs px-1">
                                  {completeness}%
                                </Badge>
                                
                                <button
                                  onClick={() => toggleSectionVisibility(section.id as any, !isVisible)}
                                  className={`px-1.5 py-0.5 text-xs rounded transition-colors ${
                                    isVisible 
                                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                >
                                  {isVisible ? 'ON' : 'OFF'}
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Section Form - Also Scrollable */}
                  <div className="border-t pt-4">
                    {renderBuilderContent()}
                    </div>
                  </div>
                </CardContent>
              </Card>
              </div>
            </div>

            {/* Sütun 2: Live Preview */}
            <div className={`${showATSPanel ? 'lg:col-span-5' : 'lg:col-span-8'}`}>
              <div className="h-full overflow-y-auto">
                <Card className="h-full flex flex-col">
                  <CardHeader className="pb-3 flex-shrink-0 flex items-center justify-between">
                    <CardTitle className="flex items-center text-lg">
                      <Eye className="h-5 w-5 mr-2" />
                      Live Preview
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleZoomOut}
                        disabled={previewZoom <= 50}
                        className="h-8 w-8"
                        title="Zoom Out (Ctrl/⌘ -)"
                      >
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <div className="px-2 py-1 text-sm font-medium bg-muted rounded-md min-w-[60px] text-center">
                        {previewZoom}%
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleZoomIn}
                        disabled={previewZoom >= 200}
                        className="h-8 w-8"
                        title="Zoom In (Ctrl/⌘ +)"
                      >
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleZoomReset}
                        className="h-8 w-8"
                        title="Reset Zoom (Ctrl/⌘ 0)"
                      >
                        <RotateCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 flex-1">
                    <CvBuilderPreview zoom={previewZoom} />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Sütun 3: ATS Optimization (Koşullu) */}
            {showATSPanel && (
              <div className="lg:col-span-3">
              <div className="h-full flex flex-col space-y-3">
                {/* Job Description Input */}
                <Card className="flex-shrink-0">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Target Job</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">
                        Industry
                      </label>
                      <select 
                        value={targetIndustry}
                        onChange={(e) => setTargetIndustry(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-xs"
                      >
                        <option value="technology">Technology</option>
                        <option value="finance">Finance</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="marketing">Marketing</option>
                        <option value="sales">Sales</option>
                        <option value="education">Education</option>
                        <option value="consulting">Consulting</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">
                        Job Description
                      </label>
                      <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste job description here for targeted optimization..."
                        className="w-full p-2 border border-gray-300 rounded text-xs h-16 resize-none"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* ATS Optimization Panel */}
                <div className="flex-1">
                  <ATSOptimizationPanel
                    cvData={cvData}
                    jobDescription={jobDescription}
                    industry={targetIndustry}
                    onOptimizationChange={handleATSOptimizationChange}
                  />
                </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Speed Dial FAB - Mobile Actions */}
      <div className="lg:hidden fixed bottom-4 right-4 z-50" data-fab-container>
        {/* Speed Dial Menu Items */}
        {isFabMenuOpen && (
          <div className="absolute bottom-16 right-0 flex flex-col space-y-3 mb-2">
            {/* Preview Button */}
            <button
              onClick={() => {
                setMobilePreviewOpen(true)
                setFabMenuOpen(false)
              }}
              className="bg-white text-gray-700 p-3 rounded-full shadow-lg border hover:bg-gray-50 transition-all transform hover:scale-105"
              aria-label="Preview CV"
            >
              <Eye className="h-5 w-5" />
            </button>
            
            {/* Download Button */}
            <button
              onClick={() => {
                handleATSOptimizedDownload()
                setFabMenuOpen(false)
              }}
              disabled={isGenerating}
              className="bg-white text-gray-700 p-3 rounded-full shadow-lg border hover:bg-gray-50 transition-all transform hover:scale-105 disabled:opacity-50"
              aria-label="Download CV"
            >
              <Download className="h-5 w-5" />
            </button>
            
            {/* ATS Check Button */}
            <button
              onClick={() => {
                setShowATSPanel(!showATSPanel)
                setFabMenuOpen(false)
              }}
              className={`p-3 rounded-full shadow-lg border transition-all transform hover:scale-105 ${
                showATSPanel 
                  ? 'bg-blue-50 text-blue-700 border-blue-300' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              aria-label="ATS Check"
            >
              <Bot className="h-5 w-5" />
            </button>
          </div>
        )}
        
        {/* Main FAB Button */}
        <button
          onClick={() => setFabMenuOpen(!isFabMenuOpen)}
          className={`bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all transform ${
            isFabMenuOpen ? 'rotate-45' : 'rotate-0'
          }`}
          aria-label="Actions Menu"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Preview Modal */}
      <MobilePDFPreviewModal
        isOpen={isMobilePreviewOpen}
        onClose={() => setMobilePreviewOpen(false)}
        cvData={cvData}
        template={template}
      />
      </div>
    </>
  )
}