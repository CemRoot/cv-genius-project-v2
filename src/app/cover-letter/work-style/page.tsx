'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const workStyles = [
  {
    name: 'Artistic',
    description: 'You thrive in dynamic environments driven by innovation and creativity.'
  },
  {
    name: 'Enterprising',
    description: "You're accustomed to leading teams with empowering and decisive task delegation."
  },
  {
    name: 'Investigative',
    description: 'You bring a resourceful approach with a knack for problem-solving.'
  },
  {
    name: 'Organized',
    description: 'You bring structure and focus to streamline tasks.'
  },
  {
    name: 'Practical',
    description: 'You go above and beyond to meet goals and ensure timely task completion.'
  },
  {
    name: 'Service-Oriented',
    description: 'You excel in collaborative situations and enjoy helping others.'
  }
]

export default function WorkStylePage() {
  const router = useRouter()
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null)

  const handleStyleSelect = (styleName: string) => {
    setSelectedStyle(styleName)
  }

  const handleContinue = () => {
    if (selectedStyle) {
      // Save work style to localStorage
      localStorage.setItem('cover-letter-work-style', selectedStyle)
      
      // Continue to signature
      router.push('/cover-letter/signature')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              What's your working style?
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              This helps us personalize the tone of your letter.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workStyles.map((style) => (
            <Card
              key={style.name}
              className={`p-6 cursor-pointer transition-all ${
                selectedStyle === style.name
                  ? 'border-2 border-blue-500 bg-blue-50'
                  : 'hover:shadow-lg hover:border-blue-400'
              }`}
              onClick={() => handleStyleSelect(style.name)}
            >
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {style.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {style.description}
                </p>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex gap-4 max-w-md mx-auto">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex-1"
          >
            Back
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!selectedStyle}
            className="flex-1"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}