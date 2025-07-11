import React from 'react'
import { CvTemplate } from '@/lib/cv-templates/templates-data'

interface TemplatePreviewProps {
  template: CvTemplate
  className?: string
}

export function TemplatePreview({ template, className = '' }: TemplatePreviewProps) {
  const { defaultData, styling } = template
  const { personalInfo, sections = [] } = defaultData

  const summarySection = sections.find(s => s.type === 'summary')
  const experienceSection = sections.find(s => s.type === 'experience')
  const educationSection = sections.find(s => s.type === 'education')
  const skillsSection = sections.find(s => s.type === 'skills')

  return (
    <div className={`bg-white text-black p-6 ${className}`} style={{ fontFamily: styling.fontFamily }}>
      {/* Header */}
      <div className={`mb-4 ${styling.headerStyle === 'bold' ? 'border-b-4' : 'border-b'}`} 
           style={{ borderColor: styling.primaryColor }}>
        <h1 className={`font-bold ${styling.headerStyle === 'bold' ? 'text-2xl' : 'text-xl'}`}
            style={{ color: styling.primaryColor }}>
          {personalInfo?.firstName} {personalInfo?.lastName}
        </h1>
        <p className="text-sm mt-1" style={{ color: styling.secondaryColor }}>
          {personalInfo?.title}
        </p>
        <div className="text-xs mt-2 space-y-0.5 pb-2">
          <p>{personalInfo?.email} | {personalInfo?.phone}</p>
          <p>{personalInfo?.address}</p>
        </div>
      </div>

      {/* Layout based on template style */}
      <div className={styling.layout === 'two-column' ? 'grid grid-cols-3 gap-4' : 'space-y-3'}>
        {/* Main content */}
        <div className={styling.layout === 'two-column' ? 'col-span-2 space-y-3' : ''}>
          {/* Summary */}
          {summarySection && summarySection.visible && (
            <div>
              <h2 className="text-sm font-semibold mb-1" style={{ color: styling.primaryColor }}>
                {summarySection.title}
              </h2>
              <p className="text-xs leading-relaxed">
                {typeof summarySection.content === 'string' ? 
                  summarySection.content.substring(0, 150) + '...' : ''}
              </p>
            </div>
          )}

          {/* Experience */}
          {experienceSection && experienceSection.visible && 'items' in experienceSection && (
            <div>
              <h2 className="text-sm font-semibold mb-1" style={{ color: styling.primaryColor }}>
                {experienceSection.title}
              </h2>
              {experienceSection.items?.slice(0, 1).map((exp: any, idx: number) => (
                <div key={idx} className="text-xs">
                  <div className="font-medium">{exp.role}</div>
                  <div className="text-gray-600">{exp.company} | {exp.location}</div>
                  <ul className="mt-1 space-y-0.5">
                    {exp.bullets?.slice(0, 2).map((bullet: string, bIdx: number) => (
                      <li key={bIdx} className="text-xs">• {bullet.substring(0, 60)}...</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar for two-column layout */}
        {styling.layout === 'two-column' && (
          <div className="space-y-3">
            {/* Skills */}
            {skillsSection && skillsSection.visible && 'items' in skillsSection && (
              <div>
                <h2 className="text-sm font-semibold mb-1" style={{ color: styling.primaryColor }}>
                  {skillsSection.title}
                </h2>
                <div className="flex flex-wrap gap-1">
                  {skillsSection.items?.slice(0, 4).map((skill: string, idx: number) => (
                    <span key={idx} className="text-xs px-1.5 py-0.5 bg-gray-100 rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {educationSection && educationSection.visible && 'items' in educationSection && (
              <div>
                <h2 className="text-sm font-semibold mb-1" style={{ color: styling.primaryColor }}>
                  {educationSection.title}
                </h2>
                {educationSection.items?.slice(0, 1).map((edu: any, idx: number) => (
                  <div key={idx} className="text-xs">
                    <div className="font-medium">{edu.degree}</div>
                    <div className="text-gray-600">{edu.institution}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Single column layout continues */}
        {styling.layout === 'single-column' && (
          <>
            {/* Education */}
            {educationSection && educationSection.visible && 'items' in educationSection && (
              <div>
                <h2 className="text-sm font-semibold mb-1" style={{ color: styling.primaryColor }}>
                  {educationSection.title}
                </h2>
                {educationSection.items?.slice(0, 1).map((edu: any, idx: number) => (
                  <div key={idx} className="text-xs">
                    <div className="font-medium">{edu.degree} - {edu.field}</div>
                    <div className="text-gray-600">{edu.institution}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Skills */}
            {skillsSection && skillsSection.visible && 'items' in skillsSection && (
              <div>
                <h2 className="text-sm font-semibold mb-1" style={{ color: styling.primaryColor }}>
                  {skillsSection.title}
                </h2>
                <p className="text-xs">
                  {skillsSection.items?.slice(0, 6).join(' • ')}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}