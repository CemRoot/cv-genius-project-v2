import { IrishCVTemplateManager } from './irish-cv-template-manager'
import { CVData } from '@/types/cv'

export interface HealthCheckResult {
  passed: boolean
  templateId: string
  errors: string[]
  warnings: string[]
}

export interface TemplateHealthReport {
  totalTemplates: number
  passedTemplates: number
  failedTemplates: number
  overallHealth: 'healthy' | 'degraded' | 'failing'
  results: HealthCheckResult[]
  timestamp: string
}

class TemplateHealthChecker {
  private manager: IrishCVTemplateManager

  constructor() {
    this.manager = new IrishCVTemplateManager()
  }

  async checkTemplate(templateId: string): Promise<HealthCheckResult> {
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // Check if template exists
      const templates = this.manager.getAllTemplates()
      const template = templates.find(t => t.id === templateId)
      
      if (!template) {
        errors.push(`Template ${templateId} not found`)
        return { passed: false, templateId, errors, warnings }
      }

      // Try to select the template
      const selected = this.manager.selectTemplate(templateId)
      if (!selected) {
        errors.push(`Failed to select template ${templateId}`)
      }

      // Try to render with mock data
      const mockData = this.getMockCVData()
      try {
        const html = this.manager.renderCV(mockData)
        if (!html || html.length < 100) {
          errors.push('Template renders empty or minimal content')
        }
      } catch (renderError) {
        errors.push(`Render error: ${renderError instanceof Error ? renderError.message : 'Unknown error'}`)
      }

      // Try to get CSS
      try {
        const css = this.manager.getTemplateCSS()
        if (!css || css.length < 50) {
          warnings.push('Template CSS is missing or minimal')
        }
      } catch (cssError) {
        errors.push(`CSS error: ${cssError instanceof Error ? cssError.message : 'Unknown error'}`)
      }

      // Validate template structure
      if (!template.structure) {
        warnings.push('Template missing structure definition')
      }

    } catch (error) {
      errors.push(`Health check error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    return {
      passed: errors.length === 0,
      templateId,
      errors,
      warnings
    }
  }

  async checkAllTemplates(): Promise<TemplateHealthReport> {
    const results: HealthCheckResult[] = []
    const templates = this.manager.getAllTemplates()

    for (const template of templates) {
      const result = await this.checkTemplate(template.id)
      results.push(result)
    }

    const passedTemplates = results.filter(r => r.passed).length
    const failedTemplates = results.filter(r => !r.passed).length

    let overallHealth: 'healthy' | 'degraded' | 'failing'
    if (failedTemplates === 0) {
      overallHealth = 'healthy'
    } else if (failedTemplates < templates.length / 2) {
      overallHealth = 'degraded'
    } else {
      overallHealth = 'failing'
    }

    return {
      totalTemplates: templates.length,
      passedTemplates,
      failedTemplates,
      overallHealth,
      results,
      timestamp: new Date().toISOString()
    }
  }

  async generateReport(): Promise<string> {
    const report = await this.checkAllTemplates()
    
    let reportText = `Template Health Report
Generated: ${report.timestamp}
Overall Health: ${report.overallHealth.toUpperCase()}
Total Templates: ${report.totalTemplates}
Passed: ${report.passedTemplates}
Failed: ${report.failedTemplates}

Detailed Results:
`

    for (const result of report.results) {
      reportText += `
Template: ${result.templateId}
Status: ${result.passed ? 'PASSED' : 'FAILED'}
`
      if (result.errors.length > 0) {
        reportText += `Errors:\n${result.errors.map(e => `  - ${e}`).join('\n')}\n`
      }
      if (result.warnings.length > 0) {
        reportText += `Warnings:\n${result.warnings.map(w => `  - ${w}`).join('\n')}\n`
      }
    }

    return reportText
  }

  async autoRepair(): Promise<string[]> {
    const repairs: string[] = []

    try {
      // Clear template caches
      if (typeof window !== 'undefined' && 'caches' in window) {
        const cacheNames = await caches.keys()
        for (const cacheName of cacheNames) {
          if (cacheName.includes('template')) {
            await caches.delete(cacheName)
            repairs.push(`Cleared cache: ${cacheName}`)
          }
        }
      }

      // Re-initialize template manager
      this.manager = new IrishCVTemplateManager()
      repairs.push('Re-initialized template manager')

      // Clear session storage template data
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('selectedTemplate')
        repairs.push('Cleared session template data')
      }

    } catch (error) {
      // Silent error handling for production
    }

    return repairs
  }

  private getMockCVData(): CVData {
    return {
      id: 'test-cv',
      personal: {
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+353 1 234 5678',
        address: 'Dublin, Ireland',
        linkedin: 'linkedin.com/in/johndoe',
        github: 'github.com/johndoe',
        portfolio: 'johndoe.com',
        title: 'Senior Software Engineer',
        summary: 'Experienced software engineer with expertise in web development.'
      },
      sections: [],
      experience: [{
        id: '1',
        position: 'Senior Developer',
        company: 'Tech Corp',
        location: 'Dublin',
        startDate: '2020-01-01',
        endDate: '2023-12-31',
        current: false,
        description: 'Led development team',
        achievements: ['Improved performance by 50%']
      }],
      education: [{
        id: '1',
        degree: 'BSc',
        field: 'Computer Science',
        institution: 'Trinity College Dublin',
        location: 'Dublin',
        startDate: '2016-09-01',
        endDate: '2020-06-01',
        current: false,
        grade: 'First Class Honours'
      }],
      skills: [{
        id: '1',
        name: 'JavaScript',
        level: 'Expert',
        category: 'Technical'
      }],
      languages: [{
        id: '1',
        name: 'English',
        level: 'Native'
      }],
      projects: [],
      certifications: [],
      interests: [],
      references: [],
      template: 'classic',
      designSettings: {
        margins: 0.5,
        sectionSpacing: 'normal',
        headerSpacing: 'normal',
        fontFamily: 'Arial',
        fontSize: 11,
        lineHeight: 1.5
      },
      lastModified: new Date().toISOString(),
      version: 1
    }
  }
}

export const templateHealthChecker = new TemplateHealthChecker()

export async function checkTemplateHealth(): Promise<void> {
  if (process.env.NODE_ENV === 'development') {
    const report = await templateHealthChecker.generateReport()
    // Report generated for development use
  }
}