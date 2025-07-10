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
          {/* Mobile Header - Compact */}
          <header className="bg-white border-b border-gray-200 shadow-sm">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/')}
                  className="p-2"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">CV Builder</h1>
                  <p className="text-xs text-gray-500 truncate">
                    {currentCV.personal.fullName || "Untitled CV"}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={handleSave}
                   disabled={isSaving}
                   className="p-2"
                 >
                   <Save className={`h-4 w-4 ${isSaving ? 'animate-spin' : ''}`} />
                   {lastAutoSave && <span className="ml-1 text-xs text-green-600">✓</span>}
                 </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExport}
                  className="p-2"
                >
                  <Share className="h-4 w-4" />
                </Button>
              </div>
            </div>
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

            {/* Mobile Floating Action Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
              <div className="flex items-center justify-around py-3 px-4">
                <Button
                  variant={!showPreview ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setShowPreview(false)}
                  className="flex-1 mx-1"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                
                <Button
                  variant={showPreview ? "default" : "ghost"}
                  size="sm"
                  onClick={togglePreview}
                  className="flex-1 mx-1"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDesignPanel(!showDesignPanel)}
                  className="flex-1 mx-1"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Design
                </Button>
              </div>
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
        /* Desktop Layout - Improved */
        <div className="flex flex-col h-screen">
          {/* Desktop Header - Streamlined */}
          <header className="bg-white border-b border-gray-200 shadow-sm">
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/')}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <div className="h-6 w-px bg-gray-300" />
                  <h1 className="text-xl font-semibold text-gray-900">CV Builder</h1>
                  <span className="text-sm text-gray-500">
                    {currentCV.personal.fullName || "Untitled CV"}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <CVToolbar />
                  
                  <div className="h-6 w-px bg-gray-300" />
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={togglePreview}
                  >
                    {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                    {showPreview ? 'Hide Preview' : 'Show Preview'}
                  </Button>
                  
                  {showPreview && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={togglePreviewFullscreen}
                    >
                      {isPreviewFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </Button>
                  )}
                  
                  <div className="h-6 w-px bg-gray-300" />
                  
                                     <div className="flex items-center gap-2">
                     <Button 
                       variant="outline" 
                       size="sm" 
                       onClick={handleSave}
                       disabled={isSaving}
                     >
                       <Save className="h-4 w-4 mr-2" />
                       {isSaving ? 'Saving...' : 'Save'}
                     </Button>
                     
                     {lastAutoSave && (
                       <span className="text-xs text-green-600">
                         Auto-saved
                       </span>
                     )}
                   </div>
                  
                  <Button variant="default" size="sm" onClick={handleExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Desktop Main Content - Adaptive Layout */}
          <main className="flex-1 flex overflow-hidden">
            {/* Editor Panel - Adaptive width */}
            <AnimatePresence>
              {(!isPreviewFullscreen) && (
                <motion.div
                  initial={{ width: showPreview ? "65%" : "100%" }}
                  animate={{ width: showPreview ? "65%" : "100%" }}
                  exit={{ width: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`${showPreview ? "border-r border-gray-200" : ""} bg-white overflow-hidden`}
                >
                  <div className="h-full overflow-y-auto p-6">
                    <CVEditor isMobile={false} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Preview Panel - Adaptive width */}
            <AnimatePresence>
              {showPreview && (
                <motion.div
                  initial={{ width: isPreviewFullscreen ? "100%" : "35%" }}
                  animate={{ width: isPreviewFullscreen ? "100%" : "35%" }}
                  exit={{ width: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-100 overflow-hidden"
                >
                  <div className="h-full overflow-y-auto p-4">
                    <CVPreview isMobile={false} />
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