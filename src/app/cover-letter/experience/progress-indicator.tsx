import React from 'react'

interface Step {
  id: string
  label: string
  completed: boolean
  current: boolean
}

interface ProgressIndicatorProps {
  currentStep: 'experience' | 'student' | 'school' | 'education' | 'college-grad'
  experienceLevel?: string | null
  studentStatus?: string | null
  schoolType?: string | null
}

export function ProgressIndicator({ currentStep, experienceLevel, studentStatus, schoolType }: ProgressIndicatorProps) {
  const getSteps = (): Step[] => {
    const steps: Step[] = [
      {
        id: 'experience',
        label: 'Experience',
        completed: !!experienceLevel,
        current: currentStep === 'experience'
      }
    ]

    // Only show subsequent steps if they're relevant based on user choices
    if (experienceLevel === 'no-experience' || experienceLevel === 'less-than-3') {
      steps.push({
        id: 'student',
        label: 'Student Status',
        completed: !!studentStatus,
        current: currentStep === 'student'
      })

      if (studentStatus === 'yes' || studentStatus === 'recent-graduate') {
        steps.push({
          id: 'school',
          label: 'School Type',
          completed: !!schoolType,
          current: currentStep === 'school'
        })

        if (schoolType === 'college' || schoolType === 'graduate-school') {
          steps.push({
            id: 'education',
            label: 'Education Details',
            completed: false,
            current: currentStep === 'education'
          })
        }
      } else if (studentStatus === 'no') {
        steps.push({
          id: 'college-grad',
          label: 'College Graduate',
          completed: false,
          current: currentStep === 'college-grad'
        })
      }
    }

    return steps
  }

  const steps = getSteps()

  return (
    <div className="w-full py-3 md:py-4 px-4 sm:px-6 lg:px-8 bg-white border-b overflow-x-auto">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between min-w-max md:min-w-0">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex items-center">
                <div
                  className={`
                    flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full border-2
                    ${step.completed ? 'bg-blue-600 border-blue-600' : 
                      step.current ? 'bg-white border-blue-600' : 
                      'bg-white border-gray-300'}
                  `}
                >
                  {step.completed ? (
                    <svg className="w-4 h-4 md:w-6 md:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className={`text-sm font-medium ${step.current ? 'text-blue-600' : 'text-gray-500'}`}>
                      {index + 1}
                    </span>
                  )}
                </div>
                <span className={`ml-2 md:ml-3 text-xs md:text-sm font-medium whitespace-nowrap ${step.current ? 'text-blue-600' : step.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${step.completed ? 'bg-blue-600' : 'bg-gray-300'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}