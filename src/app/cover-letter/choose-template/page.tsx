'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TemplateSelector } from '@/components/cover-letter/template-selector'
import { MainLayout } from '@/components/layout/main-layout'
import { MobileBottomSheet } from '@/components/mobile/mobile-bottom-sheet'
import { ChevronRight, ChevronLeft, Palette, User, FileText, Check } from 'lucide-react'
import { useCoverLetter } from '@/contexts/cover-letter-context'

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
  const { setPersonalInfo, setSelectedTemplate: setSelectedTemplateContext, setSelectedColor: setSelectedColorContext, setCurrentStep: setContextStep } = useCoverLetter()
  const [nameForm, setNameForm] = useState<NameForm>({ firstName: '', lastName: '' })
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<ColorOption>('color1')
  const [showTemplateSheet, setShowTemplateSheet] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const handleNameChange = useCallback((field: keyof NameForm, value: string) => {
    setNameForm(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleTemplateSelect = useCallback((templateId: string) => {
    setSelectedTemplate(templateId)
    setShowTemplateSheet(false)
    setCurrentStep(2) // Move to color selection on mobile
  }, [])

  const handleColorSelect = useCallback((color: string) => {
    console.log('🎨 Color selected:', color)
    setSelectedColor(color as ColorOption)
    setSelectedColorContext(color as ColorOption)
    
    // Update localStorage immediately with more robust data handling
    const existingData = JSON.parse(localStorage.getItem('cover-letter-template-data') || '{}')
    const updatedData = {
      ...existingData,
      selectedColor: color,
      fromNewFlow: true,
      timestamp: new Date().toISOString() // Add timestamp for debugging
    }
    localStorage.setItem('cover-letter-template-data', JSON.stringify(updatedData))
    console.log('💾 Color saved to localStorage:', updatedData)
  }, [setSelectedColorContext])

  const handleContinue = useCallback(() => {
    if (nameForm.firstName && nameForm.lastName && selectedTemplate) {
      console.log('🎯 Template selection continuing with:', {
        nameForm,
        selectedTemplate,
        selectedColor
      })
      
      // Save to context
      setPersonalInfo(nameForm)
      setSelectedTemplateContext(selectedTemplate)
      setSelectedColorContext(selectedColor)
      
      // Also save to localStorage for backward compatibility
      const coverLetterData = {
        selectedTemplate,
        selectedColor,
        personalInfo: nameForm,
        fromNewFlow: true
      }
      
      console.log('💾 Saving template data to localStorage:', coverLetterData)
      localStorage.setItem('cover-letter-template-data', JSON.stringify(coverLetterData))
      
      // Force context sync by setting current step
      setContextStep('creation-mode')
      
      console.log('🔄 Navigating to creation-mode')
      router.push('/cover-letter/creation-mode')
    } else {
      console.warn('⚠️ Cannot continue - missing required data:', {
        firstName: nameForm.firstName,
        lastName: nameForm.lastName, 
        selectedTemplate
      })
    }
  }, [nameForm, selectedTemplate, selectedColor, router, setPersonalInfo, setSelectedTemplateContext, setSelectedColorContext, setContextStep])

  const steps = [
    { id: 'info', title: 'Your Info', icon: User, completed: nameForm.firstName && nameForm.lastName },
    { id: 'template', title: 'Template', icon: FileText, completed: selectedTemplate },
    { id: 'color', title: 'Color', icon: Palette, completed: true }
  ]

  const canContinue = nameForm.firstName && nameForm.lastName && selectedTemplate

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Mobile Header - Hidden on Desktop */}
        <div className="md:hidden bg-white shadow-sm border-b sticky top-0 z-30">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-semibold">Choose Template</h1>
              <div className="w-9" />
            </div>

            {/* Progress Steps - Mobile Only */}
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                    step.completed 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : index === currentStep
                      ? 'border-blue-600 text-blue-600 bg-blue-50'
                      : 'border-gray-300 text-gray-400'
                  }`}>
                    {step.completed ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <step.icon className="w-4 h-4" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${
                      step.completed ? 'bg-blue-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Header - Hidden on Mobile */}
        <div className="hidden md:block bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
                Choose Your Template
              </h1>
              <p className="text-sm sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
                Select a professional template and customize it with your information. Our new template system offers 15 unique designs to match your style.
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Content */}
        <div className="md:hidden">
          <div className="p-4 space-y-6">
            {/* Step 0: Personal Info */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Tell us about yourself</h2>
                  <p className="text-gray-600">We'll use this information in your cover letter</p>
                </div>

                <Card className="p-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="firstName-mobile" className="text-base font-medium">First Name</Label>
                      <Input
                        id="firstName-mobile"
                        value={nameForm.firstName}
                        onChange={(e) => handleNameChange('firstName', e.target.value)}
                        placeholder="Enter your first name"
                        className="mt-2 h-12 text-base"
                        autoFocus
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName-mobile" className="text-base font-medium">Last Name</Label>
                      <Input
                        id="lastName-mobile"
                        value={nameForm.lastName}
                        onChange={(e) => handleNameChange('lastName', e.target.value)}
                        placeholder="Enter your last name"
                        className="mt-2 h-12 text-base"
                      />
                    </div>
                  </div>
                </Card>

                <Button
                  onClick={() => setCurrentStep(1)}
                  disabled={!nameForm.firstName || !nameForm.lastName}
                  className="w-full h-12 text-base font-medium"
                  size="lg"
                >
                  Continue to Templates
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            )}

            {/* Step 1: Template Selection */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Choose your template</h2>
                  <p className="text-gray-600">Pick a design that represents your style</p>
                </div>

                {selectedTemplate ? (
                  <Card className="p-4 border-green-200 bg-green-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                        <div className="ml-3">
                          <p className="font-medium">Template Selected</p>
                          <p className="text-sm text-gray-600">ID: {selectedTemplate}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowTemplateSheet(true)}
                      >
                        Change
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full h-16 border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                    onClick={() => setShowTemplateSheet(true)}
                  >
                    <div className="text-center">
                      <FileText className="w-6 h-6 mx-auto mb-1 text-gray-400" />
                      <span className="text-gray-600">Tap to choose template</span>
                    </div>
                  </Button>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(0)}
                    className="flex-1 h-12"
                  >
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(2)}
                    disabled={!selectedTemplate}
                    className="flex-1 h-12"
                  >
                    Continue
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Color Selection */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Palette className="w-8 h-8 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Choose your color</h2>
                  <p className="text-gray-600">Select a color that matches your style</p>
                </div>

                <Card className="p-6">
                  <Label className="text-base font-medium mb-4 block">Color Theme</Label>
                  <div className="grid grid-cols-4 gap-4">
                    {Object.entries(colors).map(([colorKey, colorValue]) => (
                      <button
                        key={colorKey}
                        className={`w-12 h-12 rounded-full border-4 transition-all ${
                          selectedColor === colorKey 
                            ? 'border-gray-800 scale-110 shadow-lg' 
                            : 'border-gray-200 hover:border-gray-400 hover:scale-105'
                        }`}
                        style={{ backgroundColor: colorValue }}
                        onClick={() => handleColorSelect(colorKey)}
                      />
                    ))}
                  </div>
                </Card>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 h-12"
                  >
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handleContinue}
                    disabled={!canContinue}
                    className="flex-1 h-12 bg-green-600 hover:bg-green-700"
                  >
                    Create Cover Letter
                    <Check className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Template Selection Bottom Sheet */}
          <MobileBottomSheet
            isOpen={showTemplateSheet}
            onClose={() => setShowTemplateSheet(false)}
            title="Choose Template"
            snapPoints={[0.8, 0.95]}
            initialSnap={0}
          >
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
          </MobileBottomSheet>
        </div>

        {/* Desktop Content */}
        <div className="hidden md:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-12">
            <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {/* Left Side - Form */}
              <div className="lg:col-span-1">
                <Card className="p-4 sm:p-6 lg:sticky lg:top-8">
                  <div className="space-y-6">
                    {/* Name Form */}
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Your Information</h3>
                      <div className="space-y-3 sm:space-y-4">
                        <div>
                          <Label htmlFor="firstName-desktop" className="text-sm">First Name</Label>
                          <Input
                            id="firstName-desktop"
                            value={nameForm.firstName}
                            onChange={(e) => handleNameChange('firstName', e.target.value)}
                            placeholder="Enter your first name"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName-desktop" className="text-sm">Last Name</Label>
                          <Input
                            id="lastName-desktop"
                            value={nameForm.lastName}
                            onChange={(e) => handleNameChange('lastName', e.target.value)}
                            placeholder="Enter your last name"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Color Selection */}
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Choose Color</h3>
                      <div className="grid grid-cols-4 gap-2 sm:gap-3">
                        {Object.entries(colors).map(([colorKey, colorValue]) => (
                          <button
                            key={colorKey}
                            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-all ${
                              selectedColor === colorKey 
                                ? 'border-gray-800 scale-110' 
                                : 'border-gray-300 hover:border-gray-500'
                            }`}
                            style={{ backgroundColor: colorValue }}
                            onClick={() => handleColorSelect(colorKey)}
                            aria-label={`Select color ${colorKey}`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Selected Template Info */}
                    {selectedTemplate && (
                      <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-1 sm:mb-2 text-sm sm:text-base">Selected Template</h4>
                        <p className="text-xs sm:text-sm text-blue-700">
                          Template ID: {selectedTemplate}
                        </p>
                        <p className="text-xs sm:text-sm text-blue-700">
                          Color: {selectedColor}
                        </p>
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="space-y-2 sm:space-y-3">
                      <Button
                        variant="outline"
                        onClick={() => router.back()}
                        className="w-full flex items-center justify-center gap-2"
                        size="default"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Back
                      </Button>
                      <Button
                        onClick={handleContinue}
                        disabled={!nameForm.firstName || !nameForm.lastName || !selectedTemplate}
                        className="w-full"
                        size="default"
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
      </div>
    </MainLayout>
  )
}