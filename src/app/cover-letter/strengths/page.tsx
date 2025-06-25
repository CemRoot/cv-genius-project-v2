'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Check } from 'lucide-react'
import { MainLayout } from '@/components/layout/main-layout'
import { useCoverLetter } from '@/contexts/cover-letter-context'

const strengthOptions = [
  'Collaboration',
  'Communication',
  'Critical thinking',
  'Customer service',
  'Decision-making',
  'Delegation',
  'Innovation',
  'Interpersonal',
  'Leadership',
  'Management',
  'Motivation',
  'Observation',
  'Organization',
  'Planning',
  'Problem-solving',
  'Team-building',
  'Teamwork',
  'Time-management'
]

export default function StrengthsPage() {
  const router = useRouter()
  const { setStrengths: setContextStrengths } = useCoverLetter()
  const [selectedStrengths, setSelectedStrengths] = useState<string[]>([])

  const handleStrengthToggle = (strength: string) => {
    if (selectedStrengths.includes(strength)) {
      setSelectedStrengths(selectedStrengths.filter(s => s !== strength))
    } else if (selectedStrengths.length < 3) {
      setSelectedStrengths([...selectedStrengths, strength])
    }
  }

  const handleContinue = () => {
    if (selectedStrengths.length === 3) {
      // Save strengths to context
      setContextStrengths(selectedStrengths)
      
      // Save strengths to localStorage
      localStorage.setItem('cover-letter-strengths', JSON.stringify(selectedStrengths))
      
      // Continue to work style
      router.push('/cover-letter/work-style')
    }
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Choose your top 3 strengths.
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We'll highlight these in your cover letter to help match your strengths to the desired position.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="p-8">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Select exactly 3 strengths
              </p>
              <p className="text-sm font-medium text-blue-600">
                {selectedStrengths.length}/3 selected
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {strengthOptions.map((strength) => {
              const isSelected = selectedStrengths.includes(strength)
              const isDisabled = !isSelected && selectedStrengths.length >= 3
              
              return (
                <button
                  key={strength}
                  onClick={() => handleStrengthToggle(strength)}
                  disabled={isDisabled}
                  className={`
                    relative py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all
                    ${isSelected 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : isDisabled
                        ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50'
                    }
                  `}
                >
                  <span className="flex items-center justify-center gap-2">
                    {isSelected && <Check className="w-4 h-4" />}
                    {strength}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="mt-8 flex gap-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={handleContinue}
              disabled={selectedStrengths.length !== 3}
              className="flex-1"
            >
              Continue
            </Button>
          </div>
        </Card>
      </div>
      </div>
    </MainLayout>
  )
}