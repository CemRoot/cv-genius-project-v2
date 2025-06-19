'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X } from 'lucide-react'

export interface FloatingAction {
  id: string
  label: string
  icon: React.ReactNode
  onClick: () => void
  color?: string
}

interface MobileFloatingActionButtonProps {
  actions?: FloatingAction[]
  mainAction?: () => void
  mainIcon?: React.ReactNode
  className?: string
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center'
}

export function MobileFloatingActionButton({ 
  actions = [],
  mainAction,
  mainIcon = <Plus className="h-6 w-6" />,
  className = '',
  position = 'bottom-right'
}: MobileFloatingActionButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleMainClick = () => {
    if (actions.length > 0) {
      setIsExpanded(!isExpanded)
    } else if (mainAction) {
      mainAction()
    }
  }

  const handleActionClick = (action: FloatingAction) => {
    action.onClick()
    setIsExpanded(false)
  }

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'bottom-center': 'bottom-6 left-1/2 transform -translate-x-1/2'
  }

  const actionVariants = {
    hidden: { scale: 0, opacity: 0, y: 20 },
    visible: (i: number) => ({
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        type: 'spring',
        stiffness: 400,
        damping: 25
      }
    }),
    exit: (i: number) => ({
      scale: 0,
      opacity: 0,
      y: 20,
      transition: {
        delay: (actions.length - 1 - i) * 0.05,
        duration: 0.2
      }
    })
  }

  return (
    <div className={`fixed z-50 md:hidden ${positionClasses[position]} ${className}`}>
      {/* Action Items */}
      <AnimatePresence>
        {isExpanded && actions.length > 0 && (
          <div className="absolute bottom-16 right-0 space-y-3">
            {actions.map((action, index) => (
              <motion.div
                key={action.id}
                custom={index}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={actionVariants}
                className="flex items-center gap-3"
              >
                {/* Label */}
                <div className="bg-black/80 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap">
                  {action.label}
                </div>
                
                {/* Action Button */}
                <button
                  onClick={() => handleActionClick(action)}
                  className={`
                    w-12 h-12 rounded-full shadow-lg flex items-center justify-center
                    transition-transform hover:scale-110 active:scale-95
                    ${action.color || 'bg-cvgenius-purple text-white'}
                  `}
                >
                  {action.icon}
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        onClick={handleMainClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: isExpanded ? 45 : 0 }}
        className="w-14 h-14 bg-cvgenius-purple text-white rounded-full shadow-lg flex items-center justify-center transition-colors hover:bg-cvgenius-purple/90"
      >
        {isExpanded && actions.length > 0 ? (
          <X className="h-6 w-6" />
        ) : (
          mainIcon
        )}
      </motion.button>

      {/* Backdrop when expanded */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
            className="fixed inset-0 bg-black/20 -z-10"
          />
        )}
      </AnimatePresence>
    </div>
  )
}