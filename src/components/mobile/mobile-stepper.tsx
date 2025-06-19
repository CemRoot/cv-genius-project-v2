'use client'

import { motion } from 'framer-motion'
import { Check, ChevronRight } from 'lucide-react'

interface Step {
  id: string
  title: string
  description?: string
  status: 'completed' | 'current' | 'upcoming'
}

interface MobileStepperProps {
  steps: Step[]
  currentStep: number
  onStepClick?: (stepIndex: number, step: Step) => void
  orientation?: 'horizontal' | 'vertical'
  variant?: 'default' | 'progress' | 'dots'
  className?: string
}

export function MobileStepper({ 
  steps, 
  currentStep, 
  onStepClick,
  orientation = 'horizontal',
  variant = 'default',
  className = '' 
}: MobileStepperProps) {

  const getStepStatus = (index: number): Step['status'] => {
    if (index < currentStep) return 'completed'
    if (index === currentStep) return 'current'
    return 'upcoming'
  }

  const progressPercentage = ((currentStep + 1) / steps.length) * 100

  if (variant === 'progress') {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(progressPercentage)}%
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div 
            className="bg-cvgenius-purple h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </div>
        
        {steps[currentStep] && (
          <div className="mt-3">
            <h3 className="font-medium text-gray-900">{steps[currentStep].title}</h3>
            {steps[currentStep].description && (
              <p className="text-sm text-gray-600 mt-1">{steps[currentStep].description}</p>
            )}
          </div>
        )}
      </div>
    )
  }

  if (variant === 'dots') {
    return (
      <div className={`flex items-center justify-center gap-2 ${className}`}>
        {steps.map((_, index) => {
          const status = getStepStatus(index)
          return (
            <button
              key={index}
              onClick={() => onStepClick?.(index, steps[index])}
              className={`
                w-3 h-3 rounded-full transition-all duration-200
                ${status === 'completed' ? 'bg-green-500' : 
                  status === 'current' ? 'bg-cvgenius-purple' : 
                  'bg-gray-300'}
              `}
            />
          )
        })}
      </div>
    )
  }

  if (orientation === 'vertical') {
    return (
      <div className={`space-y-4 ${className}`}>
        {steps.map((step, index) => {
          const status = getStepStatus(index)
          const isClickable = onStepClick && status !== 'upcoming'
          
          return (
            <div key={step.id} className="flex gap-3">
              {/* Step indicator */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => isClickable && onStepClick(index, step)}
                  disabled={!isClickable}
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    transition-all duration-200
                    ${status === 'completed' 
                      ? 'bg-green-500 text-white' 
                      : status === 'current'
                      ? 'bg-cvgenius-purple text-white'
                      : 'bg-gray-300 text-gray-600'
                    }
                    ${isClickable ? 'hover:scale-105 cursor-pointer' : 'cursor-default'}
                  `}
                >
                  {status === 'completed' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </button>
                
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className={`
                    w-0.5 h-8 mt-2
                    ${status === 'completed' ? 'bg-green-500' : 'bg-gray-300'}
                  `} />
                )}
              </div>
              
              {/* Step content */}
              <div className="flex-1 pb-8">
                <h3 className={`
                  font-medium
                  ${status === 'current' ? 'text-cvgenius-purple' : 
                    status === 'completed' ? 'text-gray-900' : 'text-gray-500'}
                `}>
                  {step.title}
                </h3>
                {step.description && (
                  <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Horizontal stepper (default)
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center">
        {steps.map((step, index) => {
          const status = getStepStatus(index)
          const isClickable = onStepClick && status !== 'upcoming'
          
          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step indicator */}
              <button
                onClick={() => isClickable && onStepClick(index, step)}
                disabled={!isClickable}
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  transition-all duration-200 flex-shrink-0
                  ${status === 'completed' 
                    ? 'bg-green-500 text-white' 
                    : status === 'current'
                    ? 'bg-cvgenius-purple text-white'
                    : 'bg-gray-300 text-gray-600'
                  }
                  ${isClickable ? 'hover:scale-105 cursor-pointer' : 'cursor-default'}
                `}
              >
                {status === 'completed' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </button>
              
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className={`
                  flex-1 h-0.5 mx-2
                  ${status === 'completed' ? 'bg-green-500' : 'bg-gray-300'}
                `} />
              )}
            </div>
          )
        })}
      </div>
      
      {/* Current step info */}
      <div className="mt-4 text-center">
        <h3 className="font-medium text-gray-900">{steps[currentStep]?.title}</h3>
        {steps[currentStep]?.description && (
          <p className="text-sm text-gray-600 mt-1">{steps[currentStep].description}</p>
        )}
      </div>
    </div>
  )
}