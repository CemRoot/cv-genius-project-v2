'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TemplateSelector } from '@/components/cover-letter/template-selector'

interface NameForm {
  firstName: string
  lastName: string
}

type ColorOption = 'color1' | 'color2' | 'color3' | 'color4' | 'color5' | 'color6' | 'color7' | 'color8'

const colors = {
  color1: '#1a365d',
  color2: '#2d3748',
  color3: '#744210',
  color4: '#553c9a',
  color5: '#0f766e',
  color6: '#b91c1c',
  color7: '#be185d',
  color8: '#047857'
}

export default function ChooseTemplatePage() {
  const router = useRouter()
  const [nameForm, setNameForm] = useState<NameForm>({ firstName: '', lastName: '' })
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<ColorOption>('color1')

  const handleNameChange = useCallback((field: keyof NameForm, value: string) => {
    setNameForm(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleTemplateSelect = useCallback((templateId: string) => {
    setSelectedTemplate(templateId)
  }, [])

  const handleColorSelect = useCallback((color: string) => {
    setSelectedColor(color as ColorOption)
  }, [])

  const handleContinue = useCallback(() => {
    if (nameForm.firstName && nameForm.lastName && selectedTemplate) {
      // Save template and user data to localStorage for the AI generator
      const coverLetterData = {
        selectedTemplate,
        selectedColor,
        personalInfo: nameForm,
        fromNewFlow: true
      }
      
      localStorage.setItem('cover-letter-template-data', JSON.stringify(coverLetterData))
      
      // Navigate to creation mode selection
      router.push('/cover-letter/creation-mode')
    }
  }, [nameForm, selectedTemplate, selectedColor, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Template
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Select a professional template and customize it with your information. Our new template system offers 15 unique designs to match your style.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Side - Form */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-8">
              <div className="space-y-6">
                {/* Name Form */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Information</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={nameForm.firstName}
                        onChange={(e) => handleNameChange('firstName', e.target.value)}
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={nameForm.lastName}
                        onChange={(e) => handleNameChange('lastName', e.target.value)}
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>
                </div>

                {/* Color Selection */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Color</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {Object.entries(colors).map(([colorKey, colorValue]) => (
                      <button
                        key={colorKey}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${
                          selectedColor === colorKey 
                            ? 'border-gray-800 scale-110' 
                            : 'border-gray-300 hover:border-gray-500'
                        }`}
                        style={{ backgroundColor: colorValue }}
                        onClick={() => handleColorSelect(colorKey)}
                      />
                    ))}
                  </div>
                </div>

                {/* Selected Template Info */}
                {selectedTemplate && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Selected Template</h4>
                    <p className="text-sm text-blue-700">
                      Template ID: {selectedTemplate}
                    </p>
                    <p className="text-sm text-blue-700">
                      Color: {selectedColor}
                    </p>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </Button>
                  <Button
                    onClick={handleContinue}
                    disabled={!nameForm.firstName || !nameForm.lastName || !selectedTemplate}
                    className="w-full"
                    size="lg"
                  >
                    Continue with Selected Template
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Side - Template Selector */}
          <div className="lg:col-span-2">
            <TemplateSelector
              selectedTemplate={selectedTemplate}
              selectedColor={selectedColor}
              onTemplateSelect={handleTemplateSelect}
              onColorSelect={handleColorSelect}
              personalInfo={nameForm}
              showColors={false}
              showSearch={true}
              showCategories={true}
            />
          </div>
        </div>
      </div>
    </div>
  )
}