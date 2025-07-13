"use client"

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'

interface ATSChecklistProps {
  cvData?: any
  showGuidelines?: boolean
}

export function ATSChecklist({ cvData, showGuidelines = true }: ATSChecklistProps) {
  const checklistItems = [
    {
      category: "Essential Information",
      items: [
        {
          id: "full-name",
          label: "Full name clearly visible at top",
          description: "Name should be the largest text on the page",
          importance: "critical",
          tip: "Use 16-18pt font size for your name"
        },
        {
          id: "contact-info",
          label: "Complete contact information",
          description: "Email, phone, location (Dublin, Ireland)",
          importance: "critical",
          tip: "Use Irish phone format: +353 xx xxx xxxx"
        },
        {
          id: "professional-email",
          label: "Professional email address",
          description: "firstname.lastname@domain.com format preferred",
          importance: "high",
          tip: "Avoid numbers or nicknames in email"
        }
      ]
    },
    {
      category: "Document Structure",
      items: [
        {
          id: "standard-sections",
          label: "Standard section headings",
          description: "Use: Work Experience, Education, Skills, etc.",
          importance: "critical",
          tip: "Avoid creative headings like 'My Journey'"
        },
        {
          id: "chronological-order",
          label: "Reverse chronological order",
          description: "Most recent experience/education first",
          importance: "high",
          tip: "This is the most ATS-friendly format"
        },
        {
          id: "clear-dates",
          label: "Consistent date formatting",
          description: "Use MM/YYYY format throughout",
          importance: "medium",
          tip: "Example: 01/2023 - 12/2023 or Present"
        }
      ]
    },
    {
      category: "Content Optimization",
      items: [
        {
          id: "professional-summary",
          label: "Professional summary included",
          description: "50-150 words highlighting key qualifications",
          importance: "high",
          tip: "Include 2-3 relevant keywords naturally"
        },
        {
          id: "relevant-keywords",
          label: "Job-relevant keywords",
          description: "Keywords from job description included naturally",
          importance: "critical",
          tip: "Match 60-80% of job requirements you have"
        },
        {
          id: "quantified-achievements",
          label: "Quantified achievements",
          description: "Numbers, percentages, or specific results",
          importance: "high",
          tip: "Example: 'Increased sales by 25%' vs 'Increased sales'"
        },
        {
          id: "skills-section",
          label: "Dedicated skills section",
          description: "6-15 relevant skills listed clearly",
          importance: "high",
          tip: "Include both technical and soft skills"
        }
      ]
    },
    {
      category: "Formatting & Design",
      items: [
        {
          id: "simple-formatting",
          label: "Simple, clean formatting",
          description: "No tables, columns, or graphics",
          importance: "critical",
          tip: "Single column layout works best"
        },
        {
          id: "ats-safe-fonts",
          label: "ATS-safe fonts",
          description: "Arial, Helvetica, Times New Roman, or Calibri",
          importance: "medium",
          tip: "Avoid decorative or custom fonts"
        },
        {
          id: "appropriate-length",
          label: "Appropriate length",
          description: "1-2 pages maximum",
          importance: "medium",
          tip: "1 page for <5 years experience, 2 pages for senior roles"
        },
        {
          id: "standard-file-format",
          label: "Standard file format",
          description: "PDF or Word document (.docx)",
          importance: "high",
          tip: "PDF preferred unless job posting specifies Word"
        }
      ]
    },
    {
      category: "Irish Market Specific",
      items: [
        {
          id: "work-authorization",
          label: "Work authorization status",
          description: "EU Citizen, Stamp 4, Work Permit, etc.",
          importance: "high",
          tip: "Critical for Irish employers - be specific"
        },
        {
          id: "irish-location",
          label: "Irish location mentioned",
          description: "Dublin, Ireland or specific area",
          importance: "medium",
          tip: "Shows you're locally based or willing to relocate"
        },
        {
          id: "irish-phone-format",
          label: "Irish phone number format",
          description: "+353 format preferred",
          importance: "low",
          tip: "Helps establish local presence"
        }
      ]
    }
  ]

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getImportanceIcon = (importance: string) => {
    switch (importance) {
      case 'critical': return <XCircle className="h-4 w-4 text-red-600" />
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case 'medium': return <Info className="h-4 w-4 text-yellow-600" />
      case 'low': return <CheckCircle className="h-4 w-4 text-blue-600" />
      default: return <Info className="h-4 w-4 text-gray-600" />
    }
  }

  if (!showGuidelines) {
    return null
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">ATS Optimization Checklist</CardTitle>
        <p className="text-sm text-gray-600">
          Ensure your CV meets ATS requirements for Irish job applications
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {checklistItems.map((category, categoryIndex) => (
          <div key={categoryIndex}>
            <h3 className="font-semibold text-gray-900 mb-3">{category.category}</h3>
            <div className="space-y-3">
              {category.items.map((item, itemIndex) => (
                <div key={itemIndex} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start space-x-2">
                      {getImportanceIcon(item.importance)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">{item.label}</span>
                          <Badge className={`text-xs ${getImportanceColor(item.importance)}`}>
                            {item.importance.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded p-2 mt-2">
                    <p className="text-xs text-blue-800">
                      <strong>💡 Tip:</strong> {item.tip}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Quick Reference */}
        <div className="border-t pt-6">
          <h3 className="font-semibold text-gray-900 mb-3">Quick ATS Tips</h3>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <ul className="text-sm text-green-800 space-y-2">
              <li>• <strong>Keywords:</strong> Use exact phrases from job descriptions</li>
              <li>• <strong>Format:</strong> Simple single-column layout only</li>
              <li>• <strong>Fonts:</strong> Stick to Arial, Helvetica, or Times New Roman</li>
              <li>• <strong>Files:</strong> Save as PDF unless employer requests Word</li>
              <li>• <strong>Length:</strong> 1-2 pages maximum</li>
              <li>• <strong>Contact:</strong> Include phone, email, and Dublin location</li>
            </ul>
          </div>
        </div>

        {/* Common ATS Mistakes */}
        <div className="border-t pt-6">
          <h3 className="font-semibold text-gray-900 mb-3">⚠️ Common ATS Mistakes to Avoid</h3>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <ul className="text-sm text-red-800 space-y-2">
              <li>• Using tables, text boxes, or multiple columns</li>
              <li>• Creative section headers like "My Story" or "What I Bring"</li>
              <li>• Images, logos, or graphics anywhere on the CV</li>
              <li>• Headers and footers with important information</li>
              <li>• Fancy fonts or excessive formatting</li>
              <li>• Missing or inconsistent contact information</li>
              <li>• No keywords matching the job requirements</li>
              <li>• Saving as an image file (JPG, PNG) instead of text</li>
            </ul>
          </div>
        </div>

        {/* Dublin Job Market Specific */}
        <div className="border-t pt-6">
          <h3 className="font-semibold text-gray-900 mb-3">🇮🇪 Dublin Job Market Specifics</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• <strong>Work Authorization:</strong> Clearly state "EU Citizen", "Stamp 4", etc.</li>
              <li>• <strong>Location:</strong> Mention "Dublin" or specific area (Dublin 2, IFSC, etc.)</li>
              <li>• <strong>Education:</strong> Include Irish qualifications (Trinity, UCD, etc.) prominently</li>
              <li>• <strong>Experience:</strong> Highlight any Irish/European company experience</li>
              <li>• <strong>Languages:</strong> English proficiency level if not native speaker</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 