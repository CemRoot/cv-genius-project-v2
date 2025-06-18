import { NextRequest, NextResponse } from 'next/server';
import { dublinTemplateManager, createDublinTemplatePreview } from '@/lib/cover-letter-templates-new';

// GET - Tüm template'leri getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const recommended = searchParams.get('recommended');
    const search = searchParams.get('search');

    let templates = dublinTemplateManager.getAllTemplates();

    // Kategori filtresi
    if (category && category !== 'all') {
      templates = dublinTemplateManager.getTemplatesByCategory(category);
    }

    // Recommended filtresi
    if (recommended === 'true') {
      templates = templates.filter(t => t.recommended);
    }

    // Arama filtresi
    if (search) {
      templates = dublinTemplateManager.searchTemplates(search);
    }

    return NextResponse.json({
      success: true,
      templates,
      categories: dublinTemplateManager.getTemplateCategories(),
      total: templates.length
    });
  } catch (error) {
    console.error('Error fetching cover letter templates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

// POST - Template önizleme oluştur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { templateId, sampleData } = body;

    if (!templateId) {
      return NextResponse.json(
        { success: false, error: 'Template ID is required' },
        { status: 400 }
      );
    }

    const template = dublinTemplateManager.getTemplate(templateId);
    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    // Template önizleme HTML'i oluştur
    const previewHTML = createDublinTemplatePreview(templateId, sampleData);
    const templateCSS = dublinTemplateManager.generateCSS(templateId);

    return NextResponse.json({
      success: true,
      template,
      previewHTML,
      templateCSS
    });
  } catch (error) {
    console.error('Error generating template preview:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate preview' },
      { status: 500 }
    );
  }
}