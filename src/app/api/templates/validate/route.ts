import { NextRequest, NextResponse } from 'next/server'
import { IrishCVTemplateManager } from '@/lib/irish-cv-template-manager'
import { CVData } from '@/types/cv'

// POST /api/templates/validate - Validate CV data against a template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { templateId, data } = body
    
    if (!templateId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Template ID is required' 
        },
        { status: 400 }
      )
    }
    
    if (!data) {
      return NextResponse.json(
        { 
          success: false,
          error: 'CV data is required' 
        },
        { status: 400 }
      )
    }
    
    const templateManager = new IrishCVTemplateManager()
    
    // Select the template
    const success = templateManager.selectTemplate(templateId)
    if (!success) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Template not found' 
        },
        { status: 404 }
      )
    }
    
    // Validate the CV data
    const validationErrors = templateManager.validateCV(data as Partial<CVData>)
    
    // Get template info
    const templates = templateManager.getAllTemplates()
    const template = templates.find(t => t.id === templateId)
    
    // Categorize validation errors
    const errorsBySection: { [key: string]: string[] } = {}
    validationErrors.forEach(error => {
      // Try to determine which section the error relates to
      let section = 'general'
      if (error.toLowerCase().includes('skill')) section = 'skills'
      else if (error.toLowerCase().includes('github') || error.toLowerCase().includes('portfolio')) section = 'personal'
      else if (error.toLowerCase().includes('certification')) section = 'certifications'
      else if (error.toLowerCase().includes('experience')) section = 'experience'
      else if (error.toLowerCase().includes('education')) section = 'education'
      
      if (!errorsBySection[section]) {
        errorsBySection[section] = []
      }
      errorsBySection[section].push(error)
    })
    
    return NextResponse.json({
      success: true,
      template: {
        id: template!.id,
        name: template!.name,
        requirements: template!.structure.sections
      },
      validation: {
        isValid: validationErrors.length === 0,
        errors: validationErrors,
        errorsBySection,
        totalErrors: validationErrors.length
      }
    })
    
  } catch (error) {
    console.error('Template Validation Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to validate CV data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}