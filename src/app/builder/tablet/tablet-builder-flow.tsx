'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  Download, 
  Eye,
  Edit3,
  Grid,
  List,
  Maximize2,
  Minimize2,
  Settings,
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useCVStore } from '@/store/cv-store'
import { CVPreview } from '@/components/cv/cv-preview'
import { TabletSidebar } from './components/tablet-sidebar'
import { TabletEditor } from './components/tablet-editor'
import { TabletTemplateCarousel } from './components/tablet-template-carousel'
import { useGestureNavigation } from '@/hooks/use-gesture-navigation'
import { useResponsive } from '@/hooks/use-responsive'
import { ResponsiveContainer } from '@/components/responsive/responsive-container'
import { cn } from '@/lib/utils'

type ViewMode = 'split' | 'editor' | 'preview'
type NavigationMode = 'sidebar' | 'carousel'

export function TabletBuilderFlow() {
  const { currentCV, sessionState, saveCV } = useCVStore()
  const selectedTemplateId = sessionState.selectedTemplateId || null
  const [viewMode, setViewMode] = useState<ViewMode>('split')
  const [navigationMode, setNavigationMode] = useState<NavigationMode>('sidebar')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [activeSection, setActiveSection] = useState('personal')
  const containerRef = useRef<HTMLDivElement>(null)
  const { orientation } = useResponsive()

  // Gesture navigation for swiping between sections
  const { setElement } = useGestureNavigation({
    onSwipeLeft: () => {
      if (viewMode === 'editor' || viewMode === 'split') {
        setViewMode('preview')
      }
    },
    onSwipeRight: () => {
      if (viewMode === 'preview' || viewMode === 'split') {
        setViewMode('editor')
      }
    },
    threshold: 50
  })

  // Set gesture element
  useState(() => {
    if (containerRef.current) {
      setElement(containerRef.current)
    }
  })

  const handleSave = async () => {
    await saveCV()
    // Show success toast
  }

  const handleExport = () => {
    // Export CV functionality
  }

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }

  const cycleViewMode = () => {
    const modes: ViewMode[] = ['split', 'editor', 'preview']
    const currentIndex = modes.indexOf(viewMode)
    const nextIndex = (currentIndex + 1) % modes.length
    setViewMode(modes[nextIndex])
  }

  // Responsive layout based on orientation
  const isLandscape = orientation === 'landscape'

  return (
    <div 
      ref={containerRef}
      className="h-screen flex flex-col bg-gray-50 overflow-hidden"
    >
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="lg:hidden"
          >
            {isSidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
          </Button>
          
          <h1 className="text-lg font-semibold">CV Builder</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={cycleViewMode}
            className="hidden sm:flex"
          >
            {viewMode === 'split' && <Grid className="w-4 h-4 mr-2" />}
            {viewMode === 'editor' && <Edit3 className="w-4 h-4 mr-2" />}
            {viewMode === 'preview' && <Eye className="w-4 h-4 mr-2" />}
            {viewMode === 'split' ? 'Split' : viewMode === 'editor' ? 'Edit' : 'Preview'}
          </Button>

          {/* Navigation mode toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setNavigationMode(navigationMode === 'sidebar' ? 'carousel' : 'sidebar')}
          >
            {navigationMode === 'sidebar' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
          </Button>

          <Button onClick={handleSave} size="sm" variant="outline">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          
          <Button disabled size="sm" className="opacity-50 cursor-not-allowed" title="Export feature is temporarily unavailable">
            <Download className="w-4 h-4 mr-2" />
            Export (Unavailable)
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation - Sidebar or Carousel */}
        <AnimatePresence mode="wait">
          {navigationMode === 'sidebar' && (
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: isSidebarCollapsed ? -280 : 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={cn(
                'border-r bg-white',
                isLandscape ? 'w-72' : 'w-64'
              )}
            >
              <TabletSidebar
                activeSection={activeSection}
                onSectionChange={setActiveSection}
                isCollapsed={isSidebarCollapsed}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Editor and Preview */}
        <div className="flex-1 flex overflow-hidden">
          {/* Editor Panel */}
          {(viewMode === 'split' || viewMode === 'editor') && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={cn(
                'overflow-y-auto',
                viewMode === 'split' ? (isLandscape ? 'w-1/2' : 'w-full') : 'w-full'
              )}
            >
              {navigationMode === 'carousel' && viewMode === 'editor' && (
                <div className="p-4 border-b bg-white">
                  <TabletTemplateCarousel
                    selectedTemplateId={selectedTemplateId}
                    onTemplateSelect={(id) => {
                      // Handle template selection
                    }}
                  />
                </div>
              )}
              
              <TabletEditor
                activeSection={activeSection}
                onSectionChange={setActiveSection}
              />
            </motion.div>
          )}

          {/* Preview Panel */}
          {(viewMode === 'split' || viewMode === 'preview') && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={cn(
                'bg-gray-100 overflow-hidden',
                viewMode === 'split' ? (isLandscape ? 'w-1/2' : 'hidden') : 'w-full'
              )}
            >
              <div className="h-full p-6 overflow-y-auto">
                <div className="max-w-4xl mx-auto">
                  <CVPreview />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom navigation for portrait mode */}
      {!isLandscape && (
        <div className="bg-white border-t p-2 flex justify-center gap-2">
          <Button
            variant={viewMode === 'editor' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('editor')}
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant={viewMode === 'split' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('split')}
          >
            <Grid className="w-4 h-4 mr-2" />
            Split
          </Button>
          <Button
            variant={viewMode === 'preview' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('preview')}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
        </div>
      )}
    </div>
  )
}