'use client'

import React from 'react'
import { useCvBuilder } from '@/contexts/cv-builder-context'
import { getOrderedSections, getSectionLabel } from '@/lib/cv-section-utils'

interface CvBuilderPreviewProps {
  zoom?: number
}

export function CvBuilderPreview({ zoom = 100 }: CvBuilderPreviewProps) {
  const { document, template } = useCvBuilder()
  const [scale, setScale] = React.useState(1)
  const [mounted, setMounted] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (!mounted) return

    function handleResize() {
      if (!containerRef.current) return
      
      const container = containerRef.current
      const containerWidth = container.clientWidth - 64 // 32px padding on each side
      const containerHeight = container.clientHeight - 64
      
      // A4 dimensions in pixels at 96dpi
      const a4Width = 794
      const a4Height = 1123
      
      // Calculate scale to fit width and height
      const scaleX = containerWidth / a4Width
      const scaleY = containerHeight / a4Height
      const baseScale = Math.min(scaleX, scaleY, 1) // Never scale up beyond 100%
      
      // Apply zoom factor
      const newScale = baseScale * (zoom / 100)
      
      setScale(parseFloat(newScale.toFixed(3)))
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    const resizeObserver = new ResizeObserver(handleResize)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }
    
    return () => {
      window.removeEventListener('resize', handleResize)
      resizeObserver.disconnect()
    }
  }, [mounted, zoom])

  // Get template styling or use defaults
  const templateStyle = template?.styling || {
    fontFamily: 'Inter',
    primaryColor: '#1f2937',
    secondaryColor: '#4b5563',
    layout: 'single-column',
    headerStyle: 'classic'
  }

  // Render template-specific design
  const renderTemplateDesign = () => {
    if (template?.id === 'stockholm') {
      return (
        <div className="min-h-[800px] max-h-[1200px] flex flex-col p-6 overflow-hidden" style={{ fontFamily: templateStyle.fontFamily }}>
          {/* Stockholm Header */}
          <div className="border-l-4 pl-6 mb-6" style={{ borderColor: templateStyle.primaryColor }}>
            <h1 className="text-3xl font-bold mb-2" style={{ color: templateStyle.primaryColor }}>
              {document.personal.fullName || 'Your Name'}
            </h1>
            <p className="text-lg text-gray-600 mb-2">{document.personal.title || 'Professional Title'}</p>
            <div className="text-sm text-gray-500 space-y-1">
              <p>{document.personal.email || 'your.email@example.com'} • {document.personal.phone || '+353 XX XXX XXXX'}</p>
              <p>{document.personal.address || 'Dublin, Ireland'}{document.personal.workPermit ? ` • ${document.personal.workPermit}` : ''}</p>
              {(document.personal.linkedin || document.personal.website) && (
                <p>
                  {document.personal.linkedin && (
                    <span>
                      LinkedIn: <a href={document.personal.linkedin} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{document.personal.linkedin.replace('https://www.linkedin.com/in/', '')}</a>
                    </span>
                  )}
                  {document.personal.linkedin && document.personal.website && ' • '}
                  {document.personal.website && (
                    <span>
                      Website: <a href={document.personal.website} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{document.personal.website.replace(/^https?:\/\/(www\.)?/, '')}</a>
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Stockholm Two Column Layout */}
          <div className="grid grid-cols-3 gap-8 flex-1">
            {/* Main content */}
            <div className="col-span-2 space-y-4">
              {getOrderedSections(document.sectionVisibility).map((sectionConfig) => {
                const section = document.sections.find(s => s.type === sectionConfig.id)
                if (!section) return null

                if (section.type === 'summary' && section.markdown) {
                  return (
                    <div key={section.type}>
                      <h2 className="text-base font-semibold mb-2 uppercase tracking-wide" 
                          style={{ color: templateStyle.primaryColor }}>
                        {getSectionLabel(section.type)}
                      </h2>
                      <p className="text-sm leading-normal text-gray-700" style={{ textAlign: 'justify', hyphens: 'auto' }}>{section.markdown}</p>
                    </div>
                  )
                }

                if (section.type === 'experience' && 'items' in section && section.items.length > 0) {
                  return (
                    <div key={section.type}>
                      <h2 className="text-base font-semibold mb-2 uppercase tracking-wide" 
                          style={{ color: templateStyle.primaryColor }}>
                        {getSectionLabel(section.type)}
                      </h2>
                      {section.items.map((exp: any, expIdx: number) => (
                        <div key={expIdx} className="mb-3">
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex-1">
                              <div className="text-sm font-semibold text-gray-800">{exp.role}</div>
                              <div className="text-sm text-gray-700">{exp.company}</div>
                            </div>
                            <div className="text-xs text-gray-500 ml-3 whitespace-nowrap">
                              {exp.start} - {exp.end || 'Present'}
                            </div>
                          </div>
                          {exp.bullets && exp.bullets.length > 0 && (
                            <ul className="text-sm space-y-0.5 text-gray-700 mt-1">
                              {exp.bullets.map((bullet: string, bIdx: number) => (
                                <li key={bIdx} className="flex items-start">
                                  <span className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0" 
                                        style={{ backgroundColor: templateStyle.primaryColor }}></span>
                                  <span>{bullet}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  )
                }

                // Render all other section types  
                if (section.type !== 'summary' && section.type !== 'experience') {
                  // Special handling for references
                  if (section.type === 'references') {
                    if (section.mode === 'on-request' || (section.items && section.items.length > 0)) {
                      return (
                        <div key={section.type}>
                          <h2 className="text-base font-semibold mb-2 uppercase tracking-wide" 
                              style={{ color: templateStyle.primaryColor }}>
                            {getSectionLabel(section.type)}
                          </h2>
                          {section.mode === 'on-request' ? (
                            <div className="text-sm text-gray-700">Available upon request</div>
                          ) : (
                            <div className="space-y-2">
                              {section.items.map((item: any, idx: number) => (
                                <div key={idx} className="text-sm flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="font-semibold text-gray-800">{item.name}</div>
                                    <div className="text-gray-700">{item.title}</div>
                                    <div className="text-gray-600">{item.company}</div>
                                    {item.relationship && <div className="text-gray-500 text-xs">{item.relationship}</div>}
                                  </div>
                                  <div className="text-right text-xs text-gray-500 ml-4">
                                    <div>{item.email}</div>
                                    {item.phone && <div>{item.phone}</div>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    }
                    return null
                  }
                  
                  // Original logic for other sections
                  if ('items' in section && section.items.length > 0) {
                    return (
                      <div key={section.type}>
                        <h2 className="text-base font-semibold mb-2 uppercase tracking-wide" 
                            style={{ color: templateStyle.primaryColor }}>
                          {getSectionLabel(section.type)}
                        </h2>
                        <div className="space-y-2">
                          {section.items.slice(0, 10).map((item: any, idx: number) => (
                            <div key={idx} className="text-sm">
                              {typeof item === 'string' ? (
                                <div className="text-gray-700">{item}</div>
                              ) : (
                                <div>
                                  {item.title && <div className="font-semibold text-gray-800">{item.title}</div>}
                                  {item.company && <div className="text-gray-700">{item.company}</div>}
                                  {item.organization && <div className="text-gray-700">{item.organization}</div>}
                                  {item.institution && <div className="text-gray-700">{item.institution}</div>}
                                  {item.degree && <div className="font-semibold text-gray-800">{item.degree}</div>}
                                  {item.field && <div className="text-gray-600">{item.field}</div>}
                                  {/* For languages section, use item.name */}
                                  {(section.type === 'languages' && item.name) && <div className="font-semibold text-gray-800">{item.name}</div>}
                                  {item.proficiency && <div className="text-gray-600">{item.proficiency}</div>}
                                  {item.certification && <div className="text-gray-500 text-xs">Certification: {item.certification}</div>}
                                  {/* For other sections that have name property */}
                                  {(section.type !== 'languages' && item.name) && <div className="font-semibold text-gray-800">{item.name}</div>}
                                  {item.relationship && <div className="text-gray-600">{item.relationship}</div>}
                                  {item.email && <div className="text-gray-600">{item.email}</div>}
                                  {item.phone && <div className="text-gray-600">{item.phone}</div>}
                                  {(item.start || item.end) && (
                                    <div className="text-gray-500 text-xs">
                                      {item.start} {item.end && `- ${item.end}`}
                                    </div>
                                  )}
                                  {item.description && <div className="text-gray-600 mt-1">{item.description}</div>}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  }
                }

                return null
              })}
            </div>

            {/* Sidebar - Only for specific sections */}
            <div className="space-y-4">
              {getOrderedSections(document.sectionVisibility).map((sectionConfig) => {
                const section = document.sections.find(s => s.type === sectionConfig.id)
                if (!section) return null

                // Only render skills and education in sidebar for Stockholm template
                if (section.type === 'skills' && 'items' in section && section.items.length > 0) {
                  return (
                    <div key={section.type}>
                      <h2 className="text-base font-semibold mb-2 uppercase tracking-wide" 
                          style={{ color: templateStyle.primaryColor }}>
                        {getSectionLabel(section.type)}
                      </h2>
                      <div className="text-sm text-gray-700">
                        {section.items.join(', ')}
                      </div>
                    </div>
                  )
                }

                if (section.type === 'education' && 'items' in section && section.items.length > 0) {
                  return (
                    <div key={section.type}>
                      <h2 className="text-base font-semibold mb-2 uppercase tracking-wide" 
                          style={{ color: templateStyle.primaryColor }}>
                        {getSectionLabel(section.type)}
                      </h2>
                      {section.items.slice(0, 2).map((edu: any, idx: number) => (
                        <div key={idx} className="text-sm mb-3">
                          <div className="font-semibold text-gray-800">{edu.degree}</div>
                          <div className="text-gray-700">{edu.institution}</div>
                          <div className="text-gray-600">{edu.field}</div>
                          <div className="text-gray-500 text-xs">{edu.start} - {edu.end || 'Present'}</div>
                          {edu.grade && <div className="text-gray-600 text-xs">Grade: {edu.grade}</div>}
                        </div>
                      ))}
                    </div>
                  )
                }

                return null
              })}
            </div>
          </div>
        </div>
      )
    }

    if (template?.id === 'dublin-professional') {
      return (
        <div className="h-full flex flex-col p-6" style={{ fontFamily: templateStyle.fontFamily }}>
          {/* Dublin Professional Header */}
          <div className="text-center border-b-2 pb-3 mb-4" style={{ borderColor: templateStyle.primaryColor }}>
            <h1 className="text-3xl font-bold mb-2" style={{ color: templateStyle.primaryColor }}>
              {document.personal.fullName || 'Your Name'}
            </h1>
            <p className="text-lg text-gray-600 mb-2">{document.personal.title || 'Professional Title'}</p>
            <div className="text-sm text-gray-500">
              <p>{document.personal.email || 'your.email@example.com'} • {document.personal.phone || '+353 XX XXX XXXX'} • {document.personal.address || 'Dublin, Ireland'}</p>
              {document.personal.workPermit && <p className="mt-1">Work Status: {document.personal.workPermit}</p>}
              {(document.personal.linkedin || document.personal.website) && (
                <p className="mt-1">
                  {document.personal.linkedin && (
                    <span>LinkedIn: <a href={document.personal.linkedin} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{document.personal.linkedin.replace('https://www.linkedin.com/in/', '')}</a></span>
                  )}
                  {document.personal.linkedin && document.personal.website && ' • '}
                  {document.personal.website && (
                    <span>Portfolio: <a href={document.personal.website} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{document.personal.website.replace(/^https?:\/\/(www\.)?/, '')}</a></span>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Single column layout */}
          <div className="space-y-4 flex-1">
            {document.sections.map((section, index) => {
              const sectionVisibility = document.sectionVisibility || {}
              const isVisible = sectionVisibility[section.type as keyof typeof sectionVisibility] ?? true
              if (!isVisible) return null

              if (section.type === 'summary' && section.markdown) {
                return (
                  <div key={index}>
                    <h2 className="text-base font-semibold mb-3" style={{ color: templateStyle.primaryColor }}>
                      Professional Summary
                    </h2>
                    <p className="text-sm leading-relaxed text-gray-700" style={{ textAlign: 'justify', hyphens: 'auto', WebkitHyphens: 'auto' }}>{section.markdown}</p>
                  </div>
                )
              }

              if (section.type === 'experience' && section.items.length > 0) {
                return (
                  <div key={index}>
                    <h2 className="text-base font-semibold mb-3" style={{ color: templateStyle.primaryColor }}>
                      Work Experience
                    </h2>
                    {section.items.map((exp, expIdx) => (
                      <div key={expIdx} className="mb-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-gray-900">{exp.role}</div>
                            <div className="text-sm text-gray-700 font-medium">{exp.company}</div>
                          </div>
                          <div className="text-sm text-gray-600 ml-4 whitespace-nowrap">
                            {exp.start} - {exp.end || 'Present'}
                          </div>
                        </div>
                        {exp.bullets.length > 0 && (
                          <ul className="text-sm mt-1 space-y-0.5 text-gray-700">
                            {exp.bullets.map((bullet, bIdx) => (
                              <li key={bIdx} className="ml-4">• {bullet}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )
              }

              if (section.type === 'education' && section.items.length > 0) {
                return (
                  <div key={index}>
                    <h2 className="text-base font-semibold mb-3" style={{ color: templateStyle.primaryColor }}>
                      Education
                    </h2>
                    {section.items.map((edu, idx) => (
                      <div key={idx} className="mb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-gray-900">{edu.degree}</div>
                            <div className="text-sm text-gray-700 font-medium">{edu.institution}</div>
                            <div className="text-sm text-gray-600">{edu.field}</div>
                            {edu.grade && <div className="text-sm text-gray-600">Grade: {edu.grade}</div>}
                          </div>
                          <div className="text-sm text-gray-600 ml-4 whitespace-nowrap">
                            {edu.start} - {edu.end || 'Present'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              }

              if (section.type === 'skills' && section.items.length > 0) {
                return (
                  <div key={index}>
                    <h2 className="text-base font-semibold mb-3" style={{ color: templateStyle.primaryColor }}>
                      Skills
                    </h2>
                    <div className="text-sm text-gray-700">
                      {section.items.join(', ')}
                    </div>
                  </div>
                )
              }

              if (section.type === 'references') {
                return (
                  <div key={index}>
                    <h2 className="text-base font-semibold mb-3" style={{ color: templateStyle.primaryColor }}>
                      References
                    </h2>
                    {section.mode === 'on-request' ? (
                      <p className="text-sm text-gray-700">Available upon request</p>
                    ) : section.items && section.items.length > 0 ? (
                      <div className="space-y-3">
                        {section.items.map((ref, idx) => (
                          <div key={idx} className="text-sm flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{ref.name}</div>
                              <div className="text-gray-700">{ref.title}</div>
                              <div className="text-gray-600">{ref.company}</div>
                              {ref.relationship && <div className="text-gray-500 text-xs">{ref.relationship}</div>}
                            </div>
                            <div className="text-right text-xs text-gray-500 ml-4">
                              <div>{ref.email}</div>
                              {ref.phone && <div>{ref.phone}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-700">Available upon request</p>
                    )}
                  </div>
                )
              }

              return null
            })}
          </div>
        </div>
      )
    }

    if (template?.id === 'london') {
      return (
        <div className="h-full flex flex-col p-6" style={{ fontFamily: templateStyle.fontFamily }}>
          {/* London Minimal Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2" style={{ color: templateStyle.primaryColor }}>
              {document.personal.fullName || 'Your Name'}
            </h1>
            <p className="text-lg text-gray-600 mb-3">{document.personal.title || 'Professional Title'}</p>
            <div className="text-sm text-gray-500">
              <p>{document.personal.email || 'your.email@example.com'} • {document.personal.phone || '+353 XX XXX XXXX'} • {document.personal.address || 'Dublin, Ireland'}</p>
              {document.personal.workPermit && <p className="mt-1">Work Status: {document.personal.workPermit}</p>}
              {(document.personal.linkedin || document.personal.website) && (
                <p className="mt-1">
                  {document.personal.linkedin && (
                    <span>LinkedIn: <a href={document.personal.linkedin} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{document.personal.linkedin.replace('https://www.linkedin.com/in/', '')}</a></span>
                  )}
                  {document.personal.linkedin && document.personal.website && ' • '}
                  {document.personal.website && (
                    <span>Portfolio: <a href={document.personal.website} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{document.personal.website.replace(/^https?:\/\/(www\.)?/, '')}</a></span>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Content with minimal styling */}
          <div className="space-y-6 flex-1">
            {document.sections.map((section, index) => {
              const sectionVisibility = document.sectionVisibility || {}
              const isVisible = sectionVisibility[section.type as keyof typeof sectionVisibility] ?? true
              if (!isVisible) return null

              if (section.type === 'summary' && section.markdown) {
                return (
                  <div key={index}>
                    <h2 className="text-base font-medium mb-3 border-l-2 pl-3" style={{ borderColor: templateStyle.primaryColor, color: templateStyle.primaryColor }}>
                      About
                    </h2>
                    <p className="text-sm leading-relaxed text-gray-700" style={{ textAlign: 'justify', hyphens: 'auto', WebkitHyphens: 'auto' }}>{section.markdown}</p>
                  </div>
                )
              }

              if (section.type === 'experience' && section.items.length > 0) {
                return (
                  <div key={index}>
                    <h2 className="text-base font-medium mb-3 border-l-2 pl-3" style={{ borderColor: templateStyle.primaryColor, color: templateStyle.primaryColor }}>
                      Experience
                    </h2>
                    {section.items.map((exp, expIdx) => (
                      <div key={expIdx} className="mb-4 pl-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-gray-900">{exp.role}</div>
                            <div className="text-sm text-gray-700 font-medium">{exp.company}</div>
                          </div>
                          <div className="text-sm text-gray-600 ml-4 whitespace-nowrap">
                            {exp.start} - {exp.end || 'Present'}
                          </div>
                        </div>
                        {exp.bullets.length > 0 && (
                          <ul className="text-sm mt-1 space-y-0.5 text-gray-700">
                            {exp.bullets.map((bullet, bIdx) => (
                              <li key={bIdx} className="ml-4">• {bullet}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )
              }

              if (section.type === 'education' && section.items.length > 0) {
                return (
                  <div key={index}>
                    <h2 className="text-base font-medium mb-3 border-l-2 pl-3" style={{ borderColor: templateStyle.primaryColor, color: templateStyle.primaryColor }}>
                      Education
                    </h2>
                    {section.items.map((edu, idx) => (
                      <div key={idx} className="mb-3 pl-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-gray-900">{edu.degree}</div>
                            <div className="text-sm text-gray-700 font-medium">{edu.institution}</div>
                            <div className="text-sm text-gray-600">{edu.field}</div>
                            {edu.grade && <div className="text-sm text-gray-600">Grade: {edu.grade}</div>}
                          </div>
                          <div className="text-sm text-gray-600 ml-4 whitespace-nowrap">
                            {edu.start} - {edu.end || 'Present'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              }

              if (section.type === 'skills' && section.items.length > 0) {
                return (
                  <div key={index}>
                    <h2 className="text-base font-medium mb-3 border-l-2 pl-3" style={{ borderColor: templateStyle.primaryColor, color: templateStyle.primaryColor }}>
                      Skills
                    </h2>
                    <div className="pl-3 text-sm text-gray-700">
                      {section.items.join(', ')}
                    </div>
                  </div>
                )
              }

              if (section.type === 'references') {
                return (
                  <div key={index}>
                    <h2 className="text-base font-medium mb-3 border-l-2 pl-3" style={{ borderColor: templateStyle.primaryColor, color: templateStyle.primaryColor }}>
                      References
                    </h2>
                    <div className="pl-3">
                      {section.mode === 'on-request' ? (
                        <p className="text-sm text-gray-700">Available upon request</p>
                      ) : section.items && section.items.length > 0 ? (
                        <div className="space-y-3">
                          {section.items.map((ref, idx) => (
                            <div key={idx} className="text-sm flex justify-between items-start">
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{ref.name}</div>
                                <div className="text-gray-700">{ref.title}</div>
                                <div className="text-gray-600">{ref.company}</div>
                                {ref.relationship && <div className="text-gray-500 text-xs">{ref.relationship}</div>}
                              </div>
                              <div className="text-right text-xs text-gray-500 ml-4">
                                <div>{ref.email}</div>
                                {ref.phone && <div>{ref.phone}</div>}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-700">Available upon request</p>
                      )}
                    </div>
                  </div>
                )
              }

              return null
            })}
          </div>
        </div>
      )
    }

    // Default template design (fallback)
    return (
      <div className="h-full flex flex-col p-6" style={{ fontFamily: templateStyle.fontFamily }}>
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2" style={{ color: templateStyle.primaryColor }}>
            {document.personal.fullName || 'Your Name'}
          </h1>
          <p className="text-lg text-gray-600 mb-3">{document.personal.title || 'Professional Title'}</p>
          <div className="text-sm text-gray-500">
            <p>{document.personal.email || 'your.email@example.com'} • {document.personal.phone || '+353 XX XXX XXXX'} • {document.personal.address || 'Dublin, Ireland'}</p>
            {document.personal.workPermit && <p className="mt-1">Work Status: {document.personal.workPermit}</p>}
            {(document.personal.linkedin || document.personal.website) && (
              <p className="mt-1">
                {document.personal.linkedin && (
                  <span>LinkedIn: <a href={document.personal.linkedin} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{document.personal.linkedin.replace('https://www.linkedin.com/in/', '')}</a></span>
                )}
                {document.personal.linkedin && document.personal.website && ' • '}
                {document.personal.website && (
                  <span>Portfolio: <a href={document.personal.website} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{document.personal.website.replace(/^https?:\/\/(www\.)?/, '')}</a></span>
                )}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-6 flex-1">
          {document.sections.map((section, index) => {
            const sectionVisibility = document.sectionVisibility || {}
            const isVisible = sectionVisibility[section.type as keyof typeof sectionVisibility] ?? true
            if (!isVisible) return null

            if (section.type === 'summary' && section.markdown) {
              return (
                <div key={index}>
                  <h2 className="text-base font-semibold mb-3" style={{ color: templateStyle.primaryColor }}>
                    Summary
                  </h2>
                  <p className="text-sm leading-relaxed text-gray-700">{section.markdown}</p>
                </div>
              )
            }

            if (section.type === 'experience' && section.items.length > 0) {
              return (
                <div key={index}>
                  <h2 className="text-base font-semibold mb-3" style={{ color: templateStyle.primaryColor }}>
                    Experience
                  </h2>
                  {section.items.map((exp, expIdx) => (
                    <div key={expIdx} className="mb-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-900">{exp.role}</div>
                          <div className="text-sm text-gray-700 font-medium">{exp.company}</div>
                        </div>
                        <div className="text-sm text-gray-600 ml-4 whitespace-nowrap">
                          {exp.start} - {exp.end || 'Present'}
                        </div>
                      </div>
                      {exp.bullets.length > 0 && (
                        <ul className="text-sm mt-2 space-y-1 text-gray-700">
                          {exp.bullets.map((bullet, bIdx) => (
                            <li key={bIdx}>• {bullet}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )
            }

            if (section.type === 'education' && section.items.length > 0) {
              return (
                <div key={index}>
                  <h2 className="text-base font-semibold mb-3" style={{ color: templateStyle.primaryColor }}>
                    Education
                  </h2>
                  {section.items.map((edu, idx) => (
                    <div key={idx} className="mb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-900">{edu.degree}</div>
                          <div className="text-sm text-gray-700 font-medium">{edu.institution}</div>
                          <div className="text-sm text-gray-600">{edu.field}</div>
                          {edu.grade && <div className="text-sm text-gray-600">Grade: {edu.grade}</div>}
                        </div>
                        <div className="text-sm text-gray-600 ml-4 whitespace-nowrap">
                          {edu.start} - {edu.end || 'Present'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            }

            if (section.type === 'skills' && section.items.length > 0) {
              return (
                <div key={index}>
                  <h2 className="text-base font-semibold mb-3" style={{ color: templateStyle.primaryColor }}>
                    Technical Skills
                  </h2>
                  <div className="text-sm text-gray-700">
                    {section.items.join(', ')}
                  </div>
                </div>
              )
            }

            if (section.type === 'certifications' && section.items.length > 0) {
              return (
                <div key={index}>
                  <h2 className="text-base font-semibold mb-3" style={{ color: templateStyle.primaryColor }}>
                    Certifications
                  </h2>
                  {section.items.map((cert, idx) => (
                    <div key={idx} className="text-sm mb-2">
                      <div className="font-medium">{cert.name}</div>
                      <div className="text-gray-600">{cert.issuer} • {cert.date}</div>
                      {cert.credentialId && <div className="text-gray-500">ID: {cert.credentialId}</div>}
                    </div>
                  ))}
                </div>
              )
            }

            if (section.type === 'languages' && section.items.length > 0) {
              return (
                <div key={index}>
                  <h2 className="text-base font-semibold mb-3" style={{ color: templateStyle.primaryColor }}>
                    Languages
                  </h2>
                  <div className="text-sm">
                    {section.items.map((lang, idx) => (
                      <div key={idx} className="mb-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-800">{lang.name}</span>
                          <span className="text-gray-600 capitalize">{lang.proficiency}</span>
                        </div>
                        {lang.certification && (
                          <div className="text-gray-600 text-xs mt-0.5">Certification: {lang.certification}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            }

            if (section.type === 'references') {
              return (
                <div key={index}>
                  <h2 className="text-base font-semibold mb-3" style={{ color: templateStyle.primaryColor }}>
                    References
                  </h2>
                  {section.mode === 'on-request' ? (
                    <p className="text-sm text-gray-700">Available upon request</p>
                  ) : section.items && section.items.length > 0 ? (
                    <div className="space-y-3">
                      {section.items.map((ref, idx) => (
                        <div key={idx} className="text-sm flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{ref.name}</div>
                            <div className="text-gray-700">{ref.title}</div>
                            <div className="text-gray-600">{ref.company}</div>
                            {ref.relationship && <div className="text-gray-500 text-xs">{ref.relationship}</div>}
                          </div>
                          <div className="text-right text-xs text-gray-500 ml-4">
                            <div>{ref.email}</div>
                            {ref.phone && <div>{ref.phone}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700">Available upon request</p>
                  )}
                </div>
              )
            }

            return null
          })}
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="h-full overflow-auto flex items-start justify-center p-8 bg-gray-100">
      <div className="relative" style={{ 
        minWidth: `${210 * scale}mm`,
        minHeight: `${297 * scale}mm`,
        display: 'flex',
        justifyContent: 'center',
        paddingTop: '20px',
        paddingBottom: '20px'
      }}>
        {/* A4 Page Container with Template Design */}
        <div 
          className="bg-white shadow-xl overflow-hidden print:shadow-none print:overflow-visible"
          style={{ 
            width: '210mm',
            minHeight: '297mm',
            transform: `scale(${scale})`,
            transformOrigin: 'top center'
          }}
        >
          {renderTemplateDesign()}
        </div>
      </div>
    </div>
  )
}