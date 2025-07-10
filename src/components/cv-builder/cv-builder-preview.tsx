'use client'

import React from 'react'
import { useCvBuilder } from '@/contexts/cv-builder-context'

export function CvBuilderPreview() {
  const { document } = useCvBuilder()
  const [scale, setScale] = React.useState(1)
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
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
  }, [])

  return (
    <div ref={containerRef} className="h-full overflow-y-auto flex items-start justify-center p-8 bg-gray-100">
      <div className="relative">
        {/* A4 Page Container - ATS-Optimized Black & White Template */}
        <div 
          className="bg-white shadow-xl overflow-hidden print:shadow-none print:overflow-visible"
          style={{ 
            width: '210mm',
            minHeight: '297mm',
            transform: `scale(${scale})`,
            transformOrigin: 'top center'
          }}
        >
          {/* Main CV Content Grid */}
          <div 
            className="cv-template-classic h-full font-lato text-black bg-white overflow-x-auto"
            style={{
              padding: '20mm',
              display: 'grid',
              gridTemplateRows: 'auto 1fr',
              gap: '6mm',
              minHeight: 'calc(297mm - 40mm)' // A4 height minus top/bottom margins
            }}
          >
            {/* Header Section */}
            <header className="cv-header" style={{ gridRow: '1' }}>
              <div className="header-grid" style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr',
                gap: '8mm',
                alignItems: 'start'
              }}>
                {/* Personal Info - Left Column */}
                <div className="personal-info">
                  <h1 className="cv-name text-black font-bold" style={{
                    fontSize: '24pt',
                    lineHeight: '1.2',
                    margin: '0 0 3mm 0',
                    letterSpacing: '0.5px'
                  }}>
                    {document.personal.fullName || 'Your Name'}
                  </h1>
                  
                  <h2 className="cv-title text-black font-medium" style={{
                    fontSize: '14pt',
                    lineHeight: '1.3',
                    margin: '0 0 6mm 0',
                    fontWeight: '500'
                  }}>
                    {document.personal.title || 'Professional Title'}
                  </h2>
                </div>

                {/* Contact Info - Right Column */}
                <div className="contact-info" style={{
                  fontSize: '10pt',
                  lineHeight: '1.4',
                  textAlign: 'right'
                }}>
                  <div className="contact-item" style={{ marginBottom: '2mm' }}>
                    {document.personal.email || 'your.email@example.com'}
                  </div>
                  <div className="contact-item" style={{ marginBottom: '2mm' }}>
                    {document.personal.phone || '+353 XX XXX XXXX'}
                  </div>
                  <div className="contact-item">
                    {document.personal.address || 'Dublin, Ireland'}
                  </div>
                </div>
              </div>
            </header>

            {/* Main Content Section */}
            <main className="cv-content" style={{ 
              gridRow: '2',
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '6mm'
            }}>
              {document.sections.map((section, index) => (
                <section key={index} className="cv-section" style={{ 
                  breakInside: 'avoid',
                  marginBottom: index < document.sections.length - 1 ? '6mm' : '0'
                }}>
                  
                  {/* Professional Summary */}
                  {section.type === 'summary' && (
                    <div className="summary-section">
                      <h3 className="section-heading text-black font-semibold" style={{
                        fontSize: '12pt',
                        lineHeight: '1.3',
                        margin: '0 0 3mm 0',
                        textTransform: 'uppercase',
                        letterSpacing: '0.8px',
                        borderBottom: '1pt solid #000',
                        paddingBottom: '1mm'
                      }}>
                        Professional Summary
                      </h3>
                      <div className="summary-content" style={{
                        fontSize: '11pt',
                        lineHeight: '1.5',
                        textAlign: 'justify',
                        margin: '3mm 0 0 0'
                      }}>
                        {section.markdown || (
                          <span style={{ color: '#666', fontStyle: 'italic' }}>
                            Your professional summary will appear here...
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Work Experience */}
                  {section.type === 'experience' && (
                    <div className="experience-section">
                      <h3 className="section-heading text-black font-semibold" style={{
                        fontSize: '12pt',
                        lineHeight: '1.3',
                        margin: '0 0 3mm 0',
                        textTransform: 'uppercase',
                        letterSpacing: '0.8px',
                        borderBottom: '1pt solid #000',
                        paddingBottom: '1mm'
                      }}>
                        Work Experience
                      </h3>
                      
                      {section.items.length > 0 ? (
                        <div className="experience-items" style={{ margin: '3mm 0 0 0' }}>
                          {section.items.map((exp, expIndex) => (
                            <div key={expIndex} className="experience-item" style={{
                              marginBottom: expIndex < section.items.length - 1 ? '5mm' : '0',
                              breakInside: 'avoid'
                            }}>
                              {/* Experience Header */}
                              <div className="experience-header" style={{
                                display: 'grid',
                                gridTemplateColumns: '2fr 1fr',
                                gap: '4mm',
                                marginBottom: '2mm',
                                alignItems: 'baseline'
                              }}>
                                <div className="position-company">
                                  <h4 className="position-title text-black font-semibold" style={{
                                    fontSize: '11pt',
                                    lineHeight: '1.3',
                                    margin: '0 0 1mm 0'
                                  }}>
                                    {exp.role}
                                  </h4>
                                  <div className="company-name" style={{
                                    fontSize: '10pt',
                                    lineHeight: '1.3',
                                    margin: '0'
                                  }}>
                                    {exp.company}
                                  </div>
                                </div>
                                <div className="dates" style={{
                                  fontSize: '10pt',
                                  lineHeight: '1.3',
                                  textAlign: 'right',
                                  fontWeight: '500'
                                }}>
                                  {exp.start} – {exp.end || 'Present'}
                                </div>
                              </div>

                              {/* Achievements List */}
                              <ul className="achievements-list" style={{
                                margin: '0',
                                paddingLeft: '4mm',
                                listStyle: 'disc'
                              }}>
                                {exp.bullets.map((bullet, bulletIndex) => (
                                  <li key={bulletIndex} style={{
                                    fontSize: '10pt',
                                    lineHeight: '1.4',
                                    marginBottom: '1mm',
                                    textAlign: 'justify'
                                  }}>
                                    {bullet}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ 
                          color: '#666', 
                          fontStyle: 'italic',
                          fontSize: '10pt',
                          margin: '3mm 0 0 0'
                        }}>
                          Add your work experience...
                        </div>
                      )}
                    </div>
                  )}

                  {/* Education */}
                  {section.type === 'education' && (
                    <div className="education-section">
                      <h3 className="section-heading text-black font-semibold" style={{
                        fontSize: '12pt',
                        lineHeight: '1.3',
                        margin: '0 0 3mm 0',
                        textTransform: 'uppercase',
                        letterSpacing: '0.8px',
                        borderBottom: '1pt solid #000',
                        paddingBottom: '1mm'
                      }}>
                        Education
                      </h3>
                      
                      {section.items.length > 0 ? (
                        <div className="education-items" style={{ margin: '3mm 0 0 0' }}>
                          {section.items.map((edu, eduIndex) => (
                            <div key={eduIndex} className="education-item" style={{
                              marginBottom: eduIndex < section.items.length - 1 ? '3mm' : '0',
                              breakInside: 'avoid'
                            }}>
                              <div className="education-header" style={{
                                display: 'grid',
                                gridTemplateColumns: '2fr 1fr',
                                gap: '4mm',
                                alignItems: 'baseline'
                              }}>
                                <div className="degree-institution">
                                  <h4 className="degree-title text-black font-semibold" style={{
                                    fontSize: '11pt',
                                    lineHeight: '1.3',
                                    margin: '0 0 1mm 0'
                                  }}>
                                    {edu.degree}
                                  </h4>
                                  <div className="institution-name" style={{
                                    fontSize: '10pt',
                                    lineHeight: '1.3',
                                    margin: '0 0 1mm 0'
                                  }}>
                                    {edu.institution}
                                  </div>
                                  <div className="field-grade" style={{
                                    fontSize: '10pt',
                                    lineHeight: '1.3',
                                    margin: '0'
                                  }}>
                                    {edu.field}
                                    {edu.grade && ` • ${edu.grade}`}
                                  </div>
                                </div>
                                <div className="dates" style={{
                                  fontSize: '10pt',
                                  lineHeight: '1.3',
                                  textAlign: 'right',
                                  fontWeight: '500'
                                }}>
                                  {edu.start} – {edu.end || 'Present'}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ 
                          color: '#666', 
                          fontStyle: 'italic',
                          fontSize: '10pt',
                          margin: '3mm 0 0 0'
                        }}>
                          Add your education...
                        </div>
                      )}
                    </div>
                  )}

                  {/* Skills */}
                  {section.type === 'skills' && (
                    <div className="skills-section">
                      <h3 className="section-heading text-black font-semibold" style={{
                        fontSize: '12pt',
                        lineHeight: '1.3',
                        margin: '0 0 3mm 0',
                        textTransform: 'uppercase',
                        letterSpacing: '0.8px',
                        borderBottom: '1pt solid #000',
                        paddingBottom: '1mm'
                      }}>
                        Skills
                      </h3>
                      
                      {section.items.length > 0 ? (
                        <div className="skills-content" style={{
                          margin: '3mm 0 0 0',
                          fontSize: '10pt',
                          lineHeight: '1.4'
                        }}>
                          {section.items.join(' • ')}
                        </div>
                      ) : (
                        <div style={{ 
                          color: '#666', 
                          fontStyle: 'italic',
                          fontSize: '10pt',
                          margin: '3mm 0 0 0'
                        }}>
                          Add your skills...
                        </div>
                      )}
                    </div>
                  )}

                  {/* References */}
                  {section.type === 'references' && (
                    <div className="references-section">
                      <h3 className="section-heading text-black font-semibold" style={{
                        fontSize: '12pt',
                        lineHeight: '1.3',
                        margin: '0 0 3mm 0',
                        textTransform: 'uppercase',
                        letterSpacing: '0.8px',
                        borderBottom: '1pt solid #000',
                        paddingBottom: '1mm'
                      }}>
                        References
                      </h3>
                      
                      {section.mode === 'on-request' ? (
                        <div style={{
                          margin: '3mm 0 0 0',
                          fontSize: '10pt',
                          lineHeight: '1.4',
                          fontStyle: 'italic'
                        }}>
                          References available upon request
                        </div>
                      ) : section.items.length > 0 ? (
                        <div className="references-grid" style={{
                          margin: '3mm 0 0 0',
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, 1fr)',
                          gap: '4mm'
                        }}>
                          {section.items.map((ref, refIndex) => (
                            <div key={refIndex} className="reference-item" style={{
                              fontSize: '10pt',
                              lineHeight: '1.4',
                              breakInside: 'avoid'
                            }}>
                              <div style={{ fontWeight: '600', marginBottom: '1mm' }}>
                                {ref.name}
                              </div>
                              <div style={{ fontSize: '9pt', color: '#333' }}>
                                {ref.title}
                              </div>
                              <div style={{ fontSize: '9pt', color: '#333' }}>
                                {ref.company}
                              </div>
                              <div style={{ fontSize: '9pt', marginTop: '1mm' }}>
                                {ref.email}
                              </div>
                              <div style={{ fontSize: '9pt' }}>
                                {ref.phone}
                              </div>
                              {ref.relationship && (
                                <div style={{ fontSize: '9pt', fontStyle: 'italic', marginTop: '1mm' }}>
                                  {ref.relationship}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ 
                          color: '#666', 
                          fontStyle: 'italic',
                          fontSize: '10pt',
                          margin: '3mm 0 0 0'
                        }}>
                          Add your references...
                        </div>
                      )}
                    </div>
                  )}
                </section>
              ))}

              {/* Empty State */}
              {document.sections.length === 0 && (
                <div className="empty-state" style={{
                  textAlign: 'center',
                  color: '#666',
                  fontSize: '12pt',
                  margin: '20mm 0'
                }}>
                  <p style={{ marginBottom: '4mm' }}>
                    Your CV preview will appear here as you add information.
                  </p>
                  <p style={{ 
                    fontSize: '10pt',
                    fontStyle: 'italic' 
                  }}>
                    Start by filling out your personal information in the sidebar.
                  </p>
                </div>
              )}
            </main>
          </div>
        </div>

        {/* ATS Compliance Indicator - Compact */}
        <div className="mt-4 flex items-center justify-center">
          <div className="inline-flex items-center px-3 py-1.5 bg-green-50 rounded-lg border border-green-200">
            <svg className="h-4 w-4 text-green-500 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-xs font-medium text-green-700">
              ATS-Optimized • Dublin Standards
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}