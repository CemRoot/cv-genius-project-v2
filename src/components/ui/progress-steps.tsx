import React from 'react'
import { CheckCircle, Circle, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProgressStep {
  id: string
  title: string
  description?: string
  completed: boolean
  current?: boolean
}

interface ProgressStepsProps {
  steps: ProgressStep[]
  className?: string
  variant?: 'horizontal' | 'vertical'
}

export function ProgressSteps({ steps, className, variant = 'horizontal' }: ProgressStepsProps) {
  if (variant === 'vertical') {
    return (
      <div className={cn("space-y-4", className)}>
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1
          
          return (
            <div key={step.id} className="relative">
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  {step.completed ? (
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  ) : step.current ? (
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <Circle className="w-5 h-5 text-white fill-current" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <Circle className="w-5 h-5 text-gray-500" />
                    </div>
                  )}
                  
                  {!isLast && (
                    <div className={cn(
                      "w-0.5 h-12 mt-2",
                      step.completed ? "bg-green-500" : "bg-gray-300"
                    )} />
                  )}
                </div>
                
                <div className="flex-1 min-w-0 pb-8">
                  <h3 className={cn(
                    "text-sm font-medium",
                    step.completed ? "text-green-700" : step.current ? "text-blue-700" : "text-gray-500"
                  )}>
                    {step.title}
                  </h3>
                  {step.description && (
                    <p className="text-xs text-gray-500 mt-1">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className={cn("flex items-center justify-between", className)}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1
        
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center text-center min-w-0 flex-1">
              {step.completed ? (
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mb-2">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              ) : step.current ? (
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mb-2">
                  <Circle className="w-5 h-5 text-white fill-current" />
                </div>
              ) : (
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mb-2">
                  <Circle className="w-5 h-5 text-gray-500" />
                </div>
              )}
              
              <h3 className={cn(
                "text-xs font-medium truncate max-w-full",
                step.completed ? "text-green-700" : step.current ? "text-blue-700" : "text-gray-500"
              )}>
                {step.title}
              </h3>
              
              {step.description && (
                <p className="text-xs text-gray-400 mt-1 truncate max-w-full">
                  {step.description}
                </p>
              )}
            </div>
            
            {!isLast && (
              <div className="flex items-center justify-center min-w-0 px-2">
                <ArrowRight className={cn(
                  "w-4 h-4",
                  step.completed ? "text-green-500" : "text-gray-300"
                )} />
              </div>
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

export type { ProgressStep } 