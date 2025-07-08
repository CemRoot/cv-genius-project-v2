'use client'

import { useAutoSaveStatus } from '@/hooks/use-auto-save'
import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface AutoSaveStatusProps {
  className?: string
  showIcon?: boolean
  showText?: boolean
  compact?: boolean
}

export function AutoSaveStatus({ 
  className = '', 
  showIcon = true, 
  showText = true,
  compact = false 
}: AutoSaveStatusProps) {
  const { message, color, isEnabled, lastSave } = useAutoSaveStatus()
  
  const getIcon = () => {
    if (!isEnabled) {
      return <XCircle className="h-4 w-4" />
    }
    
    if (!lastSave) {
      return <AlertCircle className="h-4 w-4" />
    }
    
    const saveDate = new Date(lastSave)
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - saveDate.getTime()) / (1000 * 60))
    
    if (diffMinutes < 2) {
      return <CheckCircle className="h-4 w-4" />
    } else {
      return <Clock className="h-4 w-4" />
    }
  }
  
  const getStatusDot = () => {
    if (!isEnabled) return 'bg-gray-400'
    if (!lastSave) return 'bg-yellow-400'
    
    const saveDate = new Date(lastSave)
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - saveDate.getTime()) / (1000 * 60))
    
    if (diffMinutes < 2) return 'bg-green-400'
    if (diffMinutes < 10) return 'bg-blue-400'
    return 'bg-yellow-400'
  }
  
  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className={`w-2 h-2 rounded-full ${getStatusDot()}`} />
        {showText && (
          <span className={`text-xs ${color}`}>
            {message}
          </span>
        )}
      </div>
    )
  }
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={message}
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 5 }}
        transition={{ duration: 0.2 }}
        className={`flex items-center gap-2 ${className}`}
      >
        {showIcon && (
          <span className={color}>
            {getIcon()}
          </span>
        )}
        {showText && (
          <span className={`text-sm font-medium ${color}`}>
            {message}
          </span>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

// Floating auto-save indicator
export function FloatingAutoSaveIndicator() {
  const { isEnabled, lastSave } = useAutoSaveStatus()
  
  if (!isEnabled) return null
  
  const saveDate = lastSave ? new Date(lastSave) : null
  const now = new Date()
  const diffMinutes = saveDate ? Math.floor((now.getTime() - saveDate.getTime()) / (1000 * 60)) : null
  
  // Only show if recently saved (within 5 seconds)
  const showIndicator = saveDate && diffMinutes !== null && diffMinutes < 1
  
  return (
    <AnimatePresence>
      {showIndicator && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50"
        >
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm font-medium">Auto-saved!</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Auto-save settings panel
export function AutoSaveSettings() {
  const { isEnabled } = useAutoSaveStatus()
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Auto-Save</h3>
          <p className="text-sm text-gray-600">
            Automatically save your CV progress
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${isEnabled ? 'text-green-600' : 'text-gray-500'}`}>
            {isEnabled ? 'Enabled' : 'Disabled'}
          </span>
          <div className={`w-3 h-3 rounded-full ${isEnabled ? 'bg-green-400' : 'bg-gray-400'}`} />
        </div>
      </div>
      
      <AutoSaveStatus className="text-gray-600" />
      
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Changes are saved automatically every 2 seconds</p>
        <p>• Periodic backup every 30 seconds</p>
        <p>• Data is saved before you leave the page</p>
        <p>• Stored locally in your browser</p>
      </div>
    </div>
  )
}