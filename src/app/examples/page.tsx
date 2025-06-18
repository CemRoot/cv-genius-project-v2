'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import Link from "next/link"
import { Eye, Download, ArrowRight, Users, Building2, Calendar, X } from "lucide-react"
import { EXAMPLE_CV_CATEGORIES, type ExampleCV, type ExampleCVCategory } from '@/data/example-cvs'
import { useCVStore } from '@/store/cv-store'
import { useRouter } from 'next/navigation'

export default function ExamplesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [previewCV, setPreviewCV] = useState<ExampleCV | null>(null)
  const { setCurrentCV } = useCVStore()
  const router = useRouter()

  const filteredExamples = selectedCategory === 'all' 
    ? EXAMPLE_CV_CATEGORIES.flatMap(cat => cat.examples)
    : EXAMPLE_CV_CATEGORIES.find(cat => cat.id === selectedCategory)?.examples || []

  const handleUseTemplate = (example: ExampleCV) => {
    // Create a complete CV data with all required fields
    const completeCV = {
      ...example.cvData,
      // Ensure all required fields exist
      languages: example.cvData.languages || [],
      interests: example.cvData.interests || [],
      references: example.cvData.references || [],
      projects: example.cvData.projects || [],
      certifications: example.cvData.certifications || [],
      designSettings: example.cvData.designSettings || {
        margins: 0.5,
        sectionSpacing: 'normal',
        headerSpacing: 'normal',
        fontFamily: 'Times New Roman',
        fontSize: 10,
        lineHeight: 1.2
      },
      // Ensure all sections exist in the sections array
      sections: [
        { id: '1', type: 'personal' as const, title: 'Personal Information', visible: true, order: 1 },
        { id: '2', type: 'summary' as const, title: 'Professional Summary', visible: true, order: 2 },
        { id: '3', type: 'experience' as const, title: 'Work Experience', visible: true, order: 3 },
        { id: '4', type: 'education' as const, title: 'Education', visible: true, order: 4 },
        { id: '5', type: 'skills' as const, title: 'Skills', visible: true, order: 5 },
        { id: '6', type: 'languages' as const, title: 'Languages', visible: false, order: 6 },
        { id: '7', type: 'projects' as const, title: 'Projects', visible: true, order: 7 },
        { id: '8', type: 'certifications' as const, title: 'Certifications', visible: true, order: 8 },
        { id: '9', type: 'interests' as const, title: 'Interests & Hobbies', visible: false, order: 9 },
        { id: '10', type: 'references' as const, title: 'References', visible: false, order: 10 },
      ]
    }
    
    // Load the complete CV data into the store
    setCurrentCV(completeCV)
    // Navigate to builder
    router.push('/builder')
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Entry Level': return 'bg-green-100 text-green-800'
      case 'Mid Level': return 'bg-blue-100 text-blue-800'
      case 'Senior Level': return 'bg-purple-100 text-purple-800'
      case 'Executive': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const CVPreviewModal = ({ cv }: { cv: ExampleCV }) => (
    <Dialog open={previewCV?.id === cv.id} onOpenChange={(open) => !open && setPreviewCV(null)}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{cv.name} - {cv.role}</span>
            <Badge className={getLevelColor(cv.level)}>{cv.level}</Badge>
          </DialogTitle>
          <DialogDescription>
            Preview the complete CV for {cv.name}, a {cv.level} professional in {cv.industry}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Personal Info */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>Name:</strong> {cv.cvData.personal.fullName}</div>
              <div><strong>Title:</strong> {cv.cvData.personal.title}</div>
              <div><strong>Email:</strong> {cv.cvData.personal.email}</div>
              <div><strong>Phone:</strong> {cv.cvData.personal.phone}</div>
              <div><strong>Location:</strong> {cv.cvData.personal.address}</div>
              {cv.cvData.personal.linkedin && (
                <div><strong>LinkedIn:</strong> <span className="text-blue-600">LinkedIn Profile</span></div>
              )}
            </div>
          </div>

          {/* Professional Summary */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Professional Summary</h3>
            <p className="text-sm text-gray-700">{cv.cvData.personal.summary}</p>
          </div>

          {/* Experience */}
          {cv.cvData.experience.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Work Experience</h3>
              <div className="space-y-3">
                {cv.cvData.experience.map((exp, index) => (
                  <div key={index} className="border-l-2 border-blue-200 pl-4">
                    <h4 className="font-medium">{exp.position}</h4>
                    <p className="text-sm text-gray-600">{exp.company} • {exp.location}</p>
                    <p className="text-sm text-gray-500">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</p>
                    <p className="text-sm mt-1">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {cv.cvData.education.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Education</h3>
              <div className="space-y-2">
                {cv.cvData.education.map((edu, index) => (
                  <div key={index}>
                    <h4 className="font-medium">{edu.degree}</h4>
                    <p className="text-sm text-gray-600">{edu.institution} • {edu.location}</p>
                    <p className="text-sm text-gray-500">{edu.startDate} - {edu.endDate} • {edu.grade}</p>
                    {edu.description && <p className="text-sm mt-1">{edu.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {cv.cvData.skills.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Skills</h3>
              <div className="grid grid-cols-2 gap-2">
                {cv.cvData.skills.map((skill, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-sm">{skill.name}</span>
                    <span className="text-sm text-gray-500">{skill.level}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button 
              onClick={() => {
                handleUseTemplate(cv)
                setPreviewCV(null)
              }}
              className="flex-1"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Use This Template
            </Button>
            <Button variant="outline" onClick={() => setPreviewCV(null)}>
              Close Preview
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Professional CV Examples</h1>
        <p className="text-xl text-muted-foreground mb-6 max-w-3xl mx-auto">
          Browse real CV examples from Ireland's top professionals across various industries. 
          Each template is crafted based on successful job applications in the Irish market.
        </p>
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{EXAMPLE_CV_CATEGORIES.reduce((total, cat) => total + cat.examples.length, 0)} Professional Examples</span>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span>{EXAMPLE_CV_CATEGORIES.length} Industries Covered</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Updated for 2024 Market</span>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Filter by Industry</h2>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            All Industries ({EXAMPLE_CV_CATEGORIES.reduce((total, cat) => total + cat.examples.length, 0)})
          </Button>
          {EXAMPLE_CV_CATEGORIES.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.icon} {category.title} ({category.examples.length})
            </Button>
          ))}
        </div>
      </div>

      {/* Category Description */}
      {selectedCategory !== 'all' && (
        <div className="mb-8 p-4 bg-muted/30 rounded-lg">
          {(() => {
            const category = EXAMPLE_CV_CATEGORIES.find(cat => cat.id === selectedCategory)
            return category ? (
              <div>
                <h3 className="font-semibold text-lg mb-2">{category.icon} {category.title}</h3>
                <p className="text-muted-foreground">{category.description}</p>
              </div>
            ) : null
          })()}
        </div>
      )}

      {/* Examples Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {filteredExamples.map((example) => (
          <Card key={example.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{example.name}</CardTitle>
                  <CardDescription className="text-base font-medium text-primary">
                    {example.role}
                  </CardDescription>
                </div>
                <Badge className={getLevelColor(example.level)}>
                  {example.level}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span>{example.industry}</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {example.description}
              </p>
              
              {/* CV Stats */}
              <div className="mb-4 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-medium">Experience:</span>
                  <div className="text-muted-foreground">
                    {example.cvData.experience.length} positions
                  </div>
                </div>
                <div>
                  <span className="font-medium">Skills:</span>
                  <div className="text-muted-foreground">
                    {example.cvData.skills.length} listed
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleUseTemplate(example)}
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Use Template
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setPreviewCV(example)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Why These Examples Work */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 mb-8">
        <h2 className="text-2xl font-bold mb-4">Why These CV Examples Work in Ireland</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold mb-2">🎯 ATS-Optimized</h3>
            <p className="text-sm text-muted-foreground">
              Formatted to pass through Irish companies' Applicant Tracking Systems with proper keyword usage.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">🇮🇪 Local Market Focus</h3>
            <p className="text-sm text-muted-foreground">
              Written specifically for the Irish job market with appropriate terminology and cultural references.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">✅ GDPR Compliant</h3>
            <p className="text-sm text-muted-foreground">
              Following Irish data protection guidelines with no photos and appropriate personal information.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">📊 Data-Driven</h3>
            <p className="text-sm text-muted-foreground">
              Based on successful applications to top Irish companies across all sectors.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">🎓 Education Format</h3>
            <p className="text-sm text-muted-foreground">
              Proper formatting of Irish qualifications including Leaving Cert, QQI levels, and university degrees.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">💼 Industry Standards</h3>
            <p className="text-sm text-muted-foreground">
              Meets the expectations of hiring managers in Ireland's key employment sectors.
            </p>
          </div>
        </div>
      </div>


      {/* CV Preview Modal */}
      {previewCV && <CVPreviewModal cv={previewCV} />}
    </div>
  )
}