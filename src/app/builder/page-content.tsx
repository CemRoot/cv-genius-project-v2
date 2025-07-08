"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CVEditor } from "@/components/cv/cv-editor"
import { CVPreview } from "@/components/cv/cv-preview"
import { CVToolbar } from "@/components/cv/cv-toolbar"
import { Button } from "@/components/ui/button"
import { MobileTabs, useMobileKeyboard, MobileOnboarding, useMobileOnboarding } from "@/components/mobile"
import { useSwipeNavigation } from "@/hooks/use-swipe-navigation"
import { PanelLeftClose, PanelLeftOpen, Save, Download, Eye, EyeOff, ArrowLeft, Home, Edit, Settings, Share, CheckCircle } from "lucide-react"
import { useCVStore } from "@/store/cv-store"
import { motion, AnimatePresence } from "framer-motion"
import { useToast, createToastUtils } from "@/components/ui/toast"
import { MobileCVWizard } from "@/components/mobile-cv-wizard"
import { useAutoSave } from "@/hooks/use-auto-save"
import { AdModal } from "@/components/cv/ad-modal"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

interface CVBuilderPageContentProps {
  initialIsMobile: boolean
}

export function CVBuilderPageContent({ initialIsMobile }: CVBuilderPageContentProps) {
  const { currentCV, saveCV, autoSaveEnabled = true, autoSaveInterval = 30000, sessionState, updateSessionState, activeSection, setActiveSection } = useCVStore()
  
  const [showPreview, setShowPreview] = useState(true)
  const [isPreviewOnly, setIsPreviewOnly] = useState(false)
  const [isAdModalOpen, setIsAdModalOpen] = useState(false)
  
  // Initialize from sessionState or default to 'edit'
  const [mobileActiveTab, setMobileActiveTab] = useState(sessionState.mobileActiveTab || 'edit')
  
  const [isMobile, setIsMobile] = useState(initialIsMobile)
  const [showWizard, setShowWizard] = useState(false)
  const { addToast } = useToast()
  const toast = createToastUtils(addToast)
  const { isVisible: isKeyboardOpen, adjustedViewHeight } = useMobileKeyboard()
  const { showOnboarding, completeOnboarding, closeOnboarding } = useMobileOnboarding()
  const router = useRouter()

  // Auto-save functionality
  const { isAutoSaveEnabled, lastAutoSave } = useAutoSave({
    onSave: () => {
      try {
        saveCV()
        console.log('CV auto-saved successfully')
      } catch (error) {
        console.error('Auto-save failed:', error)
      }
    },
    interval: autoSaveInterval,
    enabled: autoSaveEnabled
  })

  // Swipe navigation for mobile tabs
  const swipeNavigation = useSwipeNavigation({
    enabledDirections: { left: true, right: true, up: false, down: false },
    onSwipeComplete: (direction) => {
      if (!isMobile) return
      const tabIds = ['edit', 'preview', 'design']
      const currentIndex = tabIds.indexOf(mobileActiveTab)
      
      if (direction === 'left' && currentIndex < tabIds.length - 1) {
        handleMobileTabChange(tabIds[currentIndex + 1])
      } else if (direction === 'right' && currentIndex > 0) {
        handleMobileTabChange(tabIds[currentIndex - 1])
      }
    },
    threshold: 100,
    velocity: 0.5
  })

  // Mobile detection with immediate execution
  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const userAgent = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      
      // More aggressive mobile detection
      const shouldBeMobile = width < 768 || isTouchDevice || userAgent
      
      setIsMobile(shouldBeMobile)
    }
    
    window.addEventListener('resize', checkMobile)
    window.addEventListener('orientationchange', checkMobile)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
      window.removeEventListener('orientationchange', checkMobile)
    }
  }, [])

  // Check if CV is empty and show wizard for mobile
  useEffect(() => {
    if (isMobile && currentCV) {
      const isEmptyCV = !currentCV.personal.fullName && 
                       !currentCV.personal.email && 
                       !currentCV.personal.phone &&
                       (!currentCV.experience || currentCV.experience.length === 0) &&
                       (!currentCV.education || currentCV.education.length === 0)
      
      // Only show wizard if CV is truly empty AND user hasn't been working in editor mode
      if (isEmptyCV && sessionState.builderMode !== 'editor') {
        setShowWizard(true)
      } else {
        setShowWizard(false)
      }
    }
  }, [isMobile, currentCV, sessionState.builderMode])
  
  // Update session state when mobileActiveTab changes
  useEffect(() => {
    updateSessionState({ 
      mobileActiveTab,
      builderMode: 'editor'
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobileActiveTab])
  
  // Restore mobileActiveTab from session state on mount
  useEffect(() => {
    if (sessionState.mobileActiveTab && isMobile) {
      setMobileActiveTab(sessionState.mobileActiveTab)
    }
  }, [isMobile])
  
  if (!currentCV) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cvgenius-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2 text-gray-900">Loading CV...</h2>
          <p className="text-gray-600">Please wait while we load your CV data.</p>
        </div>
      </div>
    )
  }

  const togglePreview = () => {
    if (isPreviewOnly) {
      setIsPreviewOnly(false)
      setShowPreview(true)
    } else if (showPreview) {
      setIsPreviewOnly(true)
    } else {
      setShowPreview(true)
    }
  }

  const hidePreview = () => {
    setShowPreview(false)
    setIsPreviewOnly(false)
  }

  const handleSave = () => {
    try {
      saveCV()
      toast.success('CV Saved', 'Your CV information has been saved successfully.')
    } catch (error) {
      toast.error('Save Error', 'An error occurred while saving your CV.')
    }
  }

  const handleExport = () => {
    try {
      saveCV()
      setIsAdModalOpen(true)
    } catch (error) {
      toast.error('Error', 'Export process could not be started.')
    }
  }

  const generatePdf = async () => {
    const cvElement = document.getElementById('cv-export-content')
    if (!cvElement) {
      toast.error('Error', 'CV content not found.')
      return
    }

    const canvas = await html2canvas(cvElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    })

    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const canvasWidth = canvas.width
    const canvasHeight = canvas.height
    const ratio = canvasWidth / pdfWidth
    const scaledHeight = canvasHeight / ratio

    let position = 0
    let pageCount = 1

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledHeight)

    let heightLeft = scaledHeight - pdfHeight

    while (heightLeft > 0) {
      position = -pdfHeight * pageCount
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledHeight)
      heightLeft -= pdfHeight
      pageCount++
    }

    pdf.save(`${currentCV.personal.fullName || 'cv'}-export.pdf`)
    toast.success('Success', 'CV has been exported as PDF.')
  }

  const mobileTabs = [
    {
      id: 'edit',
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />
    },
    {
      id: 'preview',
      label: 'Preview',
      icon: <Eye className="h-4 w-4" />
    },
    {
      id: 'design',
      label: 'Design',
      icon: <Settings className="h-4 w-4" />
    }
  ]

  const handleMobileTabChange = (tabId: string) => {
    setMobileActiveTab(tabId)
    if (tabId === 'preview') {
      setShowPreview(true)
      setIsPreviewOnly(true)
    } else {
      setIsPreviewOnly(false)
      setShowPreview(tabId !== 'edit')
    }
    
    // When switching to edit mode, restore the last active section
    if (tabId === 'edit' && sessionState.lastActiveSection) {
      setActiveSection(sessionState.lastActiveSection)
    }
  }

  // Show mobile wizard if CV is empty
  if (isMobile && showWizard) {
    return (
      <MobileCVWizard 
        onComplete={() => {
          setShowWizard(false)
          toast.success('CV Created', 'Your CV has been created successfully!')
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdModal
        isOpen={isAdModalOpen}
        onClose={() => setIsAdModalOpen(false)}
        onCountdownComplete={() => {
          setIsAdModalOpen(false)
          generatePdf()
        }}
      />
      {/* Mobile Layout */}
      {isMobile ? (
        <>
          {/* Mobile Header - Enhanced */}
          <div className="border-b bg-white shadow-sm sticky top-0 z-50">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/')}
                    className="p-2 touch-manipulation"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-lg font-semibold text-gray-900">CV Builder</h1>
                    <p className="text-xs text-gray-500 truncate">
                      {currentCV.personal.fullName || "Untitled CV"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSave}
                      className="p-2 touch-manipulation"
                      title="Save CV"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    {lastAutoSave && (
                      <span className="text-xs text-green-600 ml-1">
                        ✓
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleExport}
                    className="p-2 touch-manipulation"
                    title="Export CV"
                  >
                    <Share className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Mobile Tabs - Enhanced */}
            <div className="border-t border-gray-100">
              <MobileTabs
                tabs={mobileTabs}
                activeTab={mobileActiveTab}
                onTabChange={handleMobileTabChange}
                variant="underline"
                className="px-4"
              />
            </div>
          </div>

          {/* Mobile Content - Enhanced with Swipe */}
          <div 
            className="relative bg-gray-50 overflow-hidden"
            style={{ 
              height: isKeyboardOpen ? adjustedViewHeight : 'calc(100vh - 160px)',
              minHeight: isKeyboardOpen ? 'auto' : '500px'
            }}
            ref={swipeNavigation.setSwipeElement}
          >
            {/* Swipe Indicator - Outside AnimatePresence */}
            {isMobile && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
                <div className="flex space-x-1">
                  {['edit', 'preview', 'design'].map((tab, index) => (
                    <div
                      key={tab}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        tab === mobileActiveTab ? 'bg-cvgenius-purple' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            <AnimatePresence mode="wait">
              {mobileActiveTab === 'edit' && (
                <motion.div
                  key="edit"
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -100, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="absolute inset-0 overflow-y-auto bg-gray-50"
                >
                  <div className="pb-6 pt-8">
                    <CVEditor isMobile={true} />
                  </div>
                </motion.div>
              )}
              
              {mobileActiveTab === 'preview' && (
                <motion.div
                  key="preview"
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 100, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="absolute inset-0 overflow-y-auto bg-white"
                >
                  <div className="pt-8">
                    <CVPreview isMobile={true} />
                  </div>
                </motion.div>
              )}
              
              {mobileActiveTab === 'design' && (
                <motion.div
                  key="design"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="absolute inset-0 overflow-y-auto bg-gray-50"
                >
                  <div className="space-y-4 pt-8">
                    {/* Design Controls */}
                    <div className="bg-white border-b border-gray-200 p-4 mx-4 rounded-xl shadow-sm">
                      <CVToolbar isMobile={true} />
                    </div>
                    
                    {/* CV Preview for Design Changes */}
                    <div className="px-4 pb-6">
                      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                        <CVPreview isMobile={true} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      ) : (
        /* Desktop Layout */
        <>
          {/* Desktop Header */}
          <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/')}
                    className="touch-target"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <div className="w-px h-6 bg-border" />
                  <h1 className="text-xl font-semibold">CV Builder</h1>
                  <div className="text-sm text-muted-foreground">
                    {currentCV.personal.fullName || "Untitled CV"}
                  </div>
                </div>

                {/* Desktop Controls */}
                <div className="flex items-center gap-2">
                  <CVToolbar />
                  <div className="w-px h-6 bg-border mx-2" />
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={hidePreview}
                    className={!showPreview ? "bg-muted" : ""}
                  >
                    <PanelLeftClose className="h-4 w-4 mr-2" />
                    Editor Only
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={togglePreview}
                    className={showPreview && !isPreviewOnly ? "bg-muted" : ""}
                  >
                    <PanelLeftOpen className="h-4 w-4 mr-2" />
                    Split View
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={togglePreview}
                    className={isPreviewOnly ? "bg-muted" : ""}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Only
                  </Button>

                  <div className="w-px h-6 bg-border mx-2" />
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleSave}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    
                    {lastAutoSave && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-green-600 text-xs">
                          Auto-saved
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleExport}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Main Content */}
          <div className="flex h-[calc(100vh-8rem)]">
            {/* Editor Panel */}
            <AnimatePresence>
              {(!isPreviewOnly) && (
                <motion.div
                  initial={{ width: showPreview ? "50%" : "100%" }}
                  animate={{ width: showPreview ? "50%" : "100%" }}
                  exit={{ width: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`${showPreview ? "border-r" : ""} bg-background overflow-hidden`}
                >
                  <div className="h-full overflow-y-auto">
                    <CVEditor isMobile={false} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Preview Panel */}
            <AnimatePresence>
              {showPreview && (
                <motion.div
                  initial={{ width: isPreviewOnly ? "100%" : "50%" }}
                  animate={{ width: isPreviewOnly ? "100%" : "50%" }}
                  exit={{ width: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-muted/30 overflow-hidden"
                >
                  <div className="h-full overflow-y-auto">
                    <CVPreview isMobile={false} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}

      {/* Mobile Onboarding */}
      {isMobile && (
        <MobileOnboarding
          isOpen={showOnboarding}
          onClose={closeOnboarding}
          onComplete={completeOnboarding}
          currentPage="builder"
        />
      )}
    </div>
  )
}
