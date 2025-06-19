'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface StickySection {
  id: string
  title: string
  content: React.ReactNode
  stickyHeader?: boolean
  minHeight?: string
}

interface MobileStickySectionsProps {
  sections: StickySection[]
  className?: string
  headerClassName?: string
  contentClassName?: string
  activeHeaderColor?: string
}

export function MobileStickySections({ 
  sections, 
  className = '',
  headerClassName = '',
  contentClassName = '',
  activeHeaderColor = 'bg-cvgenius-purple text-white'
}: MobileStickySectionsProps) {
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id || '')
  const containerRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return

      const container = containerRef.current
      const containerTop = container.getBoundingClientRect().top
      const containerHeight = container.clientHeight

      // Find which section is currently most visible
      let maxVisibleSection = ''
      let maxVisibleHeight = 0

      sections.forEach(section => {
        const element = sectionRefs.current[section.id]
        if (!element) return

        const rect = element.getBoundingClientRect()
        const visibleTop = Math.max(rect.top, containerTop)
        const visibleBottom = Math.min(rect.bottom, containerTop + containerHeight)
        const visibleHeight = Math.max(0, visibleBottom - visibleTop)

        if (visibleHeight > maxVisibleHeight) {
          maxVisibleHeight = visibleHeight
          maxVisibleSection = section.id
        }
      })

      if (maxVisibleSection && maxVisibleSection !== activeSection) {
        setActiveSection(maxVisibleSection)
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      handleScroll() // Initial call

      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [sections, activeSection])

  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current[sectionId]
    if (element && containerRef.current) {
      const container = containerRef.current
      const elementTop = element.offsetTop
      const headerHeight = 60 // Account for sticky header

      container.scrollTo({
        top: elementTop - headerHeight,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className={`relative h-full ${className}`}>
      {/* Sticky Navigation Header */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="flex overflow-x-auto scrollbar-hide">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`
                flex-shrink-0 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap
                ${activeSection === section.id 
                  ? activeHeaderColor
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }
                ${headerClassName}
              `}
            >
              {section.title}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Content */}
      <div 
        ref={containerRef}
        className="h-full overflow-y-auto"
      >
        {sections.map((section, index) => (
          <div
            key={section.id}
            ref={el => sectionRefs.current[section.id] = el}
            className={`${contentClassName}`}
            style={{ minHeight: section.minHeight }}
          >
            {/* Section Header (if sticky) */}
            {section.stickyHeader && (
              <div className="sticky top-[60px] bg-white/95 backdrop-blur-sm z-5 px-4 py-2 border-b">
                <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
              </div>
            )}

            {/* Section Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="p-4"
            >
              {section.content}
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  )
}