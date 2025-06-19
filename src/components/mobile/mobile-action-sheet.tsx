'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export interface ActionSheetOption {
  id: string
  label: string
  icon?: React.ReactNode
  onClick: () => void
  variant?: 'default' | 'destructive' | 'primary'
  disabled?: boolean
}

interface MobileActionSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  options: ActionSheetOption[]
  className?: string
}

export function MobileActionSheet({ 
  isOpen, 
  onClose, 
  title, 
  options,
  className = '' 
}: MobileActionSheetProps) {
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleOptionClick = (option: ActionSheetOption) => {
    if (!option.disabled) {
      option.onClick()
      onClose()
    }
  }

  const getOptionClasses = (variant: ActionSheetOption['variant'] = 'default', disabled = false) => {
    if (disabled) {
      return 'text-gray-400 cursor-not-allowed'
    }

    switch (variant) {
      case 'destructive':
        return 'text-red-600 hover:bg-red-50'
      case 'primary':
        return 'text-cvgenius-purple font-medium hover:bg-cvgenius-purple/5'
      default:
        return 'text-gray-900 hover:bg-gray-50'
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 md:hidden"
            onClick={onClose}
          />

          {/* Action Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 md:hidden ${className}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              {title && (
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors ml-auto"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Options */}
            <div className="py-2 max-h-80 overflow-y-auto">
              {options.map((option, index) => (
                <button
                  key={option.id}
                  onClick={() => handleOptionClick(option)}
                  disabled={option.disabled}
                  className={`
                    w-full flex items-center gap-3 px-4 py-4 text-left transition-colors
                    ${getOptionClasses(option.variant, option.disabled)}
                    ${index < options.length - 1 ? 'border-b border-gray-100' : ''}
                  `}
                >
                  {option.icon && (
                    <div className="flex-shrink-0">
                      {option.icon}
                    </div>
                  )}
                  <span className="flex-1">{option.label}</span>
                </button>
              ))}
            </div>

            {/* Cancel Button */}
            <div className="p-4 border-t bg-gray-50">
              <button
                onClick={onClose}
                className="w-full py-3 text-center text-gray-600 font-medium hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}