'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Sparkles, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSwipeNavigation } from '@/hooks/use-swipe-navigation'

interface Template {
  id: string
  name: string
  description: string
  image: string
  category: string
  features: string[]
  isPremium?: boolean
}

const templates: Template[] = [
  {
    id: 'modern-1',
    name: 'Modern Professional',
    description: 'Clean design for tech professionals',
    image: '/templates/modern-1.png',
    category: 'modern',
    features: ['ATS-Friendly', 'Clean Layout']
  },
  {
    id: 'executive-1',
    name: 'Executive Elite',
    description: 'For senior management positions',
    image: '/templates/executive-1.png',
    category: 'executive',
    features: ['Premium Design', 'Leadership Focus'],
    isPremium: true
  },
  {
    id: 'creative-1',
    name: 'Creative Portfolio',
    description: 'Stand out with visual impact',
    image: '/templates/creative-1.png',
    category: 'creative',
    features: ['Visual Design', 'Portfolio Ready']
  }
]

interface TemplateCarouselProps {
  onSelectTemplate: (templateId: string) => void
}

export function TemplateCarousel({ onSelectTemplate }: TemplateCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const currentTemplate = templates[currentIndex]

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % templates.length)
  }

  const goPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + templates.length) % templates.length)
  }

  // Swipe navigation
  const swipeNavigation = useSwipeNavigation({
    enabledDirections: { left: true, right: true, up: false, down: false },
    onSwipeComplete: (direction) => {
      if (direction === 'left') goToNext()
      else if (direction === 'right') goPrevious()
    },
    threshold: 50,
    velocity: 0.3
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Choose Your Template</h1>
          <p className="text-sm text-gray-600 mt-1">Swipe to browse templates</p>
        </div>
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center gap-2 py-4">
        {templates.map((_, index) => (
          <div
            key={index}
            className={`h-2 transition-all duration-300 rounded-full ${
              index === currentIndex 
                ? 'w-8 bg-cvgenius-purple' 
                : 'w-2 bg-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Template Display */}
      <div 
        ref={swipeNavigation.setSwipeElement}
        className="px-4 pb-24"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTemplate.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="overflow-hidden shadow-xl">
              {/* Template Preview */}
              <div className="relative aspect-[210/297] bg-gray-200">
                {/* Placeholder for template image */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center">
                  <span className="text-gray-500 text-lg">Template Preview</span>
                </div>

                {/* Premium Badge */}
                {currentTemplate.isPremium && (
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  </div>
                )}
              </div>

              {/* Template Info */}
              <div className="p-6 bg-white">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {currentTemplate.name}
                </h2>
                <p className="text-gray-600 mb-4">
                  {currentTemplate.description}
                </p>

                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {currentTemplate.features.map((feature, idx) => (
                    <Badge key={idx} variant="outline" className="text-sm">
                      {feature}
                    </Badge>
                  ))}
                </div>

                {/* Action Button */}
                <Button 
                  onClick={() => onSelectTemplate(currentTemplate.id)}
                  className="w-full h-12 text-base"
                  size="lg"
                >
                  <Check className="w-5 h-5 mr-2" />
                  Use This Template
                </Button>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-6">
          <Button
            variant="outline"
            size="lg"
            onClick={goPrevious}
            className="w-14 h-14 rounded-full p-0"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          <div className="text-center">
            <span className="text-sm text-gray-500">
              {currentIndex + 1} of {templates.length}
            </span>
          </div>

          <Button
            variant="outline"
            size="lg"
            onClick={goToNext}
            className="w-14 h-14 rounded-full p-0"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" size="lg" className="h-12">
            Skip Templates
          </Button>
          <Button 
            size="lg" 
            className="h-12"
            onClick={() => onSelectTemplate(currentTemplate.id)}
          >
            Select Template
          </Button>
        </div>
      </div>
    </div>
  )
}