"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CVEditor } from "@/components/cv/cv-editor"
import { CVPreview } from "@/components/cv/cv-preview"
import { CVToolbar } from "@/components/cv/cv-toolbar"
import { Button } from "@/components/ui/button"
import { useMobileKeyboard } from "@/components/mobile"
import { 
  ArrowLeft, 
  Save, 
  Download, 
  Eye, 
  EyeOff, 
  Settings, 
  Share,
  Edit3,
  Maximize2,
  Minimize2
} from "lucide-react"
import { useCVStore } from "@/store/cv-store"
import { motion, AnimatePresence } from "framer-motion"
import { useToast, createToastUtils } from "@/components/ui/toast"
import { useAutoSave } from "@/hooks/use-auto-save"
import { AutoSaveIndicator } from "@/components/ui/auto-save-indicator"

interface CVBuilderPageContentProps {
  initialIsMobile: boolean
}

export function CVBuilderPageContent({ initialIsMobile }: CVBuilderPageContentProps) {
  const { currentCV, saveCV, autoSaveEnabled = true, autoSaveInterval = 30000, activeSection, setActiveSection } = useCVStore()
  
  // Simplified state management
  const [isMobile, setIsMobile] = useState(initialIsMobile)
  const [showPreview, setShowPreview] = useState(false) // Start with edit mode on mobile
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false)
  const [showDesignPanel, setShowDesignPanel] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  const { addToast } = useToast()
  const toast = createToastUtils(addToast)
  const { isVisible: isKeyboardOpen, adjustedViewHeight } = useMobileKeyboard()
  const router = useRouter()

  // Auto-save functionality
  const { isAutoSaveEnabled, lastAutoSave } = useAutoSave({
    enabled: autoSaveEnabled,
    interval: autoSaveInterval,
    onSave: () => {
      console.log('CV auto-saved successfully')
    },
    onError: (error) => {
      console.error('Auto-save failed:', error)
    }
  })

  // Simplified mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth
      const shouldBeMobile = width < 768
      setIsMobile(shouldBeMobile)
      
      // Adjust preview state based on screen size
      if (!shouldBeMobile && !showPreview) {
        setShowPreview(true) // Show preview by default on desktop
      }
    }
    
    window.addEventListener('resize', checkMobile)
    window.addEventListener('orientationchange', checkMobile)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
      window.removeEventListener('orientationchange', checkMobile)
    }
  }, [showPreview])
  
  if (!currentCV) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2 text-gray-900">Loading CV...</h2>
          <p className="text-gray-600">Please wait while we load your CV data.</p>
        </div>
      </div>
    )
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      saveCV()
      toast.success('CV Saved', 'Your CV information has been saved successfully.')
    } catch (error) {
      toast.error('Save Error', 'An error occurred while saving your CV.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleExport = () => {
    try {
      saveCV()
      toast.success('CV Saved', 'Redirecting to export page.')
      router.push('/export')
    } catch (error) {
      toast.error('Error', 'Export process could not be started.')
    }
  }

  const togglePreview = () => {
    if (isMobile) {
      setShowPreview(!showPreview)
      setIsPreviewFullscreen(false)
    } else {
      setShowPreview(!showPreview)
    }
  }

  const togglePreviewFullscreen = () => {
    setIsPreviewFullscreen(!isPreviewFullscreen)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Layout - Simplified */}
      {isMobile ? (
        <div className="flex flex-col h-screen">
          {/* Mobile Header - Enhanced */}
          <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
            {/* Primary Action Bar */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/')}
                  className="p-3 touch-manipulation rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
                  aria-label="Go back to home"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-600" />
                </Button>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg font-semibold text-gray-900 truncate">CV Builder</h1>
                  <p className="text-xs text-gray-500 truncate max-w-[180px]">
                    {currentCV.personal.fullName || "Untitled CV"}
                  </p>
                </div>
              </div>
              
              {/* Enhanced Action Buttons */}
              <div className="flex items-center gap-1">
                {/* Auto-save Status */}
                {lastAutoSave && (
                  <div className="hidden xs:flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full mr-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                    Saved
                  </div>
                )}
                
                {/* Save Button */}
                <Button
                  variant={isSaving ? "ghost" : "outline"}
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-3 py-2.5 touch-manipulation min-w-[44px] min-h-[44px] rounded-lg border-gray-300 hover:border-gray-400 hover:bg-gray-50 active:bg-gray-100 transition-all duration-200"
                  aria-label={isSaving ? "Saving CV" : "Save CV"}
                >
                  <Save className={`h-4 w-4 ${isSaving ? 'animate-spin text-blue-600' : 'text-gray-600'}`} />
                  {lastAutoSave && !isSaving && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </Button>
                
                {/* Export Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="px-3 py-2.5 touch-manipulation min-w-[44px] min-h-[44px] rounded-lg border-gray-300 hover:border-blue-400 hover:bg-blue-50 active:bg-blue-100 transition-all duration-200"
                  aria-label="Export CV to PDF"
                >
                  <Share className="h-4 w-4 text-gray-600" />
                </Button>
                
                {/* More Options Menu */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-3 py-2.5 touch-manipulation min-w-[44px] min-h-[44px] rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-all duration-200"
                    aria-label="More options"
                  >
                    <div className="flex flex-col gap-0.5">
                      <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                      <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                      <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Status Bar - Only show when relevant */}
            {(isSaving || lastAutoSave) && (
              <div className="px-4 pb-2">
                <div className="flex items-center justify-center">
                  {isSaving ? (
                    <div className="flex items-center text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                      Saving changes...
                    </div>
                  ) : lastAutoSave ? (
                    <div className="flex items-center text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                      <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      All changes saved
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </header>

          {/* Mobile Content Area */}
          <main className="flex-1 relative overflow-hidden">
            {!showPreview ? (
              /* Edit Mode */
              <div 
                className="h-full overflow-y-auto bg-gray-50"
                style={{ 
                  height: isKeyboardOpen ? adjustedViewHeight : 'calc(100vh - 72px)',
                  paddingBottom: '80px' // Space for floating action bar
                }}
              >
                <div className="p-3">
                  <CVEditor isMobile={true} />
                </div>
              </div>
            ) : (
              /* Preview Mode */
              <div className="h-full bg-white">
                <div 
                  className="h-full overflow-y-auto"
                  style={{ paddingBottom: '80px' }}
                >
                  <CVPreview isMobile={true} />
                </div>
              </div>
            )}

            {/* Mobile Floating Action Bar - Enhanced */}
            <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-xl">
              <div className="flex items-center justify-around py-4 px-4 gap-2">
                <Button
                  variant={!showPreview ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setShowPreview(false)}
                  className="flex-1 min-h-[48px] touch-manipulation rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                
                <Button
                  variant={showPreview ? "default" : "ghost"}
                  size="sm"
                  onClick={togglePreview}
                  className="flex-1 min-h-[48px] touch-manipulation rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDesignPanel(!showDesignPanel)}
                  className="flex-1 min-h-[48px] touch-manipulation rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Design
                </Button>
              </div>
              
              {/* Safe Area for iPhone home indicator */}
              <div className="h-safe-area-inset-bottom"></div>
            </div>

            {/* Mobile Design Panel - Slide up overlay */}
            <AnimatePresence>
              {showDesignPanel && (
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="absolute inset-0 bg-white z-50"
                >
                  <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold">Design Settings</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDesignPanel(false)}
                    >
                      <EyeOff className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="p-4 overflow-y-auto" style={{ height: 'calc(100% - 80px)' }}>
                    <CVToolbar isMobile={true} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      ) : (
        /* Desktop Layout - Enhanced 70/30 Split */
        <div className="flex flex-col h-screen">
          {/* Desktop Header - Enhanced Toolbar */}
          <header className="bg-white border-b border-gray-200 shadow-sm">
            {/* Main Navigation Bar */}
            <div className="px-6 py-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Home
                  </Button>
                  <div className="h-5 w-px bg-gray-300" />
                  <div className="flex items-center gap-3">
                    <h1 className="text-xl font-semibold text-gray-900">CV Builder</h1>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="truncate max-w-[200px]">
                        {currentCV.personal.fullName || "Untitled CV"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Primary Actions */}
                <div className="flex items-center gap-2">
                  {/* Auto-save Status */}
                  {lastAutoSave && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-700 font-medium">Auto-saved</span>
                    </div>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2"
                  >
                    <Save className={`h-4 w-4 ${isSaving ? 'animate-spin' : ''}`} />
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                  
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={handleExport}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export PDF
                  </Button>
                </div>
              </div>
            </div>

            {/* Enhanced Toolbar */}
            <div className="px-6 py-3">
              <div className="flex items-center justify-between">
                {/* Left Toolbar - Editing Tools */}
                <div className="flex items-center gap-3">
                  <CVToolbar />
                  
                  <div className="h-5 w-px bg-gray-300 mx-2" />
                  
                  {/* Layout Mode Selector */}
                  <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                    <Button
                      variant={!showPreview ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setShowPreview(false)}
                      className="h-8 px-3 text-xs font-medium"
                    >
                      Edit Only
                    </Button>
                    <Button
                      variant={showPreview && !isPreviewFullscreen ? "default" : "ghost"}
                      size="sm"
                      onClick={() => {
                        setShowPreview(true)
                        setIsPreviewFullscreen(false)
                      }}
                      className="h-8 px-3 text-xs font-medium"
                    >
                      Split View
                    </Button>
                    <Button
                      variant={isPreviewFullscreen ? "default" : "ghost"}
                      size="sm"
                      onClick={() => {
                        setShowPreview(true)
                        setIsPreviewFullscreen(true)
                      }}
                      className="h-8 px-3 text-xs font-medium"
                    >
                      Preview Only
                    </Button>
                  </div>
                </div>

                {/* Right Toolbar - View Options */}
                <div className="flex items-center gap-2">
                  {/* Zoom Controls for Preview */}
                  {showPreview && (
                    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="Zoom Out"
                      >
                        <span className="text-sm font-bold">-</span>
                      </Button>
                      <span className="text-xs text-gray-600 px-2">100%</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="Zoom In"
                      >
                        <span className="text-sm font-bold">+</span>
                      </Button>
                    </div>
                  )}
                  
                  {/* View Toggle */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={togglePreview}
                    className="flex items-center gap-2"
                  >
                    {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {showPreview ? 'Hide Preview' : 'Show Preview'}
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Desktop Main Content - 70/30 Adaptive Layout */}
          <main className="flex-1 flex overflow-hidden bg-gray-50">
            {/* Editor Panel - 70% width when split */}
            <AnimatePresence>
              {(!isPreviewFullscreen) && (
                <motion.div
                  initial={{ width: showPreview ? "70%" : "100%" }}
                  animate={{ width: showPreview ? "70%" : "100%" }}
                  exit={{ width: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className={`${showPreview ? "border-r border-gray-200" : ""} bg-white overflow-hidden flex flex-col`}
                >
                  {/* Editor Header */}
                  <div className="px-6 py-3 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-medium text-gray-900">Edit Your CV</h2>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>Progress: 75%</span>
                        <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className="w-3/4 h-full bg-blue-500 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Editor Content */}
                  <div className="flex-1 overflow-y-auto">
                    <div className="p-6">
                      <CVEditor isMobile={false} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Preview Panel - 30% width when split */}
            <AnimatePresence>
              {showPreview && (
                <motion.div
                  initial={{ width: isPreviewFullscreen ? "100%" : "30%" }}
                  animate={{ width: isPreviewFullscreen ? "100%" : "30%" }}
                  exit={{ width: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="bg-gray-100 overflow-hidden flex flex-col"
                >
                  {/* Preview Header */}
                  <div className="px-4 py-3 border-b border-gray-200 bg-white">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-medium text-gray-900">Live Preview</h2>
                      <div className="flex items-center gap-2">
                        {!isPreviewFullscreen && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={togglePreviewFullscreen}
                            className="h-7 w-7 p-0"
                            title="Fullscreen Preview"
                          >
                            <Maximize2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {isPreviewFullscreen && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={togglePreviewFullscreen}
                            className="h-7 w-7 p-0"
                            title="Exit Fullscreen"
                          >
                            <Minimize2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Preview Content */}
                  <div className="flex-1 overflow-y-auto">
                    <div className={`${isPreviewFullscreen ? 'p-8' : 'p-4'}`}>
                      <CVPreview isMobile={false} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      )}
    </div>
  )
}