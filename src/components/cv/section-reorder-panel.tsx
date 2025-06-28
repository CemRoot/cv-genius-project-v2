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
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">CV Section Order</h3>
        <button
          onClick={resetToDefaultSections}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Reset to Default
        </button>
      </div>
      
      <div className="space-y-2">
        {sortedSections.map((section, index) => (
          <div 
            key={section.id}
            className={`flex items-center justify-between p-3 rounded border ${
              section.visible ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-500 w-6">
                {section.order}
              </span>
              <span className={`font-medium ${
                section.visible ? 'text-gray-800' : 'text-gray-400'
              }`}>
                {getSectionDisplayName(section.type)}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Visibility Toggle */}
              <button
                onClick={() => toggleSectionVisibility(section.id)}
                className={`p-1 rounded hover:bg-white ${
                  section.visible ? 'text-green-600' : 'text-gray-400'
                }`}
                                 title={section.visible ? 'Hide' : 'Show'}
              >
                               {section.visible ? '👁️' : '👁️‍🗨️'}
              </button>
              
              {/* Move Up */}
              <button
                onClick={() => moveSectionUp(section.id)}
                disabled={index === 0}
                className={`p-1 rounded ${
                  index === 0 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white'
                }`}
                title="Move Up"
              >
                                 ↑
              </button>
              
              {/* Move Down */}
              <button
                onClick={() => moveSectionDown(section.id)}
                disabled={index === sortedSections.length - 1}
                className={`p-1 rounded ${
                  index === sortedSections.length - 1
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white'
                }`}
                title="Move Down"
              >
                                 ↓
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        <p>💡 Use up/down arrows to reorder sections, eye icon to show/hide sections.</p>
      </div>
    </div>
  )
} 