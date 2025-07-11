'use client'

import React from 'react'
import { useCvBuilder } from '@/contexts/cv-builder-context'

export function CvBuilderPreview() {
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
      const newScale = Math.min(scaleX, scaleY, 1) // Never scale up beyond 100%
      
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
  }, [mounted])

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
        <div className="h-full flex flex-col p-6" style={{ fontFamily: templateStyle.fontFamily }}>
          {/* Stockholm Header */}
          <div className="border-l-4 pl-6 mb-6" style={{ borderColor: templateStyle.primaryColor }}>
            <h1 className="text-3xl font-bold mb-2" style={{ color: templateStyle.primaryColor }}>
              {document.personal.fullName || 'Your Name'}
            </h1>
            <p className="text-lg text-gray-600 mb-3">{document.personal.title || 'Professional Title'}</p>
            <div className="text-sm text-gray-500 space-y-1">
              <p>{document.personal.email || 'your.email@example.com'} • {document.personal.phone || '+353 XX XXX XXXX'}</p>
              <p>{document.personal.address || 'Dublin, Ireland'}</p>
            </div>
          </div>

          {/* Stockholm Two Column Layout */}
          <div className="grid grid-cols-3 gap-8 flex-1">
            {/* Main content */}
            <div className="col-span-2 space-y-6">
              {document.sections.map((section, index) => {
                const sectionVisibility = document.sectionVisibility || {}
                const isVisible = sectionVisibility[section.type as keyof typeof sectionVisibility] ?? true
                if (!isVisible) return null

                if (section.type === 'summary' && section.markdown) {
                  return (
                    <div key={index}>
                      <h2 className="text-base font-semibold mb-3 uppercase tracking-wide" 
                          style={{ color: templateStyle.primaryColor }}>
                        Professional Summary
                      </h2>
                      <p className="text-sm leading-relaxed text-gray-700">{section.markdown}</p>
                    </div>
                  )
                }

                if (section.type === 'experience' && section.items.length > 0) {
                  return (
                    <div key={index}>
                      <h2 className="text-base font-semibold mb-3 uppercase tracking-wide" 
                          style={{ color: templateStyle.primaryColor }}>
                        Work Experience
                      </h2>
                      {section.items.map((exp, expIdx) => (
                        <div key={expIdx} className="mb-4">
                          <div className="flex justify-between items-start mb-1">
                            <div className="text-sm font-medium">{exp.role}</div>
                            <div className="text-sm text-gray-500">{exp.start} - {exp.end || 'Present'}</div>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">{exp.company}</div>
                          <ul className="text-sm space-y-1 text-gray-700">
                            {exp.bullets.map((bullet, bIdx) => (
                              <li key={bIdx} className="flex items-start">
                                <span className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0" 
                                      style={{ backgroundColor: templateStyle.primaryColor }}></span>
                                <span>{bullet}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )
                }

                return null
              })}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {document.sections.map((section, index) => {
                const sectionVisibility = document.sectionVisibility || {}
                const isVisible = sectionVisibility[section.type as keyof typeof sectionVisibility] ?? true
                if (!isVisible) return null

                if (section.type === 'skills' && section.items.length > 0) {
                  return (
                    <div key={index}>
                      <h2 className="text-base font-semibold mb-3 uppercase tracking-wide" 
                          style={{ color: templateStyle.primaryColor }}>
                        Skills
                      </h2>
                      <div className="space-y-2">
                        {section.items.slice(0, 8).map((skill, idx) => (
                          <div key={idx} className="text-sm">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-gray-700">{skill}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="h-2 rounded-full" 
                                   style={{ 
                                     backgroundColor: templateStyle.primaryColor,
                                     width: `${85 + (idx * 2)}%` 
                                   }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                }

                if (section.type === 'education' && section.items.length > 0) {
                  return (
                    <div key={index}>
                      <h2 className="text-base font-semibold mb-3 uppercase tracking-wide" 
                          style={{ color: templateStyle.primaryColor }}>
                        Education
                      </h2>
                      {section.items.slice(0, 2).map((edu, idx) => (
                        <div key={idx} className="text-sm mb-3">
                          <div className="font-medium text-gray-800">{edu.degree}</div>
                          <div className="text-gray-600">{edu.institution}</div>
                          <div className="text-gray-500">{edu.start} - {edu.end || 'Present'}</div>
                          {edu.grade && <div className="text-gray-500">{edu.grade}</div>}
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
          <div className="text-center border-b-2 pb-4 mb-6" style={{ borderColor: templateStyle.primaryColor }}>
            <h1 className="text-3xl font-bold mb-2" style={{ color: templateStyle.primaryColor }}>
              {document.personal.fullName || 'Your Name'}
            </h1>
            <p className="text-lg text-gray-600 mb-3">{document.personal.title || 'Professional Title'}</p>
            <div className="text-sm text-gray-500">
              {document.personal.email || 'your.email@example.com'} • {document.personal.phone || '+353 XX XXX XXXX'} • {document.personal.address || 'Dublin, Ireland'}
            </div>
          </div>

          {/* Single column layout */}
          <div className="space-y-6 flex-1">
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
                    <p className="text-sm leading-relaxed text-gray-700">{section.markdown}</p>
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
                        <div className="text-sm font-medium">{exp.role}</div>
                        <div className="text-sm text-gray-600">{exp.company} • {exp.start} - {exp.end || 'Present'}</div>
                        <ul className="text-sm mt-2 space-y-1 text-gray-700">
                          {exp.bullets.map((bullet, bIdx) => (
                            <li key={bIdx} className="ml-4">• {bullet}</li>
                          ))}
                        </ul>
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
                      <div key={idx} className="text-sm mb-3">
                        <div className="font-medium">{edu.degree}</div>
                        <div className="text-gray-600">{edu.institution}</div>
                        <div className="text-gray-500">{edu.start} - {edu.end || 'Present'}</div>
                        {edu.grade && <div className="text-gray-500">{edu.grade}</div>}
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
                    <div className="grid grid-cols-3 gap-2">
                      {section.items.map((skill, idx) => (
                        <span key={idx} className="text-sm text-gray-700">{skill}</span>
                      ))}
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
              {document.personal.email || 'your.email@example.com'} • {document.personal.phone || '+353 XX XXX XXXX'} • {document.personal.address || 'Dublin, Ireland'}
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
                    <p className="text-sm leading-relaxed text-gray-700">{section.markdown}</p>
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
                        <div className="text-sm font-medium">{exp.role}</div>
                        <div className="text-sm text-gray-600">{exp.company} • {exp.start} - {exp.end || 'Present'}</div>
                        <ul className="text-sm mt-2 space-y-1 text-gray-700">
                          {exp.bullets.map((bullet, bIdx) => (
                            <li key={bIdx} className="ml-4">• {bullet}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
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
            {document.personal.email || 'your.email@example.com'} • {document.personal.phone || '+353 XX XXX XXXX'} • {document.personal.address || 'Dublin, Ireland'}
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
                      <div className="text-sm font-medium">{exp.role}</div>
                      <div className="text-sm text-gray-600">{exp.company} • {exp.start} - {exp.end || 'Present'}</div>
                      <ul className="text-sm mt-2 space-y-1 text-gray-700">
                        {exp.bullets.map((bullet, bIdx) => (
                          <li key={bIdx}>• {bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
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
    <div ref={containerRef} className="h-full overflow-hidden flex items-start justify-center p-8 bg-gray-100">
      <div className="relative">
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