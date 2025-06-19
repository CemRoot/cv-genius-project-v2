'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"
import { EXAMPLE_CV_CATEGORIES, type ExampleCV } from '@/data/example-cvs'
import { useCVStore } from '@/store/cv-store'
import { useRouter } from 'next/navigation'
import { MainLayout } from "@/components/layout/main-layout"

export default function ExamplesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedCV, setSelectedCV] = useState<ExampleCV | null>(null)
  const { setCurrentCV } = useCVStore()
  const router = useRouter()

  const filteredExamples = selectedCategory === 'all' 
    ? EXAMPLE_CV_CATEGORIES.flatMap(cat => cat.examples)
    : EXAMPLE_CV_CATEGORIES.find(cat => cat.id === selectedCategory)?.examples || []

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedCV) {
        setSelectedCV(null)
      }
    }
    
    if (selectedCV) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden' // Prevent background scroll
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [selectedCV])

  const handleUseTemplate = (example: ExampleCV) => {
    const completeCV = {
      ...example.cvData,
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
    
    setCurrentCV(completeCV)
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

  // PDF Modal Component
  const PDFModal = ({ cv, onClose }: { cv: ExampleCV; onClose: () => void }) => (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">{cv.name} - {cv.role}</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        
        {/* PDF Content */}
        <div className="overflow-auto max-h-[calc(90vh-80px)] bg-gray-100 p-6">
          <div 
            className="bg-white shadow-lg mx-auto"
            style={{ 
              width: '210mm',
              minHeight: '297mm',
              padding: '40px',
              fontFamily: 'Arial, sans-serif',
              fontSize: '12px',
              lineHeight: '1.4'
            }}
          >
            {/* Full CV Content */}
            {/* CV Header */}
            <div className="border-b-2 border-blue-600 pb-4 mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {cv.cvData.personal.fullName}
              </h1>
              <div className="text-sm text-gray-600">
                {cv.cvData.personal.address} • {cv.cvData.personal.phone} • {cv.cvData.personal.email}
                {cv.cvData.personal.linkedin && ` • ${cv.cvData.personal.linkedin}`}
              </div>
            </div>

            {/* Professional Summary */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-300 pb-1">
                PROFESSIONAL SUMMARY
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed">
                {cv.cvData.personal.summary || `Experienced ${cv.role.toLowerCase()} with proven track record in ${cv.industry.toLowerCase()}. Demonstrated expertise in key areas with strong analytical and communication skills. Committed to delivering excellence and driving business growth through innovative solutions and collaborative teamwork.`}
              </p>
            </div>

            {/* Professional Experience */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-300 pb-1">
                PROFESSIONAL EXPERIENCE
              </h2>
              {cv.cvData.experience.map((exp, index) => (
                <div key={index} className="mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">{exp.position}</h3>
                      <span className="text-sm text-gray-600">{exp.company}, {exp.location}</span>
                    </div>
                    <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
                      {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 leading-relaxed pl-4">
                    {exp.description ? (
                      <p>{exp.description}</p>
                    ) : (
                      <ul className="list-disc list-inside space-y-1">
                        <li>Led key initiatives and projects resulting in measurable business improvements</li>
                        <li>Collaborated with cross-functional teams to deliver strategic objectives</li>
                        <li>Implemented best practices and process improvements increasing efficiency</li>
                        <li>Managed stakeholder relationships and ensured project delivery within budget and timeline</li>
                        <li>Mentored junior team members and contributed to knowledge sharing initiatives</li>
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Education */}
            {cv.cvData.education.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-300 pb-1">
                  EDUCATION
                </h2>
                {cv.cvData.education.map((edu, index) => (
                  <div key={index} className="mb-3">
                    <h3 className="text-base font-semibold text-gray-900">{edu.degree}</h3>
                    <div className="text-sm text-gray-600">
                      {edu.institution}, {edu.location} • {edu.startDate} - {edu.endDate}
                      {edu.grade && ` • ${edu.grade}`}
                    </div>
                    {edu.description && (
                      <p className="text-sm text-gray-700 mt-1">{edu.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Skills */}
            {cv.cvData.skills.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-300 pb-1">
                  KEY SKILLS
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">Technical Skills</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {cv.cvData.skills.slice(0, Math.ceil(cv.cvData.skills.length/2)).map((skill, index) => (
                        <li key={index}>• {skill.name}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">Professional Skills</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {cv.cvData.skills.slice(Math.ceil(cv.cvData.skills.length/2)).map((skill, index) => (
                        <li key={index}>• {skill.name}</li>
                      ))}
                      {cv.cvData.skills.length <= 6 && (
                        <>
                          <li>• Team Leadership</li>
                          <li>• Project Management</li>
                          <li>• Strategic Planning</li>
                          <li>• Communication</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Projects */}
            {cv.cvData.projects && cv.cvData.projects.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-300 pb-1">
                  KEY PROJECTS
                </h2>
                {cv.cvData.projects.map((project, index) => (
                  <div key={index} className="mb-3">
                    <h3 className="text-base font-semibold text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-700">{project.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Certifications */}
            {cv.cvData.certifications && cv.cvData.certifications.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-300 pb-1">
                  CERTIFICATIONS
                </h2>
                <ul className="text-sm text-gray-700 space-y-1">
                  {cv.cvData.certifications.map((cert, index) => (
                    <li key={index}>• {cert.name} - {cert.issuer} ({cert.issueDate})</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Additional Information */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-300 pb-1">
                ADDITIONAL INFORMATION
              </h2>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Full clean driving licence</li>
                <li>• Available for immediate start</li>
                <li>• Strong references available upon request</li>
                {cv.cvData.languages && cv.cvData.languages.length > 0 && (
                  <li>• Languages: {cv.cvData.languages.map(lang => `${lang.name} (${lang.level})`).join(', ')}</li>
                )}
              </ul>
            </div>

            {/* References Note */}
            <div className="mt-8 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center italic">
                References available upon request including current manager
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // PDF Preview Component - A4 PDF Document
  const PDFPreview = ({ cv }: { cv: ExampleCV }) => (
    <div className="relative h-[450px] bg-gray-200 overflow-hidden rounded-t-lg p-4">
      {/* A4 PDF Document */}
      <div 
        className="w-full bg-white shadow-lg mx-auto"
        style={{ 
          height: '410px',
          aspectRatio: '210/297', // A4 ratio
          padding: '20px',
          fontFamily: 'Arial, sans-serif',
          fontSize: '7px',
          lineHeight: '1.1',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          border: '1px solid #e0e0e0'
        }}
      >
        {/* CV Header */}
        <div className="border-b-2 border-blue-600 pb-4 mb-6">
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            {cv.cvData.personal.fullName}
          </h1>
          <div className="text-xs text-gray-600">
            {cv.cvData.personal.address} • {cv.cvData.personal.phone} • {cv.cvData.personal.email}
            {cv.cvData.personal.linkedin && ` • ${cv.cvData.personal.linkedin}`}
          </div>
        </div>

        {/* Professional Summary */}
        <div className="mb-4">
          <h2 className="text-sm font-bold text-gray-900 mb-2 border-b border-gray-300 pb-1">
            PROFESSIONAL SUMMARY
          </h2>
          <p className="text-xs text-gray-700 leading-relaxed">
            {cv.cvData.personal.summary || `Experienced ${cv.role.toLowerCase()} with proven track record in ${cv.industry.toLowerCase()}. Demonstrated expertise in key areas with strong analytical and communication skills. Committed to delivering excellence and driving business growth through innovative solutions.`}
          </p>
        </div>

        {/* Professional Experience */}
        <div className="mb-4">
          <h2 className="text-sm font-bold text-gray-900 mb-2 border-b border-gray-300 pb-1">
            PROFESSIONAL EXPERIENCE
          </h2>
          {cv.cvData.experience.slice(0, 3).map((exp, index) => (
            <div key={index} className="mb-3">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <h3 className="text-xs font-semibold text-gray-900">{exp.position}</h3>
                  <span className="text-xs text-gray-600">{exp.company}, {exp.location}</span>
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                  {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                </span>
              </div>
              <div className="text-xs text-gray-700 leading-relaxed pl-2">
                {exp.description ? (
                  <p>{exp.description.length > 120 ? exp.description.substring(0, 120) + '...' : exp.description}</p>
                ) : (
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>Led key initiatives and projects resulting in measurable business improvements</li>
                    <li>Collaborated with cross-functional teams to deliver strategic objectives</li>
                    <li>Implemented best practices and process improvements increasing efficiency</li>
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Education */}
        {cv.cvData.education.length > 0 && (
          <div className="mb-4">
            <h2 className="text-sm font-bold text-gray-900 mb-2 border-b border-gray-300 pb-1">
              EDUCATION
            </h2>
            {cv.cvData.education.slice(0, 2).map((edu, index) => (
              <div key={index} className="mb-2">
                <h3 className="text-xs font-semibold text-gray-900">{edu.degree}</h3>
                <div className="text-xs text-gray-600">
                  {edu.institution}, {edu.location} • {edu.startDate} - {edu.endDate}
                  {edu.grade && ` • ${edu.grade}`}
                </div>
                {edu.description && (
                  <p className="text-xs text-gray-700 mt-1">{edu.description}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {cv.cvData.skills.length > 0 && (
          <div className="mb-4">
            <h2 className="text-sm font-bold text-gray-900 mb-2 border-b border-gray-300 pb-1">
              KEY SKILLS
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-semibold text-gray-800 mb-1">Technical Skills</h4>
                <ul className="text-xs text-gray-700 space-y-0.5">
                  {cv.cvData.skills.slice(0, 5).map((skill, index) => (
                    <li key={index}>• {skill.name}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-gray-800 mb-1">Professional Skills</h4>
                <ul className="text-xs text-gray-700 space-y-0.5">
                  {cv.cvData.skills.slice(5, 10).map((skill, index) => (
                    <li key={index}>• {skill.name}</li>
                  ))}
                  {cv.cvData.skills.length <= 5 && (
                    <>
                      <li>• Team Leadership</li>
                      <li>• Project Management</li>
                      <li>• Strategic Planning</li>
                      <li>• Communication</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Projects */}
        {cv.cvData.projects && cv.cvData.projects.length > 0 && (
          <div className="mb-4">
            <h2 className="text-sm font-bold text-gray-900 mb-2 border-b border-gray-300 pb-1">
              KEY PROJECTS
            </h2>
            {cv.cvData.projects.slice(0, 2).map((project, index) => (
              <div key={index} className="mb-2">
                <h3 className="text-xs font-semibold text-gray-900">{project.name}</h3>
                <p className="text-xs text-gray-700">{project.description.length > 100 ? project.description.substring(0, 100) + '...' : project.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {cv.cvData.certifications && cv.cvData.certifications.length > 0 && (
          <div className="mb-4">
            <h2 className="text-sm font-bold text-gray-900 mb-2 border-b border-gray-300 pb-1">
              CERTIFICATIONS
            </h2>
            <ul className="text-xs text-gray-700 space-y-0.5">
              {cv.cvData.certifications.slice(0, 4).map((cert, index) => (
                <li key={index}>• {cert.name} - {cert.issuer} ({cert.issueDate})</li>
              ))}
            </ul>
          </div>
        )}

        {/* Additional Information */}
        <div className="mb-4">
          <h2 className="text-sm font-bold text-gray-900 mb-2 border-b border-gray-300 pb-1">
            ADDITIONAL INFORMATION
          </h2>
          <ul className="text-xs text-gray-700 space-y-0.5">
            <li>• Full clean driving licence</li>
            <li>• Available for immediate start</li>
            <li>• Strong references available upon request</li>
            {cv.cvData.languages && cv.cvData.languages.length > 0 && (
              <li>• Languages: {cv.cvData.languages.map(lang => `${lang.name} (${lang.level})`).join(', ')}</li>
            )}
          </ul>
        </div>

        {/* References Note */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-600 text-center italic">
            References available upon request including current manager
          </p>
        </div>
      </div>

      {/* Hover Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
        onClick={() => setSelectedCV(cv)}
      >
        <div className="bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold flex items-center gap-2 transform hover:scale-105 transition-transform">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
          </svg>
          View Full CV
        </div>
      </div>
    </div>
  )

  return (
    <MainLayout>
      {/* PDF Modal */}
      {selectedCV && (
        <PDFModal cv={selectedCV} onClose={() => setSelectedCV(null)} />
      )}
      
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="bg-white py-16 shadow-sm">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-4 text-gray-900">Professional CV Examples</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Browse real CV examples from Ireland's top professionals across various industries. 
              Each template is crafted based on successful job applications in the Irish market.
            </p>
            
            {/* Stats */}
            <div className="flex items-center justify-center gap-10 mt-8 flex-wrap">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {EXAMPLE_CV_CATEGORIES.reduce((total, cat) => total + cat.examples.length, 0)}
                </div>
                <div className="text-sm text-gray-600">Professional Examples</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{EXAMPLE_CV_CATEGORIES.length}</div>
                <div className="text-sm text-gray-600">Industries Covered</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">2024</div>
                <div className="text-sm text-gray-600">Updated for Market</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white border-t border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-4 py-5">
            <h3 className="text-base font-semibold mb-4 text-gray-800">Filter by Industry</h3>
            <div className="flex flex-wrap gap-3">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
                className="rounded-full"
              >
                All Industries ({EXAMPLE_CV_CATEGORIES.reduce((total, cat) => total + cat.examples.length, 0)})
              </Button>
              {EXAMPLE_CV_CATEGORIES.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="rounded-full"
                >
                  {category.icon} {category.title} ({category.examples.length})
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* CV Grid */}
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredExamples.map((example) => (
              <Card key={example.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer bg-white">
                {/* PDF Preview */}
                <PDFPreview cv={example} />
                
                {/* Card Info */}
                <CardContent className="p-6">
                  <div className="mb-5">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{example.name}</h3>
                    <p className="text-base text-gray-600 mb-3">{example.role}</p>
                    <div className="flex gap-2 flex-wrap">
                      <Badge className={getLevelColor(example.level)}>
                        {example.level}
                      </Badge>
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        {example.industry}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-5 leading-relaxed">
                    {example.description}
                  </p>
                  
                  {/* Stats */}
                  <div className="flex gap-6 mb-5">
                    <div>
                      <div className="text-base font-bold text-gray-900">
                        {example.cvData.experience.length} positions
                      </div>
                      <div className="text-xs text-gray-500">Experience</div>
                    </div>
                    <div>
                      <div className="text-base font-bold text-gray-900">
                        {example.cvData.skills.length} listed
                      </div>
                      <div className="text-xs text-gray-500">Skills</div>
                    </div>
                  </div>
                  
                  {/* Use Template Button */}
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation()
                      handleUseTemplate(example)
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                  >
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Why These Examples Work */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">Why These CV Examples Work in Ireland</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl mb-4">🎯</div>
                <h3 className="font-semibold mb-3 text-gray-900">ATS-Optimized</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Formatted to pass through Irish companies' Applicant Tracking Systems with proper keyword usage.
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-4">🇮🇪</div>
                <h3 className="font-semibold mb-3 text-gray-900">Local Market Focus</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Written specifically for the Irish job market with appropriate terminology and cultural references.
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-4">✅</div>
                <h3 className="font-semibold mb-3 text-gray-900">GDPR Compliant</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Following Irish data protection guidelines with no photos and appropriate personal information.
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-4">📊</div>
                <h3 className="font-semibold mb-3 text-gray-900">Data-Driven</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Based on successful applications to top Irish companies across all sectors.
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-4">🎓</div>
                <h3 className="font-semibold mb-3 text-gray-900">Education Format</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Proper formatting of Irish qualifications including Leaving Cert, QQI levels, and university degrees.
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-4">💼</div>
                <h3 className="font-semibold mb-3 text-gray-900">Industry Standards</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Meets the expectations of hiring managers in Ireland's key employment sectors.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
} 