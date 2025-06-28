import { NextRequest, NextResponse } from 'next/server'
import { IrishCVTemplateManager } from '@/lib/irish-cv-template-manager'

// GET /api/templates/categories - Get all available template categories
export async function GET(request: NextRequest) {
  try {
    const templateManager = new IrishCVTemplateManager()
    const templates = templateManager.getAllTemplates()
    
    // Extract all unique categories
    const categoriesSet = new Set<string>()
    const categoryStats: { [key: string]: number } = {}
    
    templates.forEach(template => {
      template.categories.forEach(category => {
        categoriesSet.add(category)
        categoryStats[category] = (categoryStats[category] || 0) + 1
      })
    })
    
    // Convert to array with additional metadata
    const categories = Array.from(categoriesSet).map(category => ({
      id: category,
      name: category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' '),
      slug: category,
      count: categoryStats[category],
      description: getCategoryDescription(category)
    }))
    
    // Sort by count (popularity)
    categories.sort((a, b) => b.count - a.count)
    
    return NextResponse.json({
      success: true,
      categories,
      total: categories.length
    })
    
  } catch (error) {
    console.error('Categories API Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch categories',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

function getCategoryDescription(category: string): string {
  const descriptions: { [key: string]: string } = {
    'tech': 'Templates optimized for technology and IT professionals',
    'modern': 'Contemporary designs with clean, minimalist layouts',
    'dublin': 'Tailored for Dublin-based job market and companies',
    'finance': 'Professional templates for banking and financial services',
    'professional': 'Traditional, formal designs for corporate environments',
    'healthcare': 'Specialized for medical and healthcare professionals',
    'creative': 'Unique designs for creative and artistic professionals',
    'academic': 'Ideal for research, teaching, and academic positions',
    'graduate': 'Perfect for recent graduates and entry-level positions',
    'executive': 'Premium designs for senior management roles',
    'classic': 'Timeless, traditional CV formats',
    'ats-friendly': 'Optimized for Applicant Tracking Systems',
    'traditional': 'Conservative designs suitable for any industry',
    'cork': 'Optimized for Cork-based companies and industries',
    'galway': 'Designed for Galway\'s tech and medical sectors'
  }
  
  return descriptions[category] || `Templates for ${category} professionals`
}