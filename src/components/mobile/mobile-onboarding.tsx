'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Edit, 
  Eye, 
  Settings, 
  Download, 
  Zap,
  CheckCircle,
  Star,
  Target,
  Smartphone
} from 'lucide-react'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  tips?: string[]
  action?: {
    label: string
    href?: string
  }
}

interface MobileOnboardingProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
  currentPage?: string
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to CVGenius Mobile!',
    description: 'Create professional CVs optimized for Dublin jobs, right from your phone.',
    icon: <Smartphone className="h-8 w-8 text-cvgenius-purple" />,
    tips: [
      'Swipe between editing and preview',
      'All changes save automatically',
      'Works offline when needed'
    ]
  },
  {
    id: 'editing',
    title: 'Mobile-First Editing',
    description: 'Tap any section to edit. The interface adapts to your screen and keyboard.',
    icon: <Edit className="h-8 w-8 text-blue-600" />,
    tips: [
      'Sections collapse to save space',
      'Smart keyboard handling',
      'Touch-friendly form controls'
    ]
  },
  {
    id: 'preview',
    title: 'Interactive Preview',
    description: 'Pinch to zoom, pan to navigate. See exactly how your CV will look.',
    icon: <Eye className="h-8 w-8 text-green-600" />,
    tips: [
      'Pinch to zoom in/out',
      'Pan when zoomed in',
      'Share directly from preview'
    ]
  },
  {
    id: 'design',
    title: 'Design Tools',
    description: 'Choose templates and customize your CV design from the Design tab.',
    icon: <Settings className="h-8 w-8 text-purple-600" />,
    tips: [
      'Harvard template included',
      'More templates coming soon',
      'Customize fonts and spacing'
    ]
  },
  {
    id: 'export',
    title: 'Download & Share',
    description: 'Export to PDF or share your CV directly from your mobile device.',
    icon: <Download className="h-8 w-8 text-orange-600" />,
    tips: [
      'High-quality PDF export',
      'Share via any app',
      'Download to Files app'
    ]
  }
]

export function MobileOnboarding({ isOpen, onClose, onComplete, currentPage }: MobileOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [showProgress, setShowProgress] = useState(true)

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleComplete = () => {
    onComplete()
    onClose()
    // Store completion in localStorage
    localStorage.setItem('cvgenius-mobile-onboarding-completed', 'true')
  }

  const handleSkip = () => {
    onClose()
    // Store skip in localStorage but don't mark as completed
    localStorage.setItem('cvgenius-mobile-onboarding-skipped', 'true')
  }

  const step = onboardingSteps[currentStep]
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full max-h-[90vh] overflow-hidden relative"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-cvgenius-purple to-blue-600 px-6 py-4 text-white relative">
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                {step.icon}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{step.title}</h3>
                <p className="text-white/80 text-sm">Step {currentStep + 1} of {onboardingSteps.length}</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {showProgress && (
            <div className="mt-4">
              <div className="bg-white/20 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                  className="bg-white h-full rounded-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-gray-600 mb-6 leading-relaxed">
                {step.description}
              </p>

              {step.tips && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    Quick Tips:
                  </h4>
                  <ul className="space-y-2">
                    {step.tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {step.action && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800 mb-2">Try it now:</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-700 border-blue-300 hover:bg-blue-100"
                  >
                    <Target className="h-4 w-4 mr-2" />
                    {step.action.label}
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="border-t bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <div className="flex items-center gap-2">
              {onboardingSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index <= currentStep ? 'bg-cvgenius-purple' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              size="sm"
              className="bg-cvgenius-purple hover:bg-cvgenius-purple/90 text-white flex items-center gap-2"
            >
              {currentStep === onboardingSteps.length - 1 ? (
                <>
                  <Zap className="h-4 w-4" />
                  Get Started
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// Hook to manage onboarding state
export function useMobileOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false)

  useEffect(() => {
    // Check if user has completed or skipped onboarding
    const completed = localStorage.getItem('cvgenius-mobile-onboarding-completed') === 'true'
    const skipped = localStorage.getItem('cvgenius-mobile-onboarding-skipped') === 'true'
    
    setHasCompletedOnboarding(completed)
    
    // Show onboarding for new mobile users
    if (!completed && !skipped) {
      // Check if mobile
      const isMobile = window.innerWidth < 768
      if (isMobile) {
        // Delay showing onboarding to let page load
        setTimeout(() => setShowOnboarding(true), 1000)
      }
    }
  }, [])

  const startOnboarding = () => {
    setShowOnboarding(true)
  }

  const completeOnboarding = () => {
    setHasCompletedOnboarding(true)
    setShowOnboarding(false)
  }

  const closeOnboarding = () => {
    setShowOnboarding(false)
  }

  return {
    showOnboarding,
    hasCompletedOnboarding,
    startOnboarding,
    completeOnboarding,
    closeOnboarding
  }
}