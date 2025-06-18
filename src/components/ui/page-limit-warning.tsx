"use client"

import { useEffect, useState } from 'react'
import { AlertTriangle, FileText, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'

interface PageLimitWarningProps {
  currentPageCount: number
  maxPages?: number
  onDismiss?: () => void
  showOptimizationTips?: boolean
}

export function PageLimitWarning({ 
  currentPageCount, 
  maxPages = 2, 
  onDismiss,
  showOptimizationTips = true 
}: PageLimitWarningProps) {
  const [isDismissed, setIsDismissed] = useState(false)
  const [showTips, setShowTips] = useState(false)
  
  const isOverLimit = currentPageCount > maxPages
  const isNearLimit = currentPageCount >= maxPages * 0.8 && currentPageCount <= maxPages
  
  const shouldShow = (isOverLimit || isNearLimit) && !isDismissed

  useEffect(() => {
    // Reset dismissed state when page count changes significantly
    if (currentPageCount <= maxPages * 0.7) {
      setIsDismissed(false)
    }
  }, [currentPageCount, maxPages])

  const handleDismiss = () => {
    setIsDismissed(true)
    onDismiss?.()
  }

  const optimizationTips = [
    "Use bullet points instead of paragraphs for achievements",
    "Remove older or less relevant work experience",
    "Consolidate similar skills into categories",
    "Use concise, action-oriented language",
    "Remove redundant information between sections",
    "Consider removing personal interests if space is tight"
  ]

  if (!shouldShow) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className={`border rounded-lg p-4 mb-4 ${
          isOverLimit 
            ? 'bg-red-50 border-red-200 text-red-800' 
            : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className={`rounded-full p-2 ${
            isOverLimit ? 'bg-red-100' : 'bg-amber-100'
          }`}>
            {isOverLimit ? (
              <AlertTriangle className="h-5 w-5" />
            ) : (
              <FileText className="h-5 w-5" />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">
                {isOverLimit 
                  ? 'CV Exceeds Recommended Length' 
                  : 'CV Approaching Length Limit'}
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-6 w-6 p-0 text-current hover:bg-current/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-sm mt-1">
              {isOverLimit ? (
                <>
                  Your CV is currently <strong>{currentPageCount} pages</strong> long. 
                  Irish employers typically prefer CVs to be <strong>{maxPages} pages maximum</strong>.
                </>
              ) : (
                <>
                  Your CV is <strong>{currentPageCount} pages</strong> long. 
                  Consider keeping it within <strong>{maxPages} pages</strong> for Irish employers.
                </>
              )}
            </p>

            {showOptimizationTips && (
              <div className="mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTips(!showTips)}
                  className="text-current hover:bg-current/10 p-0 h-auto font-medium"
                >
                  {showTips ? 'Hide' : 'Show'} optimization tips
                </Button>
                
                <AnimatePresence>
                  {showTips && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2"
                    >
                      <ul className="text-sm space-y-1">
                        {optimizationTips.map((tip, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start gap-2"
                          >
                            <span className="text-current/60 mt-1">•</span>
                            <span>{tip}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-current/20">
          <div className="flex items-center justify-between text-xs">
            <span>
              🇮🇪 Irish CV best practice: Keep it concise and relevant
            </span>
            <span className="font-medium">
              {Math.round((currentPageCount / maxPages) * 100)}% of recommended length
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}