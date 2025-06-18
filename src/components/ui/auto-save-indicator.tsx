"use client"

import { useEffect, useState } from 'react'
import { CheckCircle, Clock, Save } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface AutoSaveIndicatorProps {
  isSaving: boolean
  lastSaved: Date | null
  saveCount: number
  className?: string
}

export function AutoSaveIndicator({ isSaving, lastSaved, saveCount, className = "" }: AutoSaveIndicatorProps) {
  const [timeAgo, setTimeAgo] = useState<string>("")

  useEffect(() => {
    if (!lastSaved) return

    const updateTimeAgo = () => {
      const now = new Date()
      const diffInSeconds = Math.floor((now.getTime() - lastSaved.getTime()) / 1000)
      
      if (diffInSeconds < 60) {
        setTimeAgo("just now")
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60)
        setTimeAgo(`${minutes}m ago`)
      } else {
        const hours = Math.floor(diffInSeconds / 3600)
        setTimeAgo(`${hours}h ago`)
      }
    }

    updateTimeAgo()
    const interval = setInterval(updateTimeAgo, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [lastSaved])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`flex items-center gap-2 text-sm ${className}`}
      >
        {isSaving ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Save className="h-4 w-4 text-blue-600" />
            </motion.div>
            <span className="text-blue-600">Saving...</span>
          </>
        ) : lastSaved ? (
          <>
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-green-600">
              Saved {timeAgo}
            </span>
            {saveCount > 1 && (
              <span className="text-xs text-gray-500">
                ({saveCount} saves)
              </span>
            )}
          </>
        ) : (
          <>
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-gray-500">Auto-save enabled</span>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  )
}