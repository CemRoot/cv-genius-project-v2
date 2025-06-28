import { NextRequest, NextResponse } from 'next/server'
import { IrishCVTemplateManager } from '@/lib/irish-cv-template-manager'

// GET /api/templates/[id] - Get a specific template by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const templateManager = new IrishCVTemplateManager()
    const templates = templateManager.getAllTemplates()
    
    const template = templates.find(t => t.id === id)
    
    if (!template) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Template not found' 
        },
        { status: 404 }
      )
    }
    
    // Return full template details
    const templateData = {
      id: template.id,
      name: template.name,
      description: template.description,
      thumbnailUrl: template.thumbnailUrl,
      isPremium: template.isPremium,
      popularity: template.popularity,
      categories: template.categories,
      structure: template.structure,
      css: template.getCSS() // Include the CSS for preview
    }
    
    return NextResponse.json({
      success: true,
      template: templateData
    })
    
  } catch (error) {
    console.error('Template Fetch Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch template',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// PUT /api/templates/[id] - Update template (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check for admin authentication
    const adminId = request.headers.get('x-admin-id')
    const adminEmail = request.headers.get('x-admin-email')
    
    if (!adminId || !adminEmail) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Unauthorized access' 
        },
        { status: 401 }
      )
    }
    
    const { id } = await params
    const body = await request.json()
    
    // Template updates are not supported in the current implementation
    // Templates are defined in the template manager
    return NextResponse.json({
      success: true,
      message: `Template ${id} update would be implemented here`,
      updatedFields: Object.keys(body)
    })
    
  } catch (error) {
    console.error('Template Update Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update template',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}