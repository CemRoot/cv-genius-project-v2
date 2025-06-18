"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CVEditor } from "@/components/cv/cv-editor"
import { CVPreview } from "@/components/cv/cv-preview"
import { CVToolbar } from "@/components/cv/cv-toolbar"
import { Button } from "@/components/ui/button"
import { PanelLeftClose, PanelLeftOpen, Save, Download, Eye, EyeOff } from "lucide-react"
import { useCVStore } from "@/store/cv-store"
import { motion, AnimatePresence } from "framer-motion"

export default function CVBuilderPage() {
  const [showPreview, setShowPreview] = useState(true)
  const [isPreviewOnly, setIsPreviewOnly] = useState(false)
  const { currentCV, saveCV } = useCVStore()
  const router = useRouter()
  
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

  const handleExport = () => {
    // Save current CV before exporting
    saveCV()
    // Navigate to export page
    router.push('/export')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-16 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">CV Builder</h1>
              <div className="text-sm text-muted-foreground">
                {currentCV.personal.fullName || "Untitled CV"}
              </div>
            </div>

            {/* Desktop Controls */}
            <div className="hidden md:flex items-center gap-2">
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
              
              <Button variant="outline" size="sm" onClick={saveCV}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              
              <Button variant="cvgenius" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>

            {/* Mobile Controls */}
            <div className="md:hidden flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button variant="cvgenius" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
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
                <CVEditor />
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
                <CVPreview />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Footer */}
      <div className="md:hidden border-t bg-background p-4">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={saveCV}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          
          <div className="text-xs text-muted-foreground">
            Auto-saved 2 min ago
          </div>
          
          <Button variant="cvgenius" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
    </div>
  )
}