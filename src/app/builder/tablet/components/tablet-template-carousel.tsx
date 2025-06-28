'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { templates } from '@/lib/templates'
import { useGestureNavigation } from '@/hooks/use-gesture-navigation'

interface TabletTemplateCarouselProps {
  selectedTemplateId: string | null
  onTemplateSelect: (templateId: string) => void
}

export function TabletTemplateCarousel({ 
  selectedTemplateId, 
  onTemplateSelect 
}: TabletTemplateCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)
  const templateArray = Object.entries(templates)

  // Gesture navigation for swiping through templates
  const { setElement } = useGestureNavigation({
    onSwipeLeft: () => navigateNext(),
    onSwipeRight: () => navigatePrevious(),
    threshold: 30
  })

  useState(() => {
    if (carouselRef.current) {
      setElement(carouselRef.current)
    }
  })

  const navigatePrevious = () => {
    setCurrentIndex(prev => 
      prev === 0 ? templateArray.length - 1 : prev - 1
    )
  }

  const navigateNext = () => {
    setCurrentIndex(prev => 
      prev === templateArray.length - 1 ? 0 : prev + 1
    )
  }

  const goToIndex = (index: number) => {
    setCurrentIndex(index)
  }

  return (
    <div className="relative">
      <h3 className="text-lg font-semibold mb-4">Choose a Template</h3>
      
      {/* Carousel container */}
      <div 
        ref={carouselRef}
        className="relative overflow-hidden rounded-lg"
      >
        <div className="flex transition-transform duration-300 ease-in-out"
             style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
          {templateArray.map(([id, template], index) => (
            <div
              key={id}
              className="min-w-full px-2"
            >
              <div
                onClick={() => onTemplateSelect(id)}
                className={cn(
                  'relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all',
                  selectedTemplateId === id 
                    ? 'border-blue-500 shadow-lg' 
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                {/* Template preview */}
                <div className="aspect-[3/4] bg-white p-4">
                  <div className="h-full border rounded-lg p-4 space-y-2">
                    {/* Simplified template preview */}
                    <div className="h-8 bg-gray-200 rounded" />
                    <div className="space-y-1">
                      <div className="h-3 bg-gray-100 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                    <div className="pt-4 space-y-2">
                      <div className="h-2 bg-gray-100 rounded" />
                      <div className="h-2 bg-gray-100 rounded" />
                      <div className="h-2 bg-gray-100 rounded w-5/6" />
                    </div>
                  </div>
                </div>

                {/* Template info */}
                <div className="p-3 bg-gray-50">
                  <h4 className="font-medium text-sm">{template.name}</h4>
                  <p className="text-xs text-gray-600 mt-1">{template.description}</p>
                </div>

                {/* Selected indicator */}
                {selectedTemplateId === id && (
                  <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      <Button
        variant="outline"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white shadow-lg"
        onClick={navigatePrevious}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-white shadow-lg"
        onClick={navigateNext}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>

      {/* Dots indicator */}
      <div className="flex justify-center gap-1.5 mt-4">
        {templateArray.map((_, index) => (
          <button
            key={index}
            onClick={() => goToIndex(index)}
            className={cn(
              'w-2 h-2 rounded-full transition-all',
              currentIndex === index 
                ? 'bg-blue-500 w-6' 
                : 'bg-gray-300 hover:bg-gray-400'
            )}
          />
        ))}
      </div>
    </div>
  )
}