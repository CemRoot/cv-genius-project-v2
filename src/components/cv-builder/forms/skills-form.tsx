'use client'

import React, { useState } from 'react'
import { useCvBuilder } from '@/contexts/cv-builder-context'
import { CvBuilderSectionSchema } from '@/types/cv-builder'
import { z } from 'zod'

export function SkillsForm() {
  const { document, updateSkills } = useCvBuilder()
  const [newSkill, setNewSkill] = useState('')
  const [error, setError] = useState<string>()

  // Get skills section
  const skillsSection = document.sections.find(s => s.type === 'skills')
  const skills = skillsSection?.type === 'skills' ? skillsSection.items : []

  const validateSkills = (skillsList: string[]): string | undefined => {
    try {
      const skillsSchema = z.object({
        type: z.literal('skills'),
        items: CvBuilderSectionSchema.options[3].shape.items
      })
      skillsSchema.parse({ type: 'skills', items: skillsList })
      return undefined
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors[0]?.message
      }
      return 'Invalid skills'
    }
  }

  const addSkill = () => {
    if (newSkill.trim()) {
      const updatedSkills = [...skills, newSkill.trim()]
      const validationError = validateSkills(updatedSkills)
      
      if (!validationError) {
        updateSkills(updatedSkills)
        setNewSkill('')
        setError(undefined)
      } else {
        setError(validationError)
      }
    }
  }

  const removeSkill = (index: number) => {
    const updatedSkills = skills.filter((_, i) => i !== index)
    updateSkills(updatedSkills)
    setError(undefined)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addSkill()
    }
  }

  const addSkillFromSuggestion = (skill: string) => {
    if (!skills.includes(skill)) {
      const updatedSkills = [...skills, skill]
      const validationError = validateSkills(updatedSkills)
      
      if (!validationError) {
        updateSkills(updatedSkills)
        setError(undefined)
      }
    }
  }

  const getTechnicalSkillSuggestions = () => [
    // Programming Languages
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin',
    
    // Web Technologies
    'React', 'Vue.js', 'Angular', 'Node.js', 'Express.js', 'Next.js', 'HTML5', 'CSS3', 'SASS', 'Tailwind CSS',
    
    // Databases
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'SQL Server',
    
    // Cloud & DevOps
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'Git', 'GitHub', 'GitLab',
    
    // Data & Analytics
    'Excel', 'Power BI', 'Tableau', 'SQL', 'R', 'Pandas', 'NumPy', 'Machine Learning',
    
    // Design & Creative
    'Adobe Creative Suite', 'Photoshop', 'Illustrator', 'Figma', 'Sketch', 'UI/UX Design'
  ]

  const getSoftSkillSuggestions = () => [
    'Communication', 'Leadership', 'Problem Solving', 'Critical Thinking', 'Team Collaboration',
    'Project Management', 'Time Management', 'Adaptability', 'Creativity', 'Analytical Thinking',
    'Customer Service', 'Presentation Skills', 'Conflict Resolution', 'Mentoring', 'Strategic Planning'
  ]

  const getIndustrySkillSuggestions = () => [
    // Finance & Banking
    'Financial Analysis', 'Risk Management', 'Compliance', 'Investment Banking', 'Portfolio Management',
    'Regulatory Reporting', 'IFRS', 'Basel III', 'Anti-Money Laundering', 'KYC',
    
    // Healthcare & Pharma
    'Clinical Research', 'GCP', 'Regulatory Affairs', 'Quality Assurance', 'Medical Writing',
    'Pharmacovigilance', 'Clinical Data Management', 'Biostatistics',
    
    // Marketing & Sales
    'Digital Marketing', 'SEO', 'SEM', 'Social Media Marketing', 'Content Marketing',
    'Sales Strategy', 'CRM', 'Lead Generation', 'Brand Management',
    
    // Operations & Supply Chain
    'Supply Chain Management', 'Logistics', 'Procurement', 'Inventory Management',
    'Process Improvement', 'Lean Six Sigma', 'Quality Management'
  ]

  const getAllSuggestions = () => [
    ...getTechnicalSkillSuggestions(),
    ...getSoftSkillSuggestions(),
    ...getIndustrySkillSuggestions()
  ].filter(skill => !skills.includes(skill)).sort()

  const filterSuggestions = (category: 'technical' | 'soft' | 'industry') => {
    let categorySkills: string[] = []
    
    switch (category) {
      case 'technical':
        categorySkills = getTechnicalSkillSuggestions()
        break
      case 'soft':
        categorySkills = getSoftSkillSuggestions()
        break
      case 'industry':
        categorySkills = getIndustrySkillSuggestions()
        break
    }
    
    return categorySkills.filter(skill => !skills.includes(skill))
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Skills
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Add your technical and soft skills relevant to Dublin job market. Focus on skills mentioned in job descriptions you're targeting.
        </p>
      </div>

      {/* Current Skills */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Your Skills ({skills.length}/20)
        </h4>
        
        {skills.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-4">
            {skills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                {skill}
                <button
                  onClick={() => removeSkill(index)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm mb-4">No skills added yet. Start by adding your key skills below.</p>
        )}

        {/* Validation Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Validation Status */}
        {skills.length >= 3 && skills.length <= 20 && !error && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-600">✅ Skills section looks good!</p>
          </div>
        )}
      </div>

      {/* Add New Skill */}
      <div>
        <label htmlFor="newSkill" className="block text-sm font-medium text-gray-700 mb-1">
          Add Skill
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            id="newSkill"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., JavaScript, Project Management, Excel"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={50}
          />
          <button
            onClick={addSkill}
            disabled={!newSkill.trim() || skills.length >= 20}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Press Enter or click Add to include the skill
        </p>
      </div>

      {/* Skill Suggestions */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700">
          Popular Skills for Dublin Jobs
        </h4>

        {/* Technical Skills */}
        <div>
          <h5 className="text-xs font-medium text-gray-600 mb-2">Technical Skills</h5>
          <div className="flex flex-wrap gap-2">
            {filterSuggestions('technical').slice(0, 12).map(skill => (
              <button
                key={skill}
                onClick={() => addSkillFromSuggestion(skill)}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                + {skill}
              </button>
            ))}
          </div>
        </div>

        {/* Soft Skills */}
        <div>
          <h5 className="text-xs font-medium text-gray-600 mb-2">Soft Skills</h5>
          <div className="flex flex-wrap gap-2">
            {filterSuggestions('soft').slice(0, 8).map(skill => (
              <button
                key={skill}
                onClick={() => addSkillFromSuggestion(skill)}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                + {skill}
              </button>
            ))}
          </div>
        </div>

        {/* Industry-Specific Skills */}
        <div>
          <h5 className="text-xs font-medium text-gray-600 mb-2">Industry-Specific Skills</h5>
          <div className="flex flex-wrap gap-2">
            {filterSuggestions('industry').slice(0, 10).map(skill => (
              <button
                key={skill}
                onClick={() => addSkillFromSuggestion(skill)}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                + {skill}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Skills Tips for Dublin CVs</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Include 8-15 skills for optimal ATS performance</li>
          <li>• Mix technical skills with soft skills (70% technical, 30% soft for tech roles)</li>
          <li>• Use exact keywords from Dublin job postings in your field</li>
          <li>• Include skill level only if you can demonstrate proficiency</li>
          <li>• Prioritize skills relevant to the Irish/European market</li>
          <li>• Consider adding language skills (English proficiency, Irish, European languages)</li>
        </ul>
      </div>

      {/* Dublin Market Insights */}
      <div className="bg-green-50 border border-green-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-green-800 mb-2">🇮🇪 Dublin Market Insights</h4>
        <div className="text-sm text-green-700 space-y-2">
          <p><strong>High-Demand Skills in Dublin:</strong></p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li><strong>Tech:</strong> React, Node.js, Python, AWS, DevOps, Cybersecurity</li>
            <li><strong>Finance:</strong> Risk Management, Compliance, Regulatory Reporting, ESG</li>
            <li><strong>Pharma:</strong> Clinical Research, Regulatory Affairs, Quality Assurance</li>
            <li><strong>General:</strong> Data Analysis, Project Management, Agile, Digital Marketing</li>
          </ul>
        </div>
      </div>

      {/* Skill Level Guide */}
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-gray-800 mb-2">📊 Skill Assessment Guide</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <p><strong>Only include skills where you are at least:</strong></p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li><strong>Beginner:</strong> 6+ months experience, can perform basic tasks with guidance</li>
            <li><strong>Intermediate:</strong> 1-2 years experience, can work independently</li>
            <li><strong>Advanced:</strong> 3+ years experience, can mentor others</li>
            <li><strong>Expert:</strong> 5+ years experience, recognized authority</li>
          </ul>
        </div>
      </div>
    </div>
  )
}