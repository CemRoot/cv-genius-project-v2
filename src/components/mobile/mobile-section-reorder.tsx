'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { 
  GripVertical, 
  Eye, 
  EyeOff, 
  ChevronDown, 
  Check, 
  X,
  MoreHorizontal
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useCVStore } from '@/store/cv-store'
import type { CVSection } from '@/types/cv'

interface MobileSectionReorderProps {
  isOpen: boolean
  onClose: () => void
  onSectionToggle: (sectionId: string) => void
  expandedSections: string[]
}

export function MobileSectionReorder({ 
  isOpen, 
  onClose, 
  onSectionToggle, 
  expandedSections 
}: MobileSectionReorderProps) {
  const { currentCV, updateSection, reorderSections } = useCVStore()
  const [sections, setSections] = useState<CVSection[]>([])
  const [isDragActive, setIsDragActive] = useState(false)

  // Update local sections when CV changes
  useEffect(() => {
    if (currentCV.sections) {
      setSections([...currentCV.sections].sort((a, b) => a.order - b.order))
    }
  }, [currentCV.sections])

  const handleReorder = (newSections: CVSection[]) => {
    setSections(newSections)
    
    // Update the order in the store
    const fromIndex = currentCV.sections.findIndex(s => s.id === newSections[0].id)
    const toIndex = newSections.findIndex(s => s.id === newSections[0].id)
    
    // Find which section moved
    for (let i = 0; i < newSections.length; i++) {
      const currentOrder = currentCV.sections.find(s => s.id === newSections[i].id)?.order
      if (currentOrder !== i + 1) {
        const oldIndex = currentCV.sections.findIndex(s => s.id === newSections[i].id)
        reorderSections(oldIndex, i)
        break
      }
    }
  }

  const toggleSectionVisibility = (sectionId: string, visible: boolean) => {
    const section = sections.find(s => s.id === sectionId)
    if (section) {
      updateSection(sectionId, { visible })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end">
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="bg-white rounded-t-2xl w-full max-h-[80vh] overflow-hidden"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Reorder CV Sections</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Instructions */}
        <div className="px-6 py-3 bg-blue-50 border-b">
          <p className="text-sm text-blue-800">
            <strong>Drag</strong> sections to reorder them. <strong>Toggle</strong> visibility on/off.
          </p>
        </div>

        {/* Section List */}
        <div className="flex-1 overflow-y-auto">
          <Reorder.Group
            axis="y"
            values={sections}
            onReorder={handleReorder}
            className="divide-y"
          >
            <AnimatePresence>
              {sections.map((section, index) => (
                <SectionReorderItem
                  key={section.id}
                  section={section}
                  index={index}
                  onToggleVisibility={toggleSectionVisibility}
                  onToggleExpanded={() => onSectionToggle(section.type)}
                  isExpanded={expandedSections.includes(section.type)}
                  isDragActive={isDragActive}
                  onDragStart={() => setIsDragActive(true)}
                  onDragEnd={() => setIsDragActive(false)}
                />
              ))}
            </AnimatePresence>
          </Reorder.Group>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4">
          <Button
            onClick={onClose}
            className="w-full bg-cvgenius-purple hover:bg-cvgenius-purple/90 text-white"
          >
            <Check className="h-4 w-4 mr-2" />
            Done
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

interface SectionReorderItemProps {
  section: CVSection
  index: number
  onToggleVisibility: (sectionId: string, visible: boolean) => void
  onToggleExpanded: () => void
  isExpanded: boolean
  isDragActive: boolean
  onDragStart: () => void
  onDragEnd: () => void
}

function SectionReorderItem({
  section,
  index,
  onToggleVisibility,
  onToggleExpanded,
  isExpanded,
  isDragActive,
  onDragStart,
  onDragEnd
}: SectionReorderItemProps) {
  const [isDragging, setIsDragging] = useState(false)

  return (
    <Reorder.Item
      value={section}
      dragListener={false}
      className={`
        relative bg-white transition-all duration-200
        ${isDragging ? 'shadow-lg scale-[1.02] z-10' : ''}
        ${isDragActive && !isDragging ? 'opacity-60' : ''}
      `}
      onDragStart={() => {
        setIsDragging(true)
        onDragStart()
      }}
      onDragEnd={() => {
        setIsDragging(false)
        onDragEnd()
      }}
    >
      <div className="flex items-center px-6 py-4 touch-manipulation">
        {/* Drag Handle */}
        <Reorder.Item
          value={section}
          dragListener={true}
          className="flex items-center mr-3 cursor-grab active:cursor-grabbing touch-manipulation p-2 -m-2"
        >
          <GripVertical className="h-5 w-5 text-gray-400" />
        </Reorder.Item>

        {/* Section Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <h4 className="font-medium text-gray-900 truncate">{section.title}</h4>
                <p className="text-sm text-gray-500 capitalize">{section.type}</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 ml-3">
              {/* Visibility Toggle */}
              <div className="flex items-center gap-2">
                <Switch
                  checked={section.visible}
                  onCheckedChange={(checked) => onToggleVisibility(section.id, checked)}
                  className="data-[state=checked]:bg-green-600"
                />
                <div className="text-gray-400">
                  {section.visible ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </div>
              </div>

              {/* Expand Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleExpanded}
                className="p-2 -m-2"
              >
                <ChevronDown 
                  className={`h-4 w-4 transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`} 
                />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Status Indicator */}
      {section.visible && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500" />
      )}
      
      {isDragging && (
        <div className="absolute inset-0 bg-blue-500/10 border-2 border-blue-500 border-dashed rounded-lg" />
      )}
    </Reorder.Item>
  )
}

// Hook for mobile section reordering
export function useMobileSectionReorder() {
  const [isOpen, setIsOpen] = useState(false)

  const openReorder = () => setIsOpen(true)
  const closeReorder = () => setIsOpen(false)

  return {
    isOpen,
    openReorder,
    closeReorder
  }
}