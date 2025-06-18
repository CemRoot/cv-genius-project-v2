import { NextRequest, NextResponse } from 'next/server';
import { dublinTemplateManager, createDublinTemplatePreview } from '@/lib/cover-letter-templates-new';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET - Specific template'i getir
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const template = dublinTemplateManager.getTemplate(id);

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    // Query parametrelerinden sample data alabilir
    const { searchParams } = new URL(request.url);
    const includePreview = searchParams.get('preview') === 'true';
    const includeCSS = searchParams.get('css') === 'true';

    const response: {
      success: boolean;
      template: unknown;
      previewHTML?: string;
      templateCSS?: string;
    } = {
      success: true,
      template
    };

    if (includePreview) {
      response.previewHTML = createDublinTemplatePreview(id);
    }

    if (includeCSS) {
      response.templateCSS = dublinTemplateManager.generateCSS(id);
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error(`Error fetching template ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}

// POST - Template ile cover letter generate et
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const body = await request.json();
    const { userData, options = {} } = body;

    const template = dublinTemplateManager.getTemplate(id);
    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    if (!userData) {
      return NextResponse.json(
        { success: false, error: 'User data is required' },
        { status: 400 }
      );
    }

    // Cover letter HTML generate et
    const coverLetterHTML = dublinTemplateManager.generateHTML(id, userData);
    const templateCSS = dublinTemplateManager.generateCSS(id);

    // Template özelliklerini kullanarak styled HTML oluştur
    const fullHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cover Letter - ${userData.name}</title>
        <style>
          ${templateCSS}
          
          /* Base print styles */
          @media print {
            body { margin: 0; }
            .cover-letter-wrapper { 
              page-break-inside: avoid;
              width: 8.5in;
              height: 11in;
            }
          }
          
          /* Responsive styles */
          @media (max-width: 768px) {
            .cover-letter-wrapper {
              padding: 20px !important;
              font-size: 14px !important;
            }
            
            .sidebar {
              width: 100% !important;
              display: block !important;
            }
            
            .main-content {
              display: block !important;
              width: 100% !important;
            }
          }
        </style>
      </head>
      <body>
        ${coverLetterHTML}
      </body>
      </html>
    `;

    return NextResponse.json({
      success: true,
      template,
      html: coverLetterHTML,
      fullHTML,
      css: templateCSS,
      options: {
        ...options,
        templateId: id,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error(`Error generating cover letter with template ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate cover letter' },
      { status: 500 }
    );
  }
}