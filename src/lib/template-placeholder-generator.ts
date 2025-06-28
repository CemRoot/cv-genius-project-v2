/**
 * Generates placeholder images for templates when actual images are missing
 */

export class TemplatePlaceholderGenerator {
  private static instance: TemplatePlaceholderGenerator

  static getInstance(): TemplatePlaceholderGenerator {
    if (!this.instance) {
      this.instance = new TemplatePlaceholderGenerator()
    }
    return this.instance
  }

  /**
   * Generate a data URL for a template placeholder
   */
  generatePlaceholder(templateId: string): string {
    // Create a simple SVG placeholder
    const colors = this.getTemplateColors(templateId)
    
    const svg = `
      <svg width="210" height="297" xmlns="http://www.w3.org/2000/svg">
        <rect width="210" height="297" fill="${colors.background}"/>
        <rect x="10" y="10" width="190" height="40" fill="${colors.primary}" rx="4"/>
        <rect x="10" y="60" width="120" height="8" fill="${colors.secondary}" rx="2"/>
        <rect x="10" y="75" width="190" height="4" fill="${colors.secondary}" rx="1" opacity="0.5"/>
        <rect x="10" y="83" width="170" height="4" fill="${colors.secondary}" rx="1" opacity="0.5"/>
        <rect x="10" y="91" width="180" height="4" fill="${colors.secondary}" rx="1" opacity="0.5"/>
        
        <rect x="10" y="110" width="60" height="8" fill="${colors.primary}" rx="2"/>
        <rect x="10" y="125" width="190" height="3" fill="${colors.secondary}" rx="1" opacity="0.3"/>
        <rect x="10" y="131" width="180" height="3" fill="${colors.secondary}" rx="1" opacity="0.3"/>
        <rect x="10" y="137" width="170" height="3" fill="${colors.secondary}" rx="1" opacity="0.3"/>
        
        <rect x="10" y="155" width="70" height="8" fill="${colors.primary}" rx="2"/>
        <rect x="10" y="170" width="190" height="3" fill="${colors.secondary}" rx="1" opacity="0.3"/>
        <rect x="10" y="176" width="185" height="3" fill="${colors.secondary}" rx="1" opacity="0.3"/>
        
        <text x="105" y="35" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle">
          ${this.getTemplateName(templateId)}
        </text>
      </svg>
    `
    
    // Convert SVG to data URL
    const encoded = btoa(svg)
    return `data:image/svg+xml;base64,${encoded}`
  }

  private getTemplateColors(templateId: string): { background: string; primary: string; secondary: string } {
    const colorMap: Record<string, { background: string; primary: string; secondary: string }> = {
      'classic': { background: '#ffffff', primary: '#000000', secondary: '#666666' },
      'dublin-tech': { background: '#f3f4f6', primary: '#2563eb', secondary: '#1f2937' },
      'irish-finance': { background: '#ffffff', primary: '#166534', secondary: '#374151' },
      'dublin-pharma': { background: '#f0fdfa', primary: '#0d9488', secondary: '#134e4a' },
      'irish-graduate': { background: '#eef2ff', primary: '#4f46e5', secondary: '#6366f1' },
      'dublin-creative': { background: '#fdf4ff', primary: '#9333ea', secondary: '#a855f7' },
      'irish-healthcare': { background: '#ffffff', primary: '#1e40af', secondary: '#3b82f6' },
      'dublin-hospitality': { background: '#fff7ed', primary: '#ea580c', secondary: '#f97316' },
      'irish-construction': { background: '#ffffff', primary: '#ca8a04', secondary: '#eab308' },
      'dublin-startup': { background: '#fdf2f8', primary: '#db2777', secondary: '#ec4899' },
      'irish-executive': { background: '#f9fafb', primary: '#1f2937', secondary: '#4b5563' },
      'dublin-retail': { background: '#fef2f2', primary: '#dc2626', secondary: '#ef4444' },
      'irish-education': { background: '#ffffff', primary: '#059669', secondary: '#10b981' }
    }
    
    return colorMap[templateId] || { background: '#f3f4f6', primary: '#6b7280', secondary: '#9ca3af' }
  }

  private getTemplateName(templateId: string): string {
    const nameMap: Record<string, string> = {
      'classic': 'Classic',
      'dublin-tech': 'Tech Pro',
      'irish-finance': 'Finance',
      'dublin-pharma': 'Pharma',
      'irish-graduate': 'Graduate',
      'dublin-creative': 'Creative',
      'irish-healthcare': 'Healthcare',
      'dublin-hospitality': 'Hospitality',
      'irish-construction': 'Construction',
      'dublin-startup': 'Startup',
      'irish-executive': 'Executive',
      'dublin-retail': 'Retail',
      'irish-education': 'Education'
    }
    
    return nameMap[templateId] || 'Template'
  }

  /**
   * Check if template image exists, fallback to placeholder
   */
  async getTemplateImageUrl(templateId: string): Promise<string> {
    const imagePath = `/templates/${templateId}.png`
    
    try {
      // Check if image exists
      const response = await fetch(imagePath, { method: 'HEAD' })
      if (response.ok) {
        return imagePath
      }
    } catch (e) {
      // Image doesn't exist
    }
    
    // Return placeholder
    return this.generatePlaceholder(templateId)
  }
}

export const templatePlaceholderGenerator = TemplatePlaceholderGenerator.getInstance()