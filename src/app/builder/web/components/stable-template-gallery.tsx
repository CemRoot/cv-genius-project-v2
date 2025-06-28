'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check, Eye, Sparkles, TrendingUp } from 'lucide-react'

interface Template {
  id: string
  name: string
  description: string
  category: 'professional' | 'creative' | 'modern' | 'executive' | 'technical'
  features: string[]
  isPremium?: boolean
  popularity: number
  isRecommended?: boolean
}

const templates: Template[] = [
  {
    id: 'classic',
    name: 'Classic Professional',
    description: 'The gold standard for Irish job applications. ATS-optimized and recruiter-approved.',
    category: 'professional',
    features: ['✓ ATS-Friendly', '✓ Universal Format', '✓ Professional'],
    popularity: 99,
    isRecommended: true
  },
  {
    id: 'dublin-tech',
    name: 'Dublin Tech Professional',
    description: 'Optimized for Dublin\'s thriving tech scene - perfect for Google, Meta, LinkedIn',
    category: 'modern',
    features: ['Dublin Tech Focus', 'ATS-Optimized', 'EU Format'],
    popularity: 98
  },
  {
    id: 'irish-finance',
    name: 'Irish Finance Expert',
    description: 'Tailored for IFSC roles - ideal for banking, fintech, and insurance',
    category: 'professional',
    features: ['IFSC Standard', 'Finance Focus', 'Regulatory Ready'],
    popularity: 95
  },
  {
    id: 'dublin-pharma',
    name: 'Dublin Pharma Professional',
    description: 'Perfect for Ireland\'s pharmaceutical and medical device industry',
    category: 'technical',
    features: ['Pharma Format', 'GMP Ready', 'Technical Skills'],
    popularity: 92
  }
]

const templateColors: Record<string, { bg: string; accent: string; text: string }> = {
  'classic': { bg: 'bg-white', accent: 'bg-black', text: 'text-white' },
  'dublin-tech': { bg: 'bg-white', accent: 'bg-blue-600', text: 'text-white' },
  'irish-finance': { bg: 'bg-white', accent: 'bg-green-800', text: 'text-white' },
  'dublin-pharma': { bg: 'bg-white', accent: 'bg-teal-600', text: 'text-white' }
}

function TemplatePreview({ templateId }: { templateId: string }) {
  const colors = templateColors[templateId] || { bg: 'bg-white', accent: 'bg-gray-600', text: 'text-white' }
  
  return (
    <div className={`absolute inset-0 ${colors.bg} p-3 flex flex-col`}>
      <div className={`${colors.accent} ${colors.text} p-3 rounded-t-md mb-2`}>
        <div className="h-3 bg-white/30 rounded w-3/4 mb-1"></div>
        <div className="h-2 bg-white/20 rounded w-1/2"></div>
      </div>
      <div className="flex-1 space-y-2">
        <div className="border-l-4 border-gray-300 pl-2">
          <div className={`h-2 ${colors.accent} rounded w-1/3 mb-1 opacity-80`}></div>
          <div className="space-y-1">
            <div className="h-1 bg-gray-200 rounded w-full"></div>
            <div className="h-1 bg-gray-200 rounded w-4/5"></div>
          </div>
        </div>
        <div className="border-l-4 border-gray-300 pl-2">
          <div className={`h-2 ${colors.accent} rounded w-1/4 mb-1 opacity-80`}></div>
          <div className="space-y-1">
            <div className="h-1 bg-gray-200 rounded w-full"></div>
            <div className="h-1 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface TemplateGalleryProps {
  onSelectTemplate: (templateId: string) => void
}

export function StableTemplateGallery({ onSelectTemplate }: TemplateGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  const categories = [
    { id: 'all', label: 'All Templates' },
    { id: 'professional', label: 'Professional' },
    { id: 'modern', label: 'Modern' },
    { id: 'technical', label: 'Technical' }
  ]

  const filteredTemplates = templates.filter(
    template => selectedCategory === 'all' || template.category === selectedCategory
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Your CV Template</h1>
          <p className="text-gray-600 text-lg">
            Select a professional template that best represents your career
          </p>
        </div>
      </div>

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
                {category.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTemplates.map((template) => (
            <Card 
              key={template.id} 
              className={`overflow-hidden cursor-pointer border-2 transition-all ${
                template.isRecommended 
                  ? 'border-green-500 shadow-lg hover:border-green-600' 
                  : 'hover:border-blue-500'
              }`}
            >
              <div className="relative">
                <div className="aspect-[210/297] bg-gray-100 relative overflow-hidden">
                  <TemplatePreview templateId={template.id} />
                  
                  <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-2 flex gap-2">
                    <Button
                      size="sm"
                      className={`flex-1 ${
                        template.isRecommended 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : ''
                      }`}
                      onClick={() => {
                        sessionStorage.setItem('selectedTemplate', template.id)
                        onSelectTemplate(template.id)
                      }}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Select
                    </Button>
                  </div>

                  {template.isRecommended && (
                    <div className="absolute top-2 left-2 z-10">
                      <Badge className="bg-green-600 text-white font-bold shadow-lg">
                        RECOMMENDED
                      </Badge>
                    </div>
                  )}

                  {template.isPremium && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Premium
                      </Badge>
                    </div>
                  )}

                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="bg-white/90">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {template.popularity}%
                    </Badge>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1">
                    {template.name}
                    {template.isRecommended && (
                      <span className="ml-2 text-green-600 text-sm font-normal">
                        (Most Popular)
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {template.features.map((feature, idx) => (
                      <Badge 
                        key={idx} 
                        variant="outline" 
                        className={`text-xs ${
                          template.isRecommended && feature.startsWith('✓') 
                            ? 'border-green-500 text-green-700' 
                            : ''
                        }`}
                      >
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}