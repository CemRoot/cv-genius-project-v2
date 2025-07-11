'use client'

import React, { useState } from 'react'
import { cvTemplates, CvTemplate } from '@/lib/cv-templates/templates-data'
import { TemplatePreview } from './template-preview'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, FileText, Sparkles, CheckCircle } from 'lucide-react'

interface EnhancedTemplateGalleryProps {
  onSelectTemplate: (template: CvTemplate) => void
}

const categoryLabels = {
  irish: 'Irish Market',
  european: 'European',
  tech: 'Technology',
  creative: 'Creative',
  academic: 'Academic',
  executive: 'Executive',
  modern: 'Modern',
  simple: 'Simple & Classic',
  professional: 'Professional',
  ats: 'ATS Optimized'
}

export function EnhancedTemplateGallery({ onSelectTemplate }: EnhancedTemplateGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<CvTemplate | null>(null)

  const categories = ['all', ...Object.keys(categoryLabels)]
  
  const filteredTemplates = selectedCategory === 'all' 
    ? cvTemplates 
    : cvTemplates.filter(t => t.category === selectedCategory)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Choose Your Professional CV Template
            </h1>
            <p className="text-lg text-gray-600 mb-2">
              ATS-optimized templates designed for Irish and European job markets
            </p>
            <div className="flex items-center justify-center gap-4 mt-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-700">ATS Compatible</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-700">Professional Designs</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-gray-700">Easy to Customize</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="capitalize"
            >
              {category === 'all' ? 'All Templates' : categoryLabels[category as keyof typeof categoryLabels]}
              {category !== 'all' && (
                <Badge variant="secondary" className="ml-2">
                  {cvTemplates.filter(t => t.category === category).length}
                </Badge>
              )}
            </Button>
          ))}
        </div>

        {/* Template Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {filteredTemplates.map((template) => (
            <Card 
              key={template.id}
              className={`overflow-hidden transition-all duration-300 hover:shadow-xl ${
                hoveredTemplate === template.id ? 'scale-[1.02]' : ''
              }`}
              onMouseEnter={() => setHoveredTemplate(template.id)}
              onMouseLeave={() => setHoveredTemplate(null)}
            >
              <CardHeader className="p-0">
                <div className="relative h-64 bg-gray-100 overflow-hidden">
                  <div className="absolute inset-0 scale-[0.35] origin-top-left">
                    <TemplatePreview template={template} />
                  </div>
                  {/* Category Badge */}
                  <Badge 
                    className="absolute top-2 right-2 capitalize"
                    variant={template.category === 'irish' ? 'default' : 'secondary'}
                  >
                    {categoryLabels[template.category]}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="p-4">
                <CardTitle className="text-lg mb-2">{template.name}</CardTitle>
                <CardDescription className="text-sm mb-3">
                  {template.description}
                </CardDescription>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {template.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {template.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{template.tags.length - 3}
                    </Badge>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="p-4 pt-0 gap-2">
                <Button 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white border-0"
                  onClick={() => onSelectTemplate(template)}
                >
                  Use Template
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPreviewTemplate(template)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Irish Market Optimized</h3>
            <p className="text-gray-600 text-sm">
              Templates specifically designed for Dublin and Irish employers, following local CV conventions and formats.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">European Standards</h3>
            <p className="text-gray-600 text-sm">
              Compliant with Europass and European CV standards, perfect for applications across EU member states.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">ATS Guaranteed</h3>
            <p className="text-gray-600 text-sm">
              All templates are tested with major ATS systems to ensure your CV passes automated screening.
            </p>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setPreviewTemplate(null)}
        >
          <div 
            className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">{previewTemplate.name} Preview</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setPreviewTemplate(null)}
              >
                Close
              </Button>
            </div>
            <div className="p-8">
              <div className="bg-gray-50 p-8 rounded-lg">
                <TemplatePreview template={previewTemplate} className="shadow-lg" />
              </div>
              <div className="mt-6 flex gap-4 justify-center">
                <Button 
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white border-0"
                  onClick={() => {
                    onSelectTemplate(previewTemplate)
                    setPreviewTemplate(null)
                  }}
                >
                  Use This Template
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  onClick={() => setPreviewTemplate(null)}
                >
                  Back to Gallery
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}