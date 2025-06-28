'use client'

import { ReactNode, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Maximize2, Minimize2, PanelLeftClose, PanelRightClose } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface SplitViewEditorProps {
  leftPanel: ReactNode
  rightPanel: ReactNode
  defaultSplitRatio?: number
  minPanelWidth?: number
}

export function SplitViewEditor({ 
  leftPanel, 
  rightPanel,
  defaultSplitRatio = 50,
  minPanelWidth = 300
}: SplitViewEditorProps) {
  const [splitRatio, setSplitRatio] = useState(defaultSplitRatio)
  const [isDragging, setIsDragging] = useState(false)
  const [leftCollapsed, setLeftCollapsed] = useState(false)
  const [rightCollapsed, setRightCollapsed] = useState(false)
  const [fullscreenPanel, setFullscreenPanel] = useState<'left' | 'right' | null>(null)

  const handleMouseDown = () => {
    setIsDragging(true)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    
    const container = e.currentTarget as HTMLDivElement
    const rect = container.getBoundingClientRect()
    const x = e.clientX - rect.left
    const newRatio = (x / rect.width) * 100
    
    // Ensure minimum panel width
    const minRatio = (minPanelWidth / rect.width) * 100
    const maxRatio = 100 - minRatio
    
    setSplitRatio(Math.min(Math.max(newRatio, minRatio), maxRatio))
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Calculate actual widths
  const leftWidth = leftCollapsed ? 0 : rightCollapsed ? 100 : splitRatio
  const rightWidth = rightCollapsed ? 0 : leftCollapsed ? 100 : (100 - splitRatio)

  return (
    <div 
      className="flex h-screen relative"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Left Panel */}
      <AnimatePresence>
        {!rightCollapsed && (
          <motion.div
            initial={{ width: `${leftWidth}%` }}
            animate={{ width: `${leftWidth}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`relative overflow-hidden ${leftCollapsed ? 'hidden' : ''}`}
          >
            <div className="h-full overflow-y-auto bg-white">
              {/* Fullscreen Toggle */}
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                {!fullscreenPanel && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setLeftCollapsed(!leftCollapsed)}
                      className="bg-white/90 backdrop-blur"
                    >
                      <PanelLeftClose className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setFullscreenPanel('left')}
                      className="bg-white/90 backdrop-blur"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
                {fullscreenPanel === 'left' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setFullscreenPanel(null)}
                    className="bg-white/90 backdrop-blur"
                  >
                    <Minimize2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              {leftPanel}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resize Handle */}
      {!leftCollapsed && !rightCollapsed && !fullscreenPanel && (
        <div
          className={`w-1 bg-gray-200 hover:bg-blue-500 cursor-col-resize relative transition-colors ${
            isDragging ? 'bg-blue-500' : ''
          }`}
          onMouseDown={handleMouseDown}
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="flex flex-col gap-1">
              <div className="w-1 h-3 bg-gray-400 rounded-full" />
              <div className="w-1 h-3 bg-gray-400 rounded-full" />
              <div className="w-1 h-3 bg-gray-400 rounded-full" />
            </div>
          </div>
        </div>
      )}

      {/* Right Panel */}
      <AnimatePresence>
        {!leftCollapsed && (
          <motion.div
            initial={{ width: `${rightWidth}%` }}
            animate={{ 
              width: fullscreenPanel === 'left' ? '0%' : 
                     fullscreenPanel === 'right' ? '100%' : 
                     `${rightWidth}%` 
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`relative overflow-hidden ${rightCollapsed ? 'hidden' : ''}`}
          >
            <div className="h-full overflow-y-auto bg-gray-50">
              {/* Fullscreen Toggle */}
              <div className="absolute top-4 left-4 z-10 flex gap-2">
                {!fullscreenPanel && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setFullscreenPanel('right')}
                      className="bg-white/90 backdrop-blur"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRightCollapsed(!rightCollapsed)}
                      className="bg-white/90 backdrop-blur"
                    >
                      <PanelRightClose className="h-4 w-4" />
                    </Button>
                  </>
                )}
                {fullscreenPanel === 'right' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setFullscreenPanel(null)}
                    className="bg-white/90 backdrop-blur"
                  >
                    <Minimize2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              {rightPanel}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Overlay */}
      {fullscreenPanel && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-white"
        >
          <Button
            size="sm"
            variant="outline"
            onClick={() => setFullscreenPanel(null)}
            className="absolute top-4 right-4 z-10"
          >
            <Minimize2 className="h-4 w-4 mr-2" />
            Exit Fullscreen
          </Button>
          
          {fullscreenPanel === 'left' ? leftPanel : rightPanel}
        </motion.div>
      )}
    </div>
  )
}