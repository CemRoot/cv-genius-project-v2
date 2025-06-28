'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check, Eye, Sparkles, TrendingUp } from 'lucide-react'
import { SimpleTemplatePreview } from '@/components/cv/simple-template-preview'
import { IrishCVTemplateManager } from '@/lib/irish-cv-template-manager'
import { useCVStore } from '@/store/cv-store'
import { TemplateErrorBoundary } from '@/components/cv/template-error-boundary'
import { TemplateDebugPanel } from '@/components/debug/template-debug-panel'
// import { ensureTemplateCacheHealth } from '@/lib/cache-utils'

interface Template {
  id: string
  name: string
  description: string
  image: string
  category: 'professional' | 'creative' | 'modern' | 'executive' | 'technical'
  features: string[]
  isPremium?: boolean
  popularity: number
}

const templates: Template[] = [
  // Classic ATS-Friendly Template
  {
    id: 'classic',
    name: 'Classic Professional',
    description: 'Traditional ATS-friendly format - widely accepted across all Irish industries',
    image: '/templates/classic.png',
    category: 'professional',
    features: ['ATS-Friendly', 'Traditional Format', 'Industry Standard'],
    popularity: 99
  },
  // Dublin/Ireland Specific Templates
  {
    id: 'dublin-tech',
    name: 'Dublin Tech Professional',
    description: 'Optimized for Dublin\'s thriving tech scene - perfect for Google, Meta, LinkedIn',
    image: '/templates/dublin-tech.png',
    category: 'modern',
    features: ['Dublin Tech Focus', 'ATS-Optimized', 'EU Format'],
    popularity: 98
  },
  {
    id: 'irish-finance',
    name: 'Irish Finance Expert',
    description: 'Tailored for IFSC roles - ideal for banking, fintech, and insurance',
    image: '/templates/irish-finance.png',
    category: 'professional',
    features: ['IFSC Standard', 'Finance Focus', 'Regulatory Ready'],
    popularity: 95
  },
  {
    id: 'dublin-pharma',
    name: 'Dublin Pharma Professional',
    description: 'Perfect for Ireland\'s pharmaceutical and medical device industry',
    image: '/templates/dublin-pharma.png',
    category: 'technical',
    features: ['Pharma Format', 'GMP Ready', 'Technical Skills'],
    popularity: 92
  },
  {
    id: 'irish-graduate',
    name: 'Irish Graduate CV',
    description: 'Ideal for graduates from Trinity, UCD, DCU - follows Irish academic standards',
    image: '/templates/irish-graduate.png',
    category: 'professional',
    features: ['Graduate Friendly', 'Academic Focus', 'Entry Level'],
    popularity: 94
  },
  {
    id: 'dublin-creative',
    name: 'Dublin Creative Industries',
    description: 'For creative professionals in Dublin\'s digital media and advertising sector',
    image: '/templates/dublin-creative.png',
    category: 'creative',
    features: ['Portfolio Ready', 'Creative Layout', 'Visual Impact'],
    popularity: 89
  },
  {
    id: 'irish-healthcare',
    name: 'HSE Healthcare Professional',
    description: 'Formatted for HSE and Irish healthcare sector applications',
    image: '/templates/irish-healthcare.png',
    category: 'professional',
    features: ['HSE Format', 'Medical Focus', 'NMBI Ready'],
    popularity: 91
  },
  {
    id: 'dublin-hospitality',
    name: 'Dublin Hospitality Pro',
    description: 'Perfect for Dublin\'s hospitality and tourism industry',
    image: '/templates/dublin-hospitality.png',
    category: 'modern',
    features: ['Service Focus', 'Multi-lingual', 'Tourism Ready'],
    popularity: 87
  },
  {
    id: 'irish-construction',
    name: 'Irish Construction & Engineering',
    description: 'Ideal for construction, engineering, and infrastructure roles in Ireland',
    image: '/templates/irish-construction.png',
    category: 'technical',
    features: ['Safe Pass Ready', 'Technical Skills', 'Project Focus'],
    popularity: 85
  },
  {
    id: 'dublin-startup',
    name: 'Dublin Startup Specialist',
    description: 'For the Dublin startup ecosystem - shows innovation and versatility',
    image: '/templates/dublin-startup.png',
    category: 'modern',
    features: ['Startup Ready', 'Multi-role', 'Innovation Focus'],
    isPremium: true,
    popularity: 93
  },
  {
    id: 'irish-executive',
    name: 'Irish Executive Leader',
    description: 'For C-suite and senior management positions in Irish companies',
    image: '/templates/irish-executive.png',
    category: 'executive',
    features: ['Executive Level', 'Board Ready', 'Leadership Focus'],
    isPremium: true,
    popularity: 90
  },
  {
    id: 'dublin-retail',
    name: 'Dublin Retail Professional',
    description: 'Optimized for retail management and customer service roles',
    image: '/templates/dublin-retail.png',
    category: 'professional',
    features: ['Retail Focus', 'Customer Service', 'Sales Metrics'],
    popularity: 86
  },
  {
    id: 'irish-education',
    name: 'Irish Education Professional',
    description: 'For teachers and education professionals - Teaching Council compliant',
    image: '/templates/irish-education.png',
    category: 'professional',
    features: ['Teaching Council', 'Education Focus', 'Garda Vetting'],
    popularity: 88
  }
]

interface TemplateGalleryProps {
  onSelectTemplate: (templateId: string) => void
}

export function TemplateGallery({ onSelectTemplate }: TemplateGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)
  const templateManager = useMemo(() => new IrishCVTemplateManager(), [])
  const { setTemplate } = useCVStore()

  const categories = [
    { id: 'all', label: 'All Templates', icon: '📋' },
    { id: 'professional', label: 'Professional', icon: '💼' },
    { id: 'creative', label: 'Creative', icon: '🎨' },
    { id: 'modern', label: 'Modern', icon: '✨' },
    { id: 'executive', label: 'Executive', icon: '👔' },
    { id: 'technical', label: 'Technical', icon: '💻' }
  ]

  const filteredTemplates = useMemo(() => 
    templates.filter(
      template => selectedCategory === 'all' || template.category === selectedCategory
    ), 
    [selectedCategory]
  )

  return (
    <TemplateErrorBoundary>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Your CV Template</h1>
          <p className="text-gray-600 text-lg">
            Select a professional template that best represents your career
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.id)}
                className="whitespace-nowrap"
              >
                <span className="mr-2">{category.icon}</span>
                {category.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Simple Template Grid - NO MOTION */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="opacity-100">
              <Card className="overflow-hidden cursor-pointer border-2 hover:border-blue-500">
                <div className="relative">
                  {/* Template Preview with Real Thumbnail */}
                  <div className="aspect-[210/297] bg-gray-100 relative overflow-hidden">
                    <SimpleTemplatePreview templateId={template.id} />
                    
                    {/* Always Visible Action Bar */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-2 flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="flex-1"
                        onClick={() => setPreviewTemplate(template)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          templateManager.selectTemplate(template.id)
                          sessionStorage.setItem('selectedTemplate', template.id)
                          setTemplate(template.id)
                          onSelectTemplate(template.id)
                        }}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Select
                      </Button>
                    </div>

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex gap-2">
                      {template.isPremium && (
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                    </div>

                    {/* Popularity */}
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="bg-white/90">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {template.popularity}%
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{template.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                    
                    {/* Features */}
                    <div className="flex flex-wrap gap-1">
                      {template.features.map((feature, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewTemplate(null)}
        >
          <div
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{previewTemplate.name}</h2>
                  <p className="text-gray-600">{previewTemplate.description}</p>
                </div>
                <Button onClick={() => {
                  templateManager.selectTemplate(previewTemplate.id)
                  sessionStorage.setItem('selectedTemplate', previewTemplate.id)
                  setTemplate(previewTemplate.id)
                  onSelectTemplate(previewTemplate.id)
                }}>
                  Use This Template
                </Button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="aspect-[210/297] bg-gray-100 mx-auto max-w-2xl overflow-hidden rounded-lg shadow-lg">
                {/* Full template preview */}
                <SimpleTemplatePreview templateId={previewTemplate.id} />
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
      
      {/* Debug panel for development */}
      <TemplateDebugPanel />
    </TemplateErrorBoundary>
  )
}