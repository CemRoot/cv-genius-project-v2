import { NextRequest, NextResponse } from 'next/server'
import { IrishCVTemplateManager } from '@/lib/irish-cv-template-manager'

// GET /api/templates - Get all available templates
export async function GET(request: NextRequest) {
  try {
    const templateManager = new IrishCVTemplateManager()
    const templates = templateManager.getAllTemplates()
    
    // Get category filter from query params
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    
    let filteredTemplates = templates
    if (category) {
      filteredTemplates = templateManager.getTemplatesByCategory(category)
    }
    
    // Map to simplified format for API response
    const templateData = filteredTemplates.map(template => ({
      id: template.id,
      name: template.name,
      description: template.description,
      thumbnailUrl: template.thumbnailUrl,
      isPremium: template.isPremium,
      popularity: template.popularity,
      categories: template.categories,
      structure: {
        layout: template.structure.layout,
        sections: template.structure.sections,
        colorScheme: template.structure.colorScheme
      }
    }))
    
    return NextResponse.json({
      success: true,
      templates: templateData,
      total: templateData.length
    })
    
  } catch (error) {
    console.error('Templates API Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch templates',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST /api/templates - Select a template for the current session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { templateId } = body
    
    if (!templateId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Template ID is required' 
        },
        { status: 400 }
      )
    }
    
    const templateManager = new IrishCVTemplateManager()
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
    
    // Get the selected template details
    const templates = templateManager.getAllTemplates()
    const selectedTemplate = templates.find(t => t.id === templateId)
    
    return NextResponse.json({
      success: true,
      message: 'Template selected successfully',
      template: {
        id: selectedTemplate!.id,
        name: selectedTemplate!.name,
        description: selectedTemplate!.description,
        structure: selectedTemplate!.structure
      }
    })
    
  } catch (error) {
    console.error('Template Selection Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to select template',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}