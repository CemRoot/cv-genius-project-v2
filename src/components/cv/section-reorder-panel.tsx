'use client'

import { useCVStore } from '@/store/cv-store'
import { CVSection } from '@/types/cv'
// Using Unicode icons instead of Heroicons

export default function SectionReorderPanel() {
  const { 
    currentCV, 
    moveSectionUp, 
    moveSectionDown, 
    toggleSectionVisibility,
    resetToDefaultSections 
  } = useCVStore()

  const sortedSections = [...currentCV.sections].sort((a, b) => a.order - b.order)

  const getSectionDisplayName = (type: string) => {
    const names: { [key: string]: string } = {
      'summary': 'Summary',
      'skills': 'Skills',
      'experience': 'Experience',
      'education': 'Education',
      'projects': 'Projects',
      'certifications': 'Certifications',
      'languages': 'Languages',
      'interests': 'Interests',
      'references': 'References'
    }
    return names[type] || type
  }

  return (
    <div className="bg-white rounded-lg shadow p-3 md:p-4 mb-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
        <h3 className="text-base md:text-lg font-semibold text-gray-800">CV Section Order</h3>
        <button
          onClick={resetToDefaultSections}
          className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 underline self-start sm:self-auto"
        >
          Reset to Default
        </button>
      </div>
      
      <div className="space-y-2">
        {sortedSections.map((section, index) => (
          <div 
            key={section.id}
            className={`flex items-center justify-between p-2 sm:p-3 rounded border ${
              section.visible ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
              <span className="text-xs sm:text-sm font-medium text-gray-500 w-5 sm:w-6 flex-shrink-0">
                {section.order}
              </span>
              <span className={`text-sm sm:text-base font-medium truncate ${
                section.visible ? 'text-gray-800' : 'text-gray-400'
              }`}>
                {getSectionDisplayName(section.type)}
              </span>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              {/* Visibility Toggle */}
              <button
                onClick={() => toggleSectionVisibility(section.id)}
                className={`p-1.5 sm:p-1 rounded hover:bg-white touch-manipulation ${
                  section.visible ? 'text-green-600' : 'text-gray-400'
                }`}
                title={section.visible ? 'Hide' : 'Show'}
              >
                <span className="text-base sm:text-base">{section.visible ? '👁️' : '👁️‍🗨️'}</span>
              </button>
              
              {/* Move Up */}
              <button
                onClick={() => moveSectionUp(section.id)}
                disabled={index === 0}
                className={`p-1.5 sm:p-1 rounded touch-manipulation ${
                  index === 0 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white'
                }`}
                title="Move Up"
              >
                <span className="text-lg sm:text-base font-bold">↑</span>
              </button>
              
              {/* Move Down */}
              <button
                onClick={() => moveSectionDown(section.id)}
                disabled={index === sortedSections.length - 1}
                className={`p-1.5 sm:p-1 rounded touch-manipulation ${
                  index === sortedSections.length - 1
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white'
                }`}
                title="Move Down"
              >
                <span className="text-lg sm:text-base font-bold">↓</span>
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-xs text-gray-500 hidden sm:block">
        <p>💡 Use up/down arrows to reorder sections, eye icon to show/hide sections.</p>
      </div>
    </div>
  )
} 