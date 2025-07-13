'use client'

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

  // Template-specific rendering
  if (template.id === 'stockholm') {
    return (
      <div className={`bg-white text-black aspect-[1/1.414] ${className}`} style={{ fontFamily: styling.fontFamily }}>
        {/* Stockholm: Modern energetic design */}
        <div className="h-full flex flex-col p-4">
          {/* Header with energetic styling */}
          <div className="border-l-4 pl-4 mb-4" style={{ borderColor: styling.primaryColor }}>
            <h1 className="text-lg font-bold mb-1" style={{ color: styling.primaryColor }}>
              {personalInfo?.firstName} {personalInfo?.lastName}
            </h1>
            <p className="text-sm text-gray-600 mb-2">{personalInfo?.title}</p>
            <div className="text-xs text-gray-500 space-y-0.5">
              <p>{personalInfo?.email} • {personalInfo?.phone}</p>
              <p>{personalInfo?.address}</p>
            </div>
          </div>

          {/* Two column layout for Stockholm */}
          <div className="grid grid-cols-3 gap-4 flex-1">
            {/* Main content */}
            <div className="col-span-2 space-y-3">
              {/* Summary with Stockholm styling */}
              {summarySection && summarySection.visible && (
                <div>
                  <h2 className="text-sm font-semibold mb-2 uppercase tracking-wide" 
                      style={{ color: styling.primaryColor }}>
                    {summarySection.title}
                  </h2>
                  <p className="text-xs leading-relaxed text-gray-700" style={{ textAlign: 'justify', hyphens: 'auto', WebkitHyphens: 'auto' }}>
                    {typeof summarySection.content === 'string' ? 
                      summarySection.content : ''}
                  </p>
                </div>
              )}

              {/* Experience with Stockholm design */}
              {experienceSection && experienceSection.visible && 'items' in experienceSection && (
                <div>
                  <h2 className="text-sm font-semibold mb-2 uppercase tracking-wide" 
                      style={{ color: styling.primaryColor }}>
                    {experienceSection.title}
                  </h2>
                  {experienceSection.items?.map((exp: any, idx: number) => (
                    <div key={idx} className="mb-2">
                      <div className="flex justify-between items-start mb-1">
                        <div className="text-xs font-medium">{exp.role}</div>
                        <div className="text-xs text-gray-500">{exp.startDate}</div>
                      </div>
                      <div className="text-xs text-gray-600 mb-1">{exp.company} • {exp.location}</div>
                      <ul className="text-xs space-y-0.5 text-gray-700">
                        {exp.bullets?.map((bullet: string, bIdx: number) => (
                          <li key={bIdx} className="flex items-start">
                            <span className="w-1 h-1 rounded-full mt-1.5 mr-2 flex-shrink-0" 
                                  style={{ backgroundColor: styling.primaryColor }}></span>
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-3">
              {/* Skills with energetic design */}
              {skillsSection && skillsSection.visible && 'items' in skillsSection && (
                <div>
                  <h2 className="text-sm font-semibold mb-2 uppercase tracking-wide" 
                      style={{ color: styling.primaryColor }}>
                    {skillsSection.title}
                  </h2>
                  <div className="space-y-1">
                    {skillsSection.items?.map((skill: string, idx: number) => (
                      <div key={idx} className="text-xs">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="text-gray-700">{skill}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div className="h-1 rounded-full" 
                               style={{ 
                                 backgroundColor: styling.primaryColor,
                                 width: `${Math.min(85 + (idx * 2), 95)}%` 
                               }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {educationSection && educationSection.visible && 'items' in educationSection && (
                <div>
                  <h2 className="text-sm font-semibold mb-2 uppercase tracking-wide" 
                      style={{ color: styling.primaryColor }}>
                    {educationSection.title}
                  </h2>
                  {educationSection.items?.map((edu: any, idx: number) => (
                    <div key={idx} className="text-xs mb-2">
                      <div className="font-medium text-gray-800">{edu.degree}</div>
                      <div className="text-gray-600">{edu.institution}</div>
                      <div className="text-gray-500">{edu.startDate} - {edu.endDate}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Dublin Professional template
  if (template.id === 'dublin-professional') {
    return (
      <div className={`bg-white text-black ${className}`} style={{ fontFamily: styling.fontFamily, minHeight: '100%' }}>
        <div className="flex flex-col p-4">
          {/* Classic Dublin header */}
          <div className="text-center border-b-2 pb-3 mb-4" style={{ borderColor: styling.primaryColor }}>
            <h1 className="text-lg font-bold mb-1" style={{ color: styling.primaryColor }}>
              {personalInfo?.firstName} {personalInfo?.lastName}
            </h1>
            <p className="text-sm text-gray-600 mb-2">{personalInfo?.title}</p>
            <div className="text-xs text-gray-500">
              {personalInfo?.email} • {personalInfo?.phone} • {personalInfo?.address}
            </div>
          </div>

          {/* Single column layout */}
          <div className="space-y-3 flex-1">
            {summarySection && summarySection.visible && (
              <div>
                <h2 className="text-sm font-semibold mb-2" style={{ color: styling.primaryColor }}>
                  {summarySection.title}
                </h2>
                <p className="text-xs leading-relaxed text-gray-700">
                  {typeof summarySection.content === 'string' ? 
                    summarySection.content : ''}
                </p>
              </div>
            )}

            {experienceSection && experienceSection.visible && 'items' in experienceSection && (
              <div>
                <h2 className="text-sm font-semibold mb-2" style={{ color: styling.primaryColor }}>
                  {experienceSection.title}
                </h2>
                {experienceSection.items?.map((exp: any, idx: number) => (
                  <div key={idx} className="mb-2">
                    <div className="text-xs font-medium">{exp.role}</div>
                    <div className="text-xs text-gray-600">{exp.company}, {exp.location}</div>
                    <ul className="text-xs mt-1 space-y-0.5 text-gray-700">
                      {exp.bullets?.map((bullet: string, bIdx: number) => (
                        <li key={bIdx}>• {bullet}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // London template (simple & classic)
  if (template.id === 'london') {
    return (
      <div className={`bg-white text-black ${className}`} style={{ fontFamily: styling.fontFamily, minHeight: '100%' }}>
        <div className="flex flex-col p-4">
          {/* Minimal London header */}
          <div className="mb-4">
            <h1 className="text-lg font-bold mb-1" style={{ color: styling.primaryColor }}>
              {personalInfo?.firstName} {personalInfo?.lastName}
            </h1>
            <p className="text-sm text-gray-600 mb-2">{personalInfo?.title}</p>
            <div className="text-xs text-gray-500 space-y-0.5">
              <p>{personalInfo?.email}</p>
              <p>{personalInfo?.phone}</p>
              <p>{personalInfo?.address}</p>
            </div>
          </div>

          <div className="space-y-3 flex-1">
            {summarySection && summarySection.visible && (
              <div>
                <h2 className="text-sm font-semibold mb-2 border-l-2 pl-2" 
                    style={{ color: styling.primaryColor, borderColor: styling.primaryColor }}>
                  {summarySection.title}
                </h2>
                <p className="text-xs leading-relaxed text-gray-700">
                  {typeof summarySection.content === 'string' ? 
                    summarySection.content : ''}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Default fallback template for others
  return (
    <div className={`bg-white text-black aspect-[1/1.414] ${className}`} style={{ fontFamily: styling.fontFamily }}>
      <div className="h-full flex flex-col p-4">
        {/* Header */}
        <div className={`mb-4 ${styling.headerStyle === 'bold' ? 'border-b-4' : 'border-b'}`} 
             style={{ borderColor: styling.primaryColor }}>
          <h1 className={`font-bold ${styling.headerStyle === 'bold' ? 'text-lg' : 'text-base'}`}
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
        <div className={`flex-1 ${styling.layout === 'two-column' ? 'grid grid-cols-3 gap-4' : 'space-y-3'}`}>
          {/* Main content */}
          <div className={styling.layout === 'two-column' ? 'col-span-2 space-y-3' : ''}>
            {/* Summary */}
            {summarySection && summarySection.visible && (
              <div>
                <h2 className="text-sm font-semibold mb-1" style={{ color: styling.primaryColor }}>
                  {summarySection.title}
                </h2>
                <p className="text-xs leading-relaxed" style={{ textAlign: 'justify', hyphens: 'auto', WebkitHyphens: 'auto' }}>
                  {typeof summarySection.content === 'string' ? 
                    summarySection.content : ''}
                </p>
              </div>
            )}

            {/* Experience */}
            {experienceSection && experienceSection.visible && 'items' in experienceSection && (
              <div>
                <h2 className="text-sm font-semibold mb-1" style={{ color: styling.primaryColor }}>
                  {experienceSection.title}
                </h2>
                {experienceSection.items?.map((exp: any, idx: number) => (
                  <div key={idx} className="text-xs mb-2">
                    <div className="font-medium">{exp.role}</div>
                    <div className="text-gray-600">{exp.company} | {exp.location}</div>
                    <ul className="mt-1 space-y-0.5">
                      {exp.bullets?.map((bullet: string, bIdx: number) => (
                        <li key={bIdx} className="text-xs">• {bullet}</li>
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
                  <div className="space-y-0.5">
                    {skillsSection.items?.map((skill: string, idx: number) => (
                      <div key={idx} className="text-xs">• {skill}</div>
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
                  {educationSection.items?.map((edu: any, idx: number) => (
                    <div key={idx} className="text-xs mb-2">
                      <div className="font-medium">{edu.degree}</div>
                      <div className="text-gray-600">{edu.institution}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Single column education and skills */}
          {styling.layout === 'single-column' && (
            <>
              {/* Education */}
              {educationSection && educationSection.visible && 'items' in educationSection && (
                <div>
                  <h2 className="text-sm font-semibold mb-1" style={{ color: styling.primaryColor }}>
                    {educationSection.title}
                  </h2>
                  {educationSection.items?.map((edu: any, idx: number) => (
                    <div key={idx} className="text-xs mb-2">
                      <div className="font-medium">{edu.degree}</div>
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
                  <div className="text-xs">
                    {skillsSection.items?.join(', ')}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}