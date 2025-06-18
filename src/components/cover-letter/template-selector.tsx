'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { CoverLetterTemplate, CoverLetterContent, dublinTemplateManager } from '@/lib/cover-letter-templates-new'

interface TemplateSelectorProps {
  selectedTemplate?: string | null
  selectedColor?: string
  onTemplateSelect: (templateId: string) => void
  onColorSelect?: (color: string) => void
  showColors?: boolean
  showSearch?: boolean
  showCategories?: boolean
  personalInfo?: {
    firstName: string
    lastName: string
  }
}

interface TemplateResponse {
  success: boolean
  templates: CoverLetterTemplate[]
  categories: string[]
  total: number
}

const defaultColors = {
  color1: '#1a365d',
  color2: '#2d3748', 
  color3: '#744210',
  color4: '#553c9a',
  color5: '#0f766e',
  color6: '#b91c1c',
  color7: '#be185d',
  color8: '#047857'
}

export function TemplateSelector({
  selectedTemplate,
  selectedColor = 'color1',
  onTemplateSelect,
  onColorSelect,
  showColors = true,
  showSearch = true,
  showCategories = true,
  personalInfo
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<CoverLetterTemplate[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('recommended')
  const [searchQuery, setSearchQuery] = useState('')
  const [previewLoading, setPreviewLoading] = useState<Record<string, boolean>>({})

  // Fetch templates
  useEffect(() => {
    fetchTemplates()
  }, [selectedCategory, searchQuery])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'recommended') {
          params.append('recommended', 'true')
        } else {
          params.append('category', selectedCategory)
        }
      }
      
      if (searchQuery) {
        params.append('search', searchQuery)
      }

      const response = await fetch(`/api/cover-letter-templates?${params}`)
      const data: TemplateResponse = await response.json()

      if (data.success) {
        console.log('✅ Templates loaded from API:', data.templates.length)
        console.log('✅ First template:', data.templates[0])
        setTemplates(data.templates)
        setCategories(['all', 'recommended', ...data.categories])
      } else {
        console.error('❌ Failed to load templates:', data)
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setLoading(false)
    }
  }

  // Category filtering
  const categoryOptions = useMemo(() => [
    { value: 'recommended', label: 'Recommended', icon: '⭐' },
    { value: 'all', label: 'All Templates', icon: '📄' },
    { value: 'professional', label: 'Professional', icon: '💼' },
    { value: 'modern', label: 'Modern', icon: '🚀' },
    { value: 'creative', label: 'Creative', icon: '🎨' },
    { value: 'executive', label: 'Executive', icon: '👔' },
    { value: 'tech', label: 'Tech', icon: '💻' },
    { value: 'classic', label: 'Classic', icon: '📜' },
    { value: 'minimal', label: 'Minimal', icon: '⚡' },
    { value: 'academic', label: 'Academic', icon: '🎓' },
    { value: 'casual', label: 'Casual', icon: '😊' }
  ], [])

  // Template preview generator using Dublin templates
  const generatePreview = (template: CoverLetterTemplate) => {
    const name = personalInfo?.firstName && personalInfo?.lastName 
      ? `${personalInfo.firstName} ${personalInfo.lastName}`
      : 'John O\'Sullivan'

    const sampleData: CoverLetterContent = {
      name: name,
      title: 'Software Developer',
      email: 'john.osullivan@email.com',
      phone: '+353 1 234 5678',
      address: 'Dublin 2, Ireland',
      recipient: {
        name: 'Ms. Sarah Murphy',
        title: 'Hiring Manager',
        company: 'Tech Ireland Ltd',
        address: 'IFSC, Dublin 1'
      },
      date: new Date().toLocaleDateString('en-IE', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      salutation: 'Dear Ms. Murphy',
      opening: 'I am writing to express my strong interest in the Software Developer position at Tech Ireland Ltd.',
      body: [
        'With over 3 years of experience in software development, I have successfully delivered multiple projects using modern technologies.',
        'In my current role at Dublin Tech Solutions, I have led the development of a customer portal that serves over 50,000 users.',
        'I am particularly drawn to Tech Ireland Ltd because of your commitment to innovation and your reputation as one of Ireland\'s most employee-friendly tech companies.'
      ],
      closing: 'Thank you for considering my application. I would welcome the opportunity to discuss how my skills and enthusiasm can contribute to Tech Ireland Ltd\'s continued success.',
      signature: 'Yours sincerely, ' + name
    }

    const previewHTML = dublinTemplateManager.generateHTML(template.id, sampleData)
    
    // Debug logs
    console.log('🔍 Template Debug Info:')
    console.log('Template ID:', template.id)
    console.log('Template name:', template.name) 
    console.log('Base template:', template.baseTemplate)
    console.log('Preview HTML length:', previewHTML?.length || 0)
    console.log('Preview HTML start:', previewHTML?.substring(0, 100))
    console.log('Sample data:', sampleData)
    
    if (!previewHTML || previewHTML.length === 0) {
      return (
        <div className="template-preview-fallback" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          backgroundColor: '#f8f9fa',
          border: '1px solid #e9ecef',
          borderRadius: '4px',
          fontSize: '12px',
          color: '#6c757d'
        }}>
          Preview not available
        </div>
      )
    }

    return (
      <div style={{ 
        width: '100%', 
        height: '450px', 
        position: 'relative',
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '4px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}>
        <div 
          className="template-preview"
          style={{
            transform: 'scale(0.55)',
            transformOrigin: 'top center',
            width: '182%',
            height: '182%',
            pointerEvents: 'none',
            backgroundColor: '#fff',
            position: 'absolute',
            left: '50%',
            marginLeft: '-91%'
          }}
          dangerouslySetInnerHTML={{ __html: previewHTML }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      {(showSearch || showCategories) && (
        <div className="space-y-4">
          {showSearch && (
            <div>
              <Label htmlFor="search">Search Templates</Label>
              <Input
                id="search"
                placeholder="Search by name, category, or features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mt-1"
              />
            </div>
          )}

          {showCategories && (
            <div>
              <Label>Categories</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {categoryOptions.map((category) => (
                  <Button
                    key={category.value}
                    variant={selectedCategory === category.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category.value)}
                    className="text-xs"
                  >
                    <span className="mr-1">{category.icon}</span>
                    {category.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Color Selection */}
      {showColors && onColorSelect && (
        <div>
          <Label>Choose Color Theme</Label>
          <div className="grid grid-cols-8 gap-3 mt-2">
            {Object.entries(defaultColors).map(([colorKey, colorValue]) => (
              <button
                key={colorKey}
                className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                  selectedColor === colorKey 
                    ? 'border-gray-800 ring-2 ring-offset-2 ring-gray-400' 
                    : 'border-gray-300 hover:border-gray-500'
                }`}
                style={{ backgroundColor: colorValue }}
                onClick={() => onColorSelect(colorKey)}
                title={`Color ${colorKey.slice(-1)}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Templates Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <Label className="text-lg font-semibold">
            Choose Template {templates.length > 0 && `(${templates.length})`}
          </Label>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-4">
                <Skeleton className="w-full h-48 mb-3" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </Card>
            ))}
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg font-medium mb-2">No templates found</p>
              <p className="text-sm">Try adjusting your search or category filters</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card
                key={template.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg group ${
                  selectedTemplate === template.id
                    ? 'ring-2 ring-blue-500 shadow-lg'
                    : 'hover:scale-[1.02]'
                }`}
                onClick={() => onTemplateSelect(template.id)}
              >
                <div className="p-4">
                  {/* Template Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600">
                        {template.name}
                      </h4>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={template.recommended ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {template.category}
                        </Badge>
                        {template.recommended && (
                          <Badge variant="outline" className="text-xs">
                            ⭐ Recommended
                          </Badge>
                        )}
                      </div>
                    </div>
                    {selectedTemplate === template.id && (
                      <div className="text-blue-500">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Template Preview */}
                  <div className="bg-gray-50 rounded border overflow-hidden" style={{ height: '450px' }}>
                    {generatePreview(template)}
                  </div>

                  {/* Template Features */}
                  {template.features && template.features.length > 0 && (
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-1">
                        {template.features.slice(0, 3).map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {template.features.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.features.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}