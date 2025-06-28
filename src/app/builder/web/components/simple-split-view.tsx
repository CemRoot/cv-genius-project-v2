'use client'

import { ReactNode, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Eye, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SimpleSplitViewProps {
  leftPanel: ReactNode
  rightPanel: ReactNode
}

export function SimpleSplitView({ leftPanel, rightPanel }: SimpleSplitViewProps) {
  const [leftPanelVisible, setLeftPanelVisible] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      // Mobile'de otomatik olarak preview'i gizle
      if (window.innerWidth < 768) {
        setLeftPanelVisible(true)
      }
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className={cn(
      "h-screen bg-gray-50 overflow-hidden",
      isMobile ? "block" : "flex"
    )}>
      {/* Mobile View */}
      {isMobile ? (
        <>
          {/* Mobile Tab Bar */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40">
            <div className="flex">
              <button
                onClick={() => setLeftPanelVisible(true)}
                className={cn(
                  "flex-1 py-3 flex flex-col items-center gap-1 transition-colors",
                  leftPanelVisible 
                    ? "text-blue-600 bg-blue-50" 
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                <FileText className="w-5 h-5" />
                <span className="text-xs font-medium">Form</span>
              </button>
              <button
                onClick={() => setLeftPanelVisible(false)}
                className={cn(
                  "flex-1 py-3 flex flex-col items-center gap-1 transition-colors",
                  !leftPanelVisible 
                    ? "text-blue-600 bg-blue-50" 
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                <Eye className="w-5 h-5" />
                <span className="text-xs font-medium">Preview</span>
              </button>
            </div>
          </div>

          {/* Mobile Content */}
          <div className="h-full pb-16">
            {leftPanelVisible ? (
              <div className="h-full overflow-y-auto bg-white">
                {leftPanel}
              </div>
            ) : (
              <div className="h-full overflow-hidden">
                {rightPanel}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Desktop View */}
          <div
            className={cn(
              "transition-all duration-300 bg-white border-r overflow-hidden flex-shrink-0",
              leftPanelVisible ? "w-[50%] max-w-[800px]" : "w-0"
            )}
          >
            <div className="h-full overflow-y-auto">
              {leftPanel}
            </div>
          </div>

          {/* Desktop Toggle Button */}
          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setLeftPanelVisible(!leftPanelVisible)}
              className={cn(
                "absolute top-4 z-20 bg-white shadow-md border-gray-200",
                "hover:bg-gray-50 hover:shadow-lg transition-all",
                leftPanelVisible ? "-right-5" : "left-4"
              )}
            >
              {leftPanelVisible ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Desktop Right Panel */}
          <div className="flex-1 transition-all duration-300 relative overflow-hidden">
            <div className="h-full overflow-hidden">
              {rightPanel}
            </div>
          </div>
        </>
      )}
    </div>
  )
}