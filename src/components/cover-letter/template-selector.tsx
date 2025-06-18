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

    // Create static preview instead of scaled template
    const createStaticPreview = () => {
      switch (template.id) {
        case 'dublin-professional':
          return (
            <div style={{ 
              width: '100%', 
              height: '500px', 
              display: 'flex',
              fontFamily: 'Arial, sans-serif',
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: '40%',
                backgroundColor: '#2c3e50',
                color: 'white',
                padding: '25px 20px'
              }}>
                <h3 style={{ 
                  fontSize: '22px', 
                  fontWeight: 'bold', 
                  margin: '0 0 8px 0',
                  color: 'white'
                }}>
                  John O'Sullivan
                </h3>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#3498db',
                  margin: '0 0 20px 0'
                }}>
                  Software Engineer
                </p>
                <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
                  <p style={{ margin: '0 0 8px 0' }}>📧 john@email.com</p>
                  <p style={{ margin: '0 0 8px 0' }}>📱 +353 1 234 5678</p>
                  <p style={{ margin: '0' }}>📍 Dublin 2, Ireland</p>
                </div>
              </div>
              <div style={{
                flex: 1,
                padding: '25px 20px',
                backgroundColor: 'white',
                fontSize: '12px',
                lineHeight: '1.5'
              }}>
                <p style={{ 
                  textAlign: 'right', 
                  color: '#666',
                  margin: '0 0 20px 0',
                  fontSize: '11px'
                }}>
                  18 June 2025
                </p>
                <div style={{ marginBottom: '15px', fontSize: '11px' }}>
                  <p style={{ margin: '0 0 3px 0', fontWeight: 'bold' }}>Ms. Sarah Murphy</p>
                  <p style={{ margin: '0 0 3px 0' }}>Hiring Manager</p>
                  <p style={{ margin: '0 0 3px 0' }}>Tech Ireland Ltd</p>
                  <p style={{ margin: '0' }}>IFSC, Dublin 1</p>
                </div>
                <p style={{ margin: '0 0 12px 0', fontSize: '12px' }}>Dear Ms. Murphy,</p>
                <p style={{ 
                  color: '#333',
                  lineHeight: '1.4',
                  fontSize: '11px',
                  margin: '0'
                }}>
                  I am writing to express my strong interest in the Software Engineer position at Tech Ireland Ltd. With my experience in modern web technologies...
                </p>
              </div>
            </div>
          )

        case 'trinity-modern':
          return (
            <div style={{ 
              width: '100%', 
              height: '500px', 
              fontFamily: 'Arial, sans-serif',
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              overflow: 'hidden',
              padding: '30px 25px'
            }}>
              <div style={{
                textAlign: 'center',
                borderBottom: '3px solid #0066cc',
                paddingBottom: '20px',
                marginBottom: '25px'
              }}>
                <h3 style={{ 
                  fontSize: '28px', 
                  fontWeight: 'bold', 
                  margin: '0 0 8px 0',
                  color: '#0066cc'
                }}>
                  John O'Sullivan
                </h3>
                <p style={{ 
                  fontSize: '16px', 
                  color: '#666',
                  margin: '0 0 10px 0'
                }}>
                  Frontend Developer
                </p>
                <p style={{ 
                  fontSize: '12px', 
                  color: '#999',
                  margin: '0'
                }}>
                  john@email.com | +353 1 234 5678
                </p>
              </div>
              <div style={{ textAlign: 'left', fontSize: '12px', lineHeight: '1.5' }}>
                <p style={{ 
                  textAlign: 'right', 
                  color: '#666',
                  margin: '0 0 20px 0',
                  fontSize: '11px'
                }}>
                  18 June 2025
                </p>
                <p style={{ margin: '0 0 15px 0', fontSize: '12px' }}>Dear Hiring Manager,</p>
                <p style={{ 
                  color: '#333',
                  lineHeight: '1.4',
                  fontSize: '11px',
                  margin: '0'
                }}>
                  I am excited to apply for the Frontend Developer position. My experience with React, TypeScript, and modern development practices...
                </p>
              </div>
            </div>
          )

        case 'tech-dublin':
          return (
            <div style={{ 
              width: '100%', 
              height: '500px', 
              fontFamily: 'Inter, sans-serif',
              backgroundColor: '#f8fafc',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                backgroundColor: '#0f172a',
                color: 'white',
                padding: '30px',
                textAlign: 'center'
              }}>
                <h3 style={{ 
                  fontSize: '26px', 
                  fontWeight: 'bold', 
                  margin: '0 0 8px 0',
                  color: 'white'
                }}>
                  John O'Sullivan
                </h3>
                <p style={{ 
                  fontSize: '14px', 
                  margin: '0',
                  opacity: 0.9
                }}>
                  Software Developer
                </p>
              </div>
              <div style={{
                backgroundColor: 'white',
                margin: '15px',
                padding: '25px 20px',
                borderRadius: '8px',
                fontSize: '12px',
                lineHeight: '1.5'
              }}>
                <p style={{ 
                  textAlign: 'right', 
                  color: '#64748b',
                  margin: '0 0 20px 0',
                  fontSize: '11px'
                }}>
                  18 June 2025
                </p>
                <div style={{ marginBottom: '15px', fontSize: '11px' }}>
                  <p style={{ margin: '0 0 3px 0', fontWeight: 'bold' }}>Mr. Sean O'Connor</p>
                  <p style={{ margin: '0 0 3px 0' }}>Tech Lead</p>
                  <p style={{ margin: '0 0 3px 0' }}>Dublin Tech Hub</p>
                </div>
                <p style={{ margin: '0 0 12px 0', fontSize: '12px' }}>Dear Mr. O'Connor,</p>
                <p style={{ 
                  color: '#1e293b',
                  lineHeight: '1.4',
                  fontSize: '11px',
                  margin: '0'
                }}>
                  I am writing to apply for the Software Developer position at Dublin Tech Hub. My expertise in React, Node.js, and cloud technologies...
                </p>
              </div>
            </div>
          )

        case 'corporate-dublin':
          return (
            <div style={{ 
              width: '100%', 
              height: '500px', 
              display: 'flex',
              fontFamily: 'Arial, sans-serif',
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: '45%',
                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                color: 'white',
                padding: '25px 20px'
              }}>
                <h3 style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  margin: '0 0 8px 0',
                  color: 'white'
                }}>
                  John O'Sullivan
                </h3>
                <p style={{ 
                  fontSize: '14px', 
                  margin: '0 0 25px 0',
                  opacity: 0.9
                }}>
                  Financial Analyst
                </p>
                <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
                  <p style={{ margin: '0 0 10px 0' }}>📧 john@email.com</p>
                  <p style={{ margin: '0 0 10px 0' }}>📱 +353 1 234 5678</p>
                  <p style={{ margin: '0' }}>📍 Dublin 2, Ireland</p>
                </div>
              </div>
              <div style={{
                flex: 1,
                padding: '25px 20px',
                backgroundColor: 'white',
                fontSize: '12px',
                lineHeight: '1.5'
              }}>
                <p style={{ 
                  textAlign: 'right', 
                  color: '#666',
                  margin: '0 0 20px 0',
                  fontSize: '11px'
                }}>
                  18 June 2025
                </p>
                <div style={{ marginBottom: '15px', fontSize: '11px' }}>
                  <p style={{ margin: '0 0 3px 0', fontWeight: 'bold' }}>Ms. Claire Walsh</p>
                  <p style={{ margin: '0 0 3px 0' }}>HR Director</p>
                  <p style={{ margin: '0 0 3px 0' }}>Finance Corp Ireland</p>
                </div>
                <p style={{ margin: '0 0 12px 0', fontSize: '12px' }}>Dear Ms. Walsh,</p>
                <p style={{ 
                  color: '#333',
                  lineHeight: '1.4',
                  fontSize: '11px',
                  margin: '0'
                }}>
                  I am writing to apply for the Financial Analyst position at Finance Corp Ireland. My strong analytical skills and experience...
                </p>
              </div>
            </div>
          )

        case 'creative-cork':
          return (
            <div style={{ 
              width: '100%', 
              height: '500px', 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '2px',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                backgroundColor: 'white',
                height: '100%',
                padding: '30px 25px',
                fontFamily: 'Georgia, serif'
              }}>
                <div style={{ marginBottom: '25px' }}>
                  <h3 style={{ 
                    fontSize: '26px', 
                    fontWeight: 'bold', 
                    margin: '0 0 8px 0',
                    color: '#667eea'
                  }}>
                    Jane O'Sullivan
                  </h3>
                  <p style={{ 
                    fontSize: '16px', 
                    color: '#764ba2',
                    margin: '0 0 15px 0'
                  }}>
                    Graphic Designer
                  </p>
                  <p style={{ 
                    fontSize: '12px', 
                    color: '#666',
                    margin: '0'
                  }}>
                    jane@email.com | +353 1 234 5678 | Cork, Ireland
                  </p>
                </div>
                <div style={{ fontSize: '12px', lineHeight: '1.5' }}>
                  <p style={{ 
                    textAlign: 'right', 
                    color: '#666',
                    margin: '0 0 20px 0',
                    fontSize: '11px'
                  }}>
                    18 June 2025
                  </p>
                  <div style={{ marginBottom: '15px', fontSize: '11px' }}>
                    <p style={{ margin: '0 0 3px 0', fontWeight: 'bold' }}>Mr. David Walsh</p>
                    <p style={{ margin: '0 0 3px 0' }}>Creative Director</p>
                    <p style={{ margin: '0 0 3px 0' }}>Cork Design Studio</p>
                  </div>
                  <p style={{ margin: '0 0 12px 0', fontSize: '12px' }}>Dear Mr. Walsh,</p>
                  <p style={{ 
                    color: '#4a5568',
                    lineHeight: '1.4',
                    fontSize: '11px',
                    margin: '0'
                  }}>
                    I am thrilled to apply for the Graphic Designer position at Cork Design Studio. My creative background in visual design and branding...
                  </p>
                </div>
              </div>
            </div>
          )

        case 'executive-dublin':
          return (
            <div style={{ 
              width: '100%', 
              height: '500px', 
              fontFamily: 'Garamond, serif',
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                backgroundColor: '#2c3e50',
                color: 'white',
                padding: '35px 30px',
                textAlign: 'center'
              }}>
                <h3 style={{ 
                  fontSize: '30px', 
                  fontWeight: 'bold', 
                  margin: '0 0 10px 0',
                  color: 'white'
                }}>
                  Michael O'Sullivan
                </h3>
                <p style={{ 
                  fontSize: '16px', 
                  margin: '0',
                  opacity: 0.9
                }}>
                  Chief Executive Officer
                </p>
              </div>
              <div style={{
                padding: '30px 25px',
                fontSize: '12px',
                lineHeight: '1.6'
              }}>
                <p style={{ 
                  textAlign: 'right', 
                  color: '#666',
                  margin: '0 0 25px 0',
                  fontSize: '11px'
                }}>
                  18 June 2025
                </p>
                <div style={{ marginBottom: '18px', fontSize: '11px' }}>
                  <p style={{ margin: '0 0 3px 0', fontWeight: 'bold' }}>Mr. Patrick Kelly</p>
                  <p style={{ margin: '0 0 3px 0' }}>Chairman of the Board</p>
                  <p style={{ margin: '0 0 3px 0' }}>Enterprise Ireland Ltd</p>
                </div>
                <p style={{ margin: '0 0 15px 0', fontSize: '12px', fontWeight: 600 }}>Dear Mr. Kelly,</p>
                <p style={{ 
                  color: '#2c3e50',
                  lineHeight: '1.6',
                  fontSize: '11px',
                  margin: '0'
                }}>
                  I am writing to express my interest in the Chief Executive Officer position at Enterprise Ireland Ltd. With over 15 years of executive leadership experience...
                </p>
              </div>
            </div>
          )

        default:
          return (
            <div style={{ 
              width: '100%', 
              height: '500px', 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f8f9fa',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              fontSize: '14px',
              color: '#666'
            }}>
              Template Preview
            </div>
          )
      }
    }

    return createStaticPreview()
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
          <div 
            className="template-grid-zety"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
              gap: '30px',
              maxWidth: '1400px',
              margin: '0 auto',
              padding: '0 20px'
            }}
          >
            {templates.map((template) => (
              <div
                key={template.id}
                className="template-card-zety group"
                style={{
                  position: 'relative',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  border: selectedTemplate === template.id ? '3px solid #3b82f6' : '1px solid #e5e7eb'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
                  const overlay = e.currentTarget.querySelector('.template-hover-overlay');
                  if (overlay) {
                    overlay.style.opacity = '1';
                    const button = overlay.querySelector('button');
                    if (button) button.style.transform = 'translateY(0)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                  const overlay = e.currentTarget.querySelector('.template-hover-overlay');
                  if (overlay) {
                    overlay.style.opacity = '0';
                    const button = overlay.querySelector('button');
                    if (button) button.style.transform = 'translateY(10px)';
                  }
                }}
              >
                {/* Template Header */}
                <div style={{ padding: '20px 20px 15px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <h4 style={{ 
                      fontSize: '18px', 
                      fontWeight: '600', 
                      color: '#1f2937',
                      margin: '0'
                    }}>
                      {template.name}
                    </h4>
                    {selectedTemplate === template.id && (
                      <div style={{ color: '#3b82f6' }}>
                        <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      backgroundColor: template.recommended ? '#3b82f6' : '#6b7280',
                      color: 'white',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: '500',
                      textTransform: 'uppercase'
                    }}>
                      {template.category}
                    </span>
                    {template.recommended && (
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        backgroundColor: '#fbbf24',
                        color: '#92400e',
                        borderRadius: '15px',
                        fontSize: '10px',
                        fontWeight: '600'
                      }}>
                        ⭐ Recommended
                      </span>
                    )}
                  </div>
                </div>

                {/* Template Preview with Hover Overlay */}
                <div style={{ 
                  position: 'relative',
                  height: '500px',
                  backgroundColor: '#f8f9fa',
                  overflow: 'hidden'
                }}>
                  {/* Template Preview */}
                  <div style={{ height: '100%' }}>
                    {generatePreview(template)}
                  </div>
                  
                  {/* Hover Overlay */}
                  <div 
                    className="template-hover-overlay"
                    style={{
                      position: 'absolute',
                      top: '0',
                      left: '0',
                      right: '0',
                      bottom: '0',
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: '0',
                      transition: 'opacity 0.3s ease',
                      pointerEvents: 'none'
                    }}
                  >
                    <button
                      style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '12px 24px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transform: 'translateY(10px)',
                        transition: 'all 0.3s ease',
                        pointerEvents: 'auto'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onTemplateSelect(template.id);
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#2563eb';
                        e.target.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#3b82f6';
                        e.target.style.transform = 'scale(1)';
                      }}
                    >
                      Use This Template
                    </button>
                  </div>
                </div>

                {/* Template Features */}
                {template.features && template.features.length > 0 && (
                  <div style={{ padding: '15px 20px 20px 20px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {template.features.slice(0, 3).map((feature, index) => (
                        <span
                          key={index}
                          style={{
                            display: 'inline-block',
                            padding: '3px 8px',
                            backgroundColor: '#f3f4f6',
                            color: '#374151',
                            border: '1px solid #d1d5db',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '500'
                          }}
                        >
                          {feature}
                        </span>
                      ))}
                      {template.features.length > 3 && (
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          backgroundColor: '#f3f4f6',
                          color: '#6b7280',
                          border: '1px solid #d1d5db',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '500'
                        }}>
                          +{template.features.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}