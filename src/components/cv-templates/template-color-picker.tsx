'use client'

import React from 'react'
import { CvTemplate } from '@/lib/cv-templates/templates-data'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

interface TemplateColorPickerProps {
  template: CvTemplate
  selectedColor?: string
  onColorSelect: (primary: string, secondary: string) => void
}

export function TemplateColorPicker({ 
  template, 
  selectedColor, 
  onColorSelect 
}: TemplateColorPickerProps) {
  if (!template.styling.colorVariants || template.styling.colorVariants.length === 0) {
    return null
  }

  const defaultSelected = selectedColor || template.styling.primaryColor

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-700">Choose Color</h4>
      <div className="flex flex-wrap gap-2">
        {template.styling.colorVariants.map((variant, index) => (
          <button
            key={index}
            onClick={() => onColorSelect(variant.primary, variant.secondary)}
            className={`relative w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
              defaultSelected === variant.primary 
                ? 'border-gray-400 shadow-lg' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            style={{ backgroundColor: variant.primary }}
            title={`Color option ${index + 1}`}
          >
            {defaultSelected === variant.primary && (
              <Check 
                className="w-4 h-4 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" 
                style={{ 
                  color: variant.primary === '#FFFFFF' || variant.primary === '#E4E4E4' ? '#000' : '#FFF'
                }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

// Enhanced color picker with preview
interface EnhancedTemplateColorPickerProps extends TemplateColorPickerProps {
  showPreview?: boolean
}

export function EnhancedTemplateColorPicker({ 
  template, 
  selectedColor, 
  onColorSelect,
  showPreview = false
}: EnhancedTemplateColorPickerProps) {
  if (!template.styling.colorVariants || template.styling.colorVariants.length === 0) {
    return null
  }

  const defaultSelected = selectedColor || template.styling.primaryColor

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">Color Variants</h4>
        <span className="text-xs text-gray-500">
          {template.styling.colorVariants.length} options
        </span>
      </div>
      
      <div className="grid grid-cols-5 gap-3">
        {template.styling.colorVariants.map((variant, index) => (
          <div key={index} className="space-y-2">
            <button
              onClick={() => onColorSelect(variant.primary, variant.secondary)}
              className={`relative w-full aspect-square rounded-lg border-2 transition-all duration-200 hover:scale-105 group ${
                defaultSelected === variant.primary 
                  ? 'border-gray-400 shadow-md ring-2 ring-blue-200' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              style={{
                background: `linear-gradient(135deg, ${variant.primary} 0%, ${variant.secondary} 100%)`
              }}
              title={`Color variant ${index + 1}`}
            >
              {defaultSelected === variant.primary && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <Check className="w-4 h-4 text-gray-700" />
                  </div>
                </div>
              )}
              
              {/* Hover preview */}
              {showPreview && (
                <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                       style={{ backgroundColor: variant.secondary }}>
                  </div>
                </div>
              )}
            </button>
            
            {/* Color codes */}
            <div className="text-xs text-gray-500 text-center space-y-1">
              <div className="truncate">{variant.primary}</div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Reset button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onColorSelect(template.styling.primaryColor, template.styling.secondaryColor)}
        className="w-full text-xs"
      >
        Reset to Default
      </Button>
    </div>
  )
} 