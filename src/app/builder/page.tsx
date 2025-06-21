"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CVEditor } from "@/components/cv/cv-editor"
import { CVPreview } from "@/components/cv/cv-preview"
import { CVToolbar } from "@/components/cv/cv-toolbar"
import { Button } from "@/components/ui/button"
import { MobileTabs, useMobileKeyboard, MobileOnboarding, useMobileOnboarding } from "@/components/mobile"
import { useSwipeNavigation } from "@/hooks/use-swipe-navigation"
import { PanelLeftClose, PanelLeftOpen, Save, Download, Eye, EyeOff, ArrowLeft, Home, Edit, Settings, Share } from "lucide-react"
import { useCVStore } from "@/store/cv-store"
import { motion, AnimatePresence } from "framer-motion"
import { useToast, createToastUtils } from "@/components/ui/toast"

export default function CVBuilderPage() {
  const [showPreview, setShowPreview] = useState(true)
  const [isPreviewOnly, setIsPreviewOnly] = useState(false)
  const [mobileActiveTab, setMobileActiveTab] = useState('edit')
  const [isMobile, setIsMobile] = useState(false)
  const { currentCV, saveCV } = useCVStore()
  const { addToast } = useToast()
  const toast = createToastUtils(addToast)
  const { isKeyboardOpen, adjustedViewHeight } = useMobileKeyboard()
  const { showOnboarding, completeOnboarding, closeOnboarding } = useMobileOnboarding()
  const router = useRouter()

  // Swipe navigation for mobile tabs
  const { gestureHandlers } = useSwipeNavigation(
    {
      onTabChange: (direction) => {
        if (!isMobile) return
        const tabIds = ['edit', 'preview', 'design']
        const currentIndex = tabIds.indexOf(mobileActiveTab)
        
        if (direction === 'left' && currentIndex < tabIds.length - 1) {
          handleMobileTabChange(tabIds[currentIndex + 1])
        } else if (direction === 'right' && currentIndex > 0) {
          handleMobileTabChange(tabIds[currentIndex - 1])
        }
      },
      onSwipeLeft: () => {
        // Next tab
        const tabIds = ['edit', 'preview', 'design']
        const currentIndex = tabIds.indexOf(mobileActiveTab)
        if (currentIndex < tabIds.length - 1) {
          handleMobileTabChange(tabIds[currentIndex + 1])
        }
      },
      onSwipeRight: () => {
        // Previous tab
        const tabIds = ['edit', 'preview', 'design']
        const currentIndex = tabIds.indexOf(mobileActiveTab)
        if (currentIndex > 0) {
          handleMobileTabChange(tabIds[currentIndex - 1])
        }
      }
    },
    {
      enabled: isMobile,
      enableTabSwipe: true,
      horizontalThreshold: 100,
      velocityThreshold: 0.5
    }
  )

  // Enhanced mobile detection
  useEffect(() => {
    // Ensure we're in the browser environment
    if (typeof window === 'undefined') return
    
    const checkMobile = () => {
      const width = window.innerWidth
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const userAgent = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      
      // More aggressive mobile detection
      const shouldBeMobile = width < 768 || isTouchDevice || userAgent
      
      console.log('Mobile Detection:', {
        width,
        isTouchDevice,
        userAgent: userAgent,
        shouldBeMobile
      })
      
      setIsMobile(shouldBeMobile)
    }
    
    // Initial check with delay to ensure window is loaded
    setTimeout(checkMobile, 100)
    
    window.addEventListener('resize', checkMobile)
    window.addEventListener('orientationchange', checkMobile)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
      window.removeEventListener('orientationchange', checkMobile)
    }
  }, [])
  
  // Force mobile mode in development for testing
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Force mobile mode for testing - TEMPORARILY ENABLED
      setIsMobile(true)
    }
  }, [])
  
  if (!currentCV) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading CV...</h2>
          <p className="text-muted-foreground">Please wait while we load your CV data.</p>
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
      // Save current CV before exporting
      saveCV()
      toast.success('CV Saved', 'Redirecting to export page.')
      // Navigate to export page
      router.push('/export')
    } catch (error) {
      toast.error('Error', 'Export process could not be started.')
    }
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
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSave}
                    className="p-2 touch-manipulation"
                    title="Save CV"
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/export')}
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
            {...gestureHandlers}
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
                  
                  <Button variant="outline" size="sm" onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  
                  <Button variant="cvgenius" size="sm" onClick={handleExport}>
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