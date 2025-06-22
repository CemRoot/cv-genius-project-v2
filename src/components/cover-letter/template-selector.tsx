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

    // Get the selected color value
    const selectedColorValue = defaultColors[selectedColor as keyof typeof defaultColors] || defaultColors.color1

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
                backgroundColor: selectedColorValue,
                color: 'white',
                padding: '25px 20px'
              }}>
                <h3 style={{ 
                  fontSize: '22px', 
                  fontWeight: 'bold', 
                  margin: '0 0 8px 0',
                  color: 'white'
                }}>
                  {name}
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
                borderBottom: `3px solid ${selectedColorValue}`,
                paddingBottom: '20px',
                marginBottom: '25px'
              }}>
                <h3 style={{ 
                  fontSize: '28px', 
                  fontWeight: 'bold', 
                  margin: '0 0 8px 0',
                  color: selectedColorValue
                }}>
                  {name}
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
                backgroundColor: selectedColorValue,
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
                  {name}
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
                background: `linear-gradient(135deg, ${selectedColorValue} 0%, ${selectedColorValue}99 100%)`,
                color: 'white',
                padding: '25px 20px'
              }}>
                <h3 style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  margin: '0 0 8px 0',
                  color: 'white'
                }}>
                  {name}
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
                    color: selectedColorValue
                  }}>
                    {name}
                  </h3>
                  <p style={{ 
                    fontSize: '16px', 
                    color: selectedColorValue,
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
                backgroundColor: selectedColorValue,
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
                  {name}
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
                  color: selectedColorValue,
                  lineHeight: '1.6',
                  fontSize: '11px',
                  margin: '0'
                }}>
                  I am writing to express my interest in the Chief Executive Officer position at Enterprise Ireland Ltd. With over 15 years of executive leadership experience...
                </p>
              </div>
            </div>
          )

        // 2025 Modern Templates
        case 'minimalist-pro-2025':
          return (
            <div style={{ 
              width: '100%', 
              height: '500px', 
              fontFamily: 'Inter, sans-serif',
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              overflow: 'hidden',
              padding: '60px 50px'
            }}>
              <div style={{
                borderLeft: `4px solid ${selectedColorValue}`,
                paddingLeft: '20px',
                marginBottom: '50px'
              }}>
                <h3 style={{ 
                  fontSize: '28px', 
                  fontWeight: '300', 
                  margin: '0 0 8px 0',
                  color: selectedColorValue,
                  letterSpacing: '1px'
                }}>
                  {name}
                </h3>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#4a5568',
                  margin: '0',
                  fontWeight: '300'
                }}>
                  Software Developer
                </p>
              </div>
              <div style={{ fontSize: '11px', lineHeight: '2', color: '#2d3748' }}>
                <p style={{ 
                  textAlign: 'right', 
                  color: '#718096',
                  margin: '0 0 30px 0',
                  fontSize: '10px'
                }}>
                  18 June 2025
                </p>
                <p style={{ margin: '0 0 20px 0', fontSize: '11px', color: '#4a5568' }}>Dear Hiring Manager,</p>
                <p style={{ 
                  margin: '0',
                  fontSize: '10px',
                  lineHeight: '1.8'
                }}>
                  I am writing to express my interest in the Software Developer position. My expertise in modern technologies and clean code practices...
                </p>
              </div>
            </div>
          )

        case 'modern-columns-2025':
          return (
            <div style={{ 
              width: '100%', 
              height: '500px', 
              display: 'flex',
              fontFamily: 'Inter, sans-serif',
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: '35%',
                backgroundColor: selectedColorValue,
                color: 'white',
                padding: '30px 25px'
              }}>
                <h3 style={{ 
                  fontSize: '20px', 
                  fontWeight: 'bold', 
                  margin: '0 0 8px 0',
                  color: 'white'
                }}>
                  {name}
                </h3>
                <p style={{ 
                  fontSize: '12px', 
                  margin: '0 0 20px 0',
                  opacity: 0.9
                }}>
                  Frontend Developer
                </p>
                <div style={{ fontSize: '10px', lineHeight: '1.6' }}>
                  <p style={{ margin: '0 0 8px 0' }}>📧 john@email.com</p>
                  <p style={{ margin: '0 0 8px 0' }}>📱 +353 1 234 5678</p>
                  <p style={{ margin: '0' }}>📍 Dublin, Ireland</p>
                </div>
              </div>
              <div style={{
                flex: 1,
                padding: '30px 25px',
                backgroundColor: 'white',
                fontSize: '11px',
                lineHeight: '1.7'
              }}>
                <p style={{ 
                  textAlign: 'right', 
                  color: '#666',
                  margin: '0 0 20px 0',
                  fontSize: '10px'
                }}>
                  18 June 2025
                </p>
                <p style={{ margin: '0 0 15px 0', fontSize: '11px' }}>Dear Hiring Manager,</p>
                <p style={{ 
                  color: '#1f2937',
                  lineHeight: '1.6',
                  fontSize: '10px',
                  margin: '0'
                }}>
                  I am excited to apply for the Frontend Developer position. My experience with React and modern development practices...
                </p>
              </div>
            </div>
          )

        case 'tech-forward-2025':
          return (
            <div style={{ 
              width: '100%', 
              height: '500px', 
              fontFamily: 'Inter, sans-serif',
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderLeft: `5px solid ${selectedColorValue}`,
              borderRadius: '4px',
              overflow: 'hidden',
              padding: '40px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '30px',
                paddingBottom: '20px',
                borderBottom: `1px solid ${selectedColorValue}20`
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: selectedColorValue,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '20px',
                  color: 'white',
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}>
                  {name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 style={{ 
                    fontSize: '24px', 
                    fontWeight: 'bold', 
                    margin: '0 0 4px 0',
                    color: selectedColorValue
                  }}>
                    {name}
                  </h3>
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#0f172a',
                    margin: '0'
                  }}>
                    Full Stack Developer
                  </p>
                </div>
              </div>
              <div style={{ fontSize: '11px', lineHeight: '1.6', color: '#0f172a' }}>
                <p style={{ 
                  textAlign: 'right', 
                  color: '#64748b',
                  margin: '0 0 20px 0',
                  fontSize: '10px'
                }}>
                  18 June 2025
                </p>
                <p style={{ margin: '0 0 15px 0', fontSize: '11px' }}>Dear Tech Team,</p>
                <p style={{ 
                  margin: '0',
                  fontSize: '10px',
                  lineHeight: '1.6'
                }}>
                  I am writing to apply for the Full Stack Developer position. My passion for innovative technologies and scalable solutions...
                </p>
              </div>
            </div>
          )

        case 'corporate-sleek-2025':
          return (
            <div style={{ 
              width: '100%', 
              height: '500px', 
              fontFamily: 'Source Sans Pro, sans-serif',
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              overflow: 'hidden',
              padding: '40px'
            }}>
              <div style={{
                textAlign: 'center',
                paddingBottom: '25px',
                marginBottom: '30px',
                borderBottom: `2px solid ${selectedColorValue}`
              }}>
                <h3 style={{ 
                  fontSize: '26px', 
                  fontWeight: '600', 
                  margin: '0 0 8px 0',
                  color: selectedColorValue
                }}>
                  {name}
                </h3>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#1e293b',
                  margin: '0 0 10px 0'
                }}>
                  Business Analyst
                </p>
                <p style={{ 
                  fontSize: '11px', 
                  color: '#64748b',
                  margin: '0'
                }}>
                  john@email.com | +353 1 234 5678 | Dublin, Ireland
                </p>
              </div>
              <div style={{ fontSize: '11px', lineHeight: '1.7', color: '#1e293b' }}>
                <p style={{ 
                  textAlign: 'right', 
                  color: '#64748b',
                  margin: '0 0 20px 0',
                  fontSize: '10px'
                }}>
                  18 June 2025
                </p>
                <p style={{ margin: '0 0 15px 0', fontSize: '11px' }}>Dear Hiring Manager,</p>
                <p style={{ 
                  margin: '0',
                  fontSize: '10px',
                  lineHeight: '1.6'
                }}>
                  I am writing to express my interest in the Business Analyst position. My analytical skills and business acumen...
                </p>
              </div>
            </div>
          )

        case 'creative-accent-2025':
          return (
            <div style={{ 
              width: '100%', 
              height: '500px', 
              fontFamily: 'Poppins, sans-serif',
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              overflow: 'hidden',
              padding: '40px'
            }}>
              <div style={{
                textAlign: 'center',
                marginBottom: '30px',
                paddingBottom: '20px',
                borderBottom: `3px solid ${selectedColorValue}`,
                background: `linear-gradient(135deg, ${selectedColorValue}10 0%, transparent 100%)`
              }}>
                <h3 style={{ 
                  fontSize: '26px', 
                  fontWeight: 'bold', 
                  margin: '0 0 8px 0',
                  color: selectedColorValue
                }}>
                  {name}
                </h3>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#374151',
                  margin: '0'
                }}>
                  Creative Designer
                </p>
              </div>
              <div style={{ fontSize: '11px', lineHeight: '1.7', color: '#374151' }}>
                <p style={{ 
                  textAlign: 'right', 
                  color: '#6b7280',
                  margin: '0 0 20px 0',
                  fontSize: '10px'
                }}>
                  18 June 2025
                </p>
                <p style={{ margin: '0 0 15px 0', fontSize: '11px' }}>Dear Creative Team,</p>
                <p style={{ 
                  margin: '0',
                  fontSize: '10px',
                  lineHeight: '1.6'
                }}>
                  I am excited to apply for the Creative Designer position. My passion for innovative design and visual storytelling...
                </p>
              </div>
            </div>
          )

        // Dublin Industry-Specific Templates
        case 'banking-dublin':
          return (
            <div style={{ 
              width: '100%', 
              height: '500px', 
              fontFamily: 'Times, serif',
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              overflow: 'hidden',
              padding: '50px 40px'
            }}>
              <div style={{
                textAlign: 'center',
                marginBottom: '40px',
                paddingBottom: '25px',
                borderBottom: `2px solid ${selectedColorValue}`
              }}>
                <h3 style={{ 
                  fontSize: '28px', 
                  fontWeight: 'bold', 
                  margin: '0 0 8px 0',
                  color: selectedColorValue
                }}>
                  {name}
                </h3>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#1f2937',
                  margin: '0'
                }}>
                  Financial Analyst
                </p>
              </div>
              <div style={{ fontSize: '11px', lineHeight: '1.7', color: '#1f2937' }}>
                <p style={{ 
                  textAlign: 'right', 
                  color: '#6b7280',
                  margin: '0 0 25px 0',
                  fontSize: '10px'
                }}>
                  18 June 2025
                </p>
                <p style={{ margin: '0 0 15px 0', fontSize: '11px' }}>Dear Hiring Manager,</p>
                <p style={{ 
                  margin: '0',
                  fontSize: '10px',
                  lineHeight: '1.7'
                }}>
                  I am writing to express my interest in the Financial Analyst position. My expertise in financial modeling and risk analysis...
                </p>
              </div>
            </div>
          )

        case 'healthcare-dublin':
          return (
            <div style={{ 
              width: '100%', 
              height: '500px', 
              fontFamily: 'Arial, sans-serif',
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              overflow: 'hidden',
              padding: '45px'
            }}>
              <div style={{
                borderLeft: `4px solid ${selectedColorValue}`,
                paddingLeft: '20px',
                marginBottom: '35px'
              }}>
                <h3 style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  margin: '0 0 8px 0',
                  color: selectedColorValue
                }}>
                  {name}
                </h3>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#374151',
                  margin: '0'
                }}>
                  Registered Nurse
                </p>
              </div>
              <div style={{ fontSize: '11px', lineHeight: '1.7', color: '#1f2937' }}>
                <p style={{ 
                  textAlign: 'right', 
                  color: '#6b7280',
                  margin: '0 0 20px 0',
                  fontSize: '10px'
                }}>
                  18 June 2025
                </p>
                <p style={{ margin: '0 0 15px 0', fontSize: '11px' }}>Dear Nurse Manager,</p>
                <p style={{ 
                  margin: '0',
                  fontSize: '10px',
                  lineHeight: '1.7'
                }}>
                  I am writing to apply for the Registered Nurse position. My compassionate patient care approach and clinical expertise...
                </p>
              </div>
            </div>
          )

        case 'academic-dublin':
          return (
            <div style={{ 
              width: '100%', 
              height: '500px', 
              fontFamily: 'Georgia, serif',
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              overflow: 'hidden',
              padding: '50px 45px'
            }}>
              <div style={{
                textAlign: 'left',
                marginBottom: '40px'
              }}>
                <h3 style={{ 
                  fontSize: '26px', 
                  fontWeight: 'normal', 
                  margin: '0 0 8px 0',
                  color: selectedColorValue,
                  fontFamily: 'Georgia, serif'
                }}>
                  Dr. {name}
                </h3>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#4b5563',
                  margin: '0',
                  fontStyle: 'italic'
                }}>
                  Assistant Professor of Computer Science
                </p>
              </div>
              <div style={{ fontSize: '11px', lineHeight: '1.8', color: '#1f2937' }}>
                <p style={{ 
                  textAlign: 'right', 
                  color: '#6b7280',
                  margin: '0 0 25px 0',
                  fontSize: '10px'
                }}>
                  18 June 2025
                </p>
                <p style={{ margin: '0 0 15px 0', fontSize: '11px' }}>Dear Search Committee,</p>
                <p style={{ 
                  margin: '0',
                  fontSize: '10px',
                  lineHeight: '1.8',
                  textAlign: 'justify'
                }}>
                  I am writing to express my interest in the Assistant Professor position. My research in machine learning and dedication to education...
                </p>
              </div>
            </div>
          )

        case 'startup-dublin':
          return (
            <div style={{ 
              width: '100%', 
              height: '500px', 
              fontFamily: 'Inter, sans-serif',
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                background: `linear-gradient(135deg, ${selectedColorValue} 0%, ${selectedColorValue}99 100%)`,
                color: 'white',
                padding: '35px 30px',
                textAlign: 'center'
              }}>
                <h3 style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  margin: '0 0 8px 0',
                  color: 'white'
                }}>
                  {name}
                </h3>
                <p style={{ 
                  fontSize: '14px', 
                  margin: '0',
                  opacity: 0.9
                }}>
                  Product Manager
                </p>
              </div>
              <div style={{
                padding: '30px',
                fontSize: '11px',
                lineHeight: '1.6'
              }}>
                <p style={{ 
                  textAlign: 'right', 
                  color: '#6b7280',
                  margin: '0 0 20px 0',
                  fontSize: '10px'
                }}>
                  18 June 2025
                </p>
                <p style={{ margin: '0 0 15px 0', fontSize: '11px' }}>Hey there! 🚀</p>
                <p style={{ 
                  color: '#1f2937',
                  margin: '0',
                  fontSize: '10px',
                  lineHeight: '1.6'
                }}>
                  I'm excited to apply for the Product Manager role at your startup. My passion for building innovative products and agile mindset...
                </p>
              </div>
            </div>
          )

        case 'legal-dublin':
          return (
            <div style={{ 
              width: '100%', 
              height: '500px', 
              fontFamily: 'Times New Roman, serif',
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              overflow: 'hidden',
              padding: '60px 50px'
            }}>
              <div style={{
                textAlign: 'center',
                marginBottom: '50px',
                paddingBottom: '30px',
                borderBottom: `1px solid ${selectedColorValue}`
              }}>
                <h3 style={{ 
                  fontSize: '28px', 
                  fontWeight: 'normal', 
                  margin: '0 0 8px 0',
                  color: selectedColorValue,
                  letterSpacing: '1px'
                }}>
                  {name}, LL.B.
                </h3>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#374151',
                  margin: '0'
                }}>
                  Solicitor
                </p>
              </div>
              <div style={{ fontSize: '11px', lineHeight: '1.8', color: '#1f2937' }}>
                <p style={{ 
                  textAlign: 'right', 
                  color: '#6b7280',
                  margin: '0 0 30px 0',
                  fontSize: '10px'
                }}>
                  18 June 2025
                </p>
                <p style={{ margin: '0 0 20px 0', fontSize: '11px' }}>Dear Partner,</p>
                <p style={{ 
                  margin: '0',
                  fontSize: '10px',
                  lineHeight: '1.8',
                  textAlign: 'justify'
                }}>
                  I am writing to express my interest in the Solicitor position at your esteemed firm. My expertise in corporate law and litigation...
                </p>
              </div>
            </div>
          )

        case 'pharma-dublin':
          return (
            <div style={{ 
              width: '100%', 
              height: '500px', 
              fontFamily: 'Arial, sans-serif',
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              overflow: 'hidden',
              padding: '45px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '35px',
                paddingBottom: '20px',
                borderBottom: `2px solid ${selectedColorValue}`
              }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  backgroundColor: selectedColorValue,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '20px',
                  color: 'white',
                  fontSize: '20px',
                  fontWeight: 'bold'
                }}>
                  ℞
                </div>
                <div>
                  <h3 style={{ 
                    fontSize: '22px', 
                    fontWeight: 'bold', 
                    margin: '0 0 4px 0',
                    color: selectedColorValue
                  }}>
                    {name}
                  </h3>
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#374151',
                    margin: '0'
                  }}>
                    Pharmaceutical Research Scientist
                  </p>
                </div>
              </div>
              <div style={{ fontSize: '11px', lineHeight: '1.7', color: '#1f2937' }}>
                <p style={{ 
                  textAlign: 'right', 
                  color: '#6b7280',
                  margin: '0 0 20px 0',
                  fontSize: '10px'
                }}>
                  18 June 2025
                </p>
                <p style={{ margin: '0 0 15px 0', fontSize: '11px' }}>Dear Research Director,</p>
                <p style={{ 
                  margin: '0',
                  fontSize: '10px',
                  lineHeight: '1.7'
                }}>
                  I am writing to apply for the Pharmaceutical Research Scientist position. My expertise in drug development and clinical trials...
                </p>
              </div>
            </div>
          )

        case 'government-dublin':
          return (
            <div style={{ 
              width: '100%', 
              height: '500px', 
              fontFamily: 'Arial, sans-serif',
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              overflow: 'hidden',
              padding: '60px 50px'
            }}>
              <div style={{
                textAlign: 'center',
                marginBottom: '50px'
              }}>
                <h3 style={{ 
                  fontSize: '26px', 
                  fontWeight: 'normal', 
                  margin: '0 0 8px 0',
                  color: selectedColorValue
                }}>
                  {name}
                </h3>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#4b5563',
                  margin: '0'
                }}>
                  Civil Servant
                </p>
                <div style={{
                  width: '100px',
                  height: '2px',
                  backgroundColor: selectedColorValue,
                  margin: '20px auto 0 auto'
                }}></div>
              </div>
              <div style={{ fontSize: '11px', lineHeight: '1.8', color: '#1f2937' }}>
                <p style={{ 
                  textAlign: 'right', 
                  color: '#6b7280',
                  margin: '0 0 30px 0',
                  fontSize: '10px'
                }}>
                  18 June 2025
                </p>
                <p style={{ margin: '0 0 20px 0', fontSize: '11px' }}>Dear Hiring Panel,</p>
                <p style={{ 
                  margin: '0',
                  fontSize: '10px',
                  lineHeight: '1.8',
                  textAlign: 'justify'
                }}>
                  I am writing to express my interest in the Civil Servant position. My commitment to public service and policy development...
                </p>
              </div>
            </div>
          )

        case 'consulting-dublin':
          return (
            <div style={{ 
              width: '100%', 
              height: '500px', 
              fontFamily: 'Helvetica, sans-serif',
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                backgroundColor: '#f8fafc',
                padding: '30px',
                borderBottom: `4px solid ${selectedColorValue}`
              }}>
                <h3 style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  margin: '0 0 8px 0',
                  color: selectedColorValue
                }}>
                  {name}
                </h3>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#374151',
                  margin: '0'
                }}>
                  Management Consultant
                </p>
              </div>
              <div style={{
                padding: '30px',
                fontSize: '11px',
                lineHeight: '1.6'
              }}>
                <p style={{ 
                  textAlign: 'right', 
                  color: '#6b7280',
                  margin: '0 0 20px 0',
                  fontSize: '10px'
                }}>
                  18 June 2025
                </p>
                <p style={{ margin: '0 0 15px 0', fontSize: '11px' }}>Dear Consulting Team,</p>
                <p style={{ 
                  color: '#1f2937',
                  margin: '0',
                  fontSize: '10px',
                  lineHeight: '1.6'
                }}>
                  I am writing to apply for the Management Consultant position. My analytical skills and strategic thinking approach...
                </p>
              </div>
            </div>
          )

        case 'hospitality-dublin':
          return (
            <div style={{ 
              width: '100%', 
              height: '500px', 
              fontFamily: 'Georgia, serif',
              background: `linear-gradient(135deg, ${selectedColorValue}15 0%, #ffffff 100%)`,
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              overflow: 'hidden',
              padding: '40px'
            }}>
              <div style={{
                textAlign: 'center',
                marginBottom: '35px',
                backgroundColor: 'white',
                padding: '25px',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ 
                  fontSize: '26px', 
                  fontWeight: 'bold', 
                  margin: '0 0 8px 0',
                  color: selectedColorValue
                }}>
                  {name}
                </h3>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#92400e',
                  margin: '0'
                }}>
                  Hotel Manager
                </p>
              </div>
              <div style={{ fontSize: '11px', lineHeight: '1.7', color: '#451a03' }}>
                <p style={{ 
                  textAlign: 'right', 
                  color: '#92400e',
                  margin: '0 0 20px 0',
                  fontSize: '10px'
                }}>
                  18 June 2025
                </p>
                <p style={{ margin: '0 0 15px 0', fontSize: '11px' }}>Dear Hospitality Director,</p>
                <p style={{ 
                  margin: '0',
                  fontSize: '10px',
                  lineHeight: '1.7'
                }}>
                  I am delighted to apply for the Hotel Manager position. My passion for exceptional guest service and operational excellence...
                </p>
              </div>
            </div>
          )

        // Remaining 2025 Templates
        case 'executive-modern-2025':
          return (
            <div style={{ 
              width: '100%', 
              height: '500px', 
              fontFamily: 'Playfair Display, serif',
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              overflow: 'hidden',
              padding: '60px 50px'
            }}>
              <div style={{
                textAlign: 'center',
                marginBottom: '50px',
                paddingBottom: '30px',
                borderBottom: `1px solid ${selectedColorValue}`
              }}>
                <h3 style={{ 
                  fontSize: '32px', 
                  fontWeight: 'normal', 
                  margin: '0 0 12px 0',
                  color: selectedColorValue,
                  letterSpacing: '2px'
                }}>
                  {name}
                </h3>
                <p style={{ 
                  fontSize: '16px', 
                  color: '#0f172a',
                  margin: '0',
                  fontWeight: '300'
                }}>
                  Chief Technology Officer
                </p>
              </div>
              <div style={{ fontSize: '12px', lineHeight: '1.8', color: '#0f172a' }}>
                <p style={{ 
                  textAlign: 'right', 
                  color: '#64748b',
                  margin: '0 0 30px 0',
                  fontSize: '11px'
                }}>
                  18 June 2025
                </p>
                <p style={{ margin: '0 0 20px 0', fontSize: '12px', fontWeight: '600' }}>Dear Board of Directors,</p>
                <p style={{ 
                  margin: '0',
                  fontSize: '11px',
                  lineHeight: '1.8',
                  textAlign: 'justify'
                }}>
                  I am writing to express my interest in the Chief Technology Officer position. My visionary leadership in technology strategy...
                </p>
              </div>
            </div>
          )

        case 'professional-grid-2025':
          return (
            <div style={{ 
              width: '100%', 
              height: '500px', 
              fontFamily: 'Roboto, sans-serif',
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              overflow: 'hidden',
              display: 'grid',
              gridTemplateColumns: '1fr 2fr',
              gap: '0'
            }}>
              <div style={{
                backgroundColor: '#f8fafc',
                padding: '30px 25px',
                borderRight: `3px solid ${selectedColorValue}`
              }}>
                <h3 style={{ 
                  fontSize: '20px', 
                  fontWeight: 'bold', 
                  margin: '0 0 8px 0',
                  color: selectedColorValue
                }}>
                  {name}
                </h3>
                <p style={{ 
                  fontSize: '12px', 
                  color: '#111827',
                  margin: '0 0 20px 0'
                }}>
                  Project Manager
                </p>
                <div style={{ fontSize: '10px', lineHeight: '1.6', color: '#4b5563' }}>
                  <p style={{ margin: '0 0 8px 0' }}>📧 john@email.com</p>
                  <p style={{ margin: '0 0 8px 0' }}>📱 +353 1 234 5678</p>
                  <p style={{ margin: '0' }}>📍 Dublin, Ireland</p>
                </div>
              </div>
              <div style={{
                padding: '30px 25px',
                fontSize: '11px',
                lineHeight: '1.7'
              }}>
                <p style={{ 
                  textAlign: 'right', 
                  color: '#6b7280',
                  margin: '0 0 20px 0',
                  fontSize: '10px'
                }}>
                  18 June 2025
                </p>
                <p style={{ margin: '0 0 15px 0', fontSize: '11px' }}>Dear Hiring Manager,</p>
                <p style={{ 
                  color: '#111827',
                  margin: '0',
                  fontSize: '10px',
                  lineHeight: '1.7'
                }}>
                  I am writing to apply for the Project Manager position. My systematic approach to project delivery and team coordination...
                </p>
              </div>
            </div>
          )

        case 'minimal-accent-2025':
          return (
            <div style={{ 
              width: '100%', 
              height: '500px', 
              fontFamily: 'Inter, sans-serif',
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              overflow: 'hidden',
              padding: '80px 60px'
            }}>
              <div style={{
                borderLeft: `4px solid ${selectedColorValue}`,
                paddingLeft: '20px',
                marginBottom: '60px'
              }}>
                <h3 style={{ 
                  fontSize: '30px', 
                  fontWeight: '200', 
                  margin: '0 0 12px 0',
                  color: selectedColorValue,
                  letterSpacing: '3px'
                }}>
                  {name}
                </h3>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#1f2937',
                  margin: '0',
                  fontWeight: '300'
                }}>
                  UX Designer
                </p>
              </div>
              <div style={{ fontSize: '11px', lineHeight: '2', color: '#1f2937' }}>
                <p style={{ 
                  textAlign: 'right', 
                  color: '#9ca3af',
                  margin: '0 0 40px 0',
                  fontSize: '10px'
                }}>
                  18 June 2025
                </p>
                <p style={{ margin: '0 0 30px 0', fontSize: '11px' }}>Dear Design Team,</p>
                <p style={{ 
                  margin: '0',
                  fontSize: '10px',
                  lineHeight: '2'
                }}>
                  I am writing to express my interest in the UX Designer position. My user-centered design approach and attention to detail...
                </p>
              </div>
            </div>
          )

        case 'creative-modern-2025':
          return (
            <div style={{ 
              width: '100%', 
              height: '500px', 
              fontFamily: 'Nunito, sans-serif',
              background: `linear-gradient(135deg, ${selectedColorValue}08 0%, #ffffff 100%)`,
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              overflow: 'hidden',
              padding: '40px'
            }}>
              <div style={{
                textAlign: 'center',
                marginBottom: '35px',
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                border: `2px solid ${selectedColorValue}20`
              }}>
                <h3 style={{ 
                  fontSize: '28px', 
                  fontWeight: 'bold', 
                  margin: '0 0 8px 0',
                  color: selectedColorValue
                }}>
                  {name}
                </h3>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#374151',
                  margin: '0'
                }}>
                  Brand Designer
                </p>
              </div>
              <div style={{ fontSize: '11px', lineHeight: '1.7', color: '#374151' }}>
                <p style={{ 
                  textAlign: 'right', 
                  color: '#9ca3af',
                  margin: '0 0 20px 0',
                  fontSize: '10px'
                }}>
                  18 June 2025
                </p>
                <p style={{ margin: '0 0 15px 0', fontSize: '11px' }}>Hello Creative Team! 🎨</p>
                <p style={{ 
                  margin: '0',
                  fontSize: '10px',
                  lineHeight: '1.7'
                }}>
                  I'm thrilled to apply for the Brand Designer position. My innovative approach to visual identity and storytelling...
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
    <div className="space-y-4 md:space-y-6">
      <style jsx>{`
        .template-preview-content {
          transform: scale(0.5);
          transform-origin: center;
        }
        
        @media (min-width: 640px) {
          .template-preview-content {
            transform: scale(0.65);
          }
        }
        
        @media (min-width: 768px) {
          .template-preview-content {
            transform: scale(0.75);
          }
        }
        
        @media (min-width: 1024px) {
          .template-preview-content {
            transform: scale(0.8);
          }
        }
        
        .template-preview-content > div {
          width: 600px !important;
          height: 400px !important;
        }
      `}</style>
      {/* Search and Filters */}
      {(showSearch || showCategories) && (
        <div className="space-y-4">
          {showSearch && (
            <div>
              <Label htmlFor="search" className="block mb-2">Search Templates</Label>
              <Input
                id="search"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 text-base"
              />
            </div>
          )}

          {showCategories && (
            <div>
              <Label>Categories</Label>
              <div className="overflow-x-auto">
                <div className="flex gap-2 pb-2 min-w-max">
                  {categoryOptions.map((category) => (
                    <Button
                      key={category.value}
                      variant={selectedCategory === category.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category.value)}
                      className="text-xs whitespace-nowrap flex-shrink-0"
                    >
                      <span className="mr-2">{category.icon}</span>
                      {category.label}
                    </Button>
                  ))}
                </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`template-card bg-white rounded-xl overflow-hidden border-2 transition-all duration-300 cursor-pointer ${
                  selectedTemplate === template.id 
                    ? 'border-blue-500 shadow-lg transform scale-105' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
                onClick={() => onTemplateSelect(template.id)}
              >
                {/* Template Header */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-semibold text-gray-900 truncate">
                      {template.name}
                    </h4>
                    {selectedTemplate === template.id && (
                      <div className="text-blue-500 flex-shrink-0">
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      template.recommended ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white'
                    }`}>
                      {template.category}
                    </span>
                    {template.recommended && (
                      <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                        ⭐ Recommended
                      </span>
                    )}
                  </div>
                </div>

                {/* Template Preview */}
                <div className="relative h-60 sm:h-80 bg-gray-50 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <div className="template-preview-content w-full h-full flex items-center justify-center" style={{ transform: 'scale(0.5)', transformOrigin: 'center' }}>
                      {generatePreview(template)}
                    </div>
                  </div>
                  {selectedTemplate === template.id && (
                    <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center z-10">
                      <div className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium">
                        Selected
                      </div>
                    </div>
                  )}
                </div>

                {/* Template Features */}
                {template.features && template.features.length > 0 && (
                  <div className="p-4 pt-0">
                    <div className="flex flex-wrap gap-1">
                      {template.features.slice(0, 2).map((feature, index) => (
                        <span
                          key={index}
                          className="inline-block px-2 py-1 bg-gray-100 text-gray-600 border border-gray-200 rounded-lg text-xs font-medium"
                        >
                          {feature}
                        </span>
                      ))}
                      {template.features.length > 2 && (
                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-500 border border-gray-200 rounded-lg text-xs font-medium">
                          +{template.features.length - 2} more
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