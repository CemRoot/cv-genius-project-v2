"use client"

import { Button } from "@/components/ui/button"
import { Undo2, Redo2, RotateCcw } from "lucide-react"
import { motion } from "framer-motion"

interface UndoRedoToolbarProps {
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  onClearHistory?: () => void
  historyLength?: number
  currentIndex?: number
  className?: string
}

export function UndoRedoToolbar({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClearHistory,
  historyLength = 0,
  currentIndex = 0,
  className = ""
}: UndoRedoToolbarProps) {
  return (
    <motion.div 
      className={`flex items-center gap-1 ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={onUndo}
        disabled={!canUndo}
        className="h-8 w-8 p-0"
        title={`Undo ${canUndo ? `(${currentIndex} steps back)` : '(no history)'}`}
      >
        <Undo2 className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onRedo}
        disabled={!canRedo}
        className="h-8 w-8 p-0"
        title={`Redo ${canRedo ? `(${historyLength - currentIndex - 1} steps forward)` : '(no future states)'}`}
      >
        <Redo2 className="h-4 w-4" />
      </Button>

      {onClearHistory && historyLength > 1 && (
        <>
          <div className="w-px h-4 bg-border mx-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearHistory}
            className="h-8 w-8 p-0"
            title="Clear history"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </>
      )}

      {historyLength > 1 && (
        <div className="flex items-center gap-1 ml-2">
          <span className="text-xs text-muted-foreground">
            {currentIndex + 1}/{historyLength}
          </span>
        </div>
      )}
    </motion.div>
  )
}