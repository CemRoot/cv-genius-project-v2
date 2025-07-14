'use client'

import React, { useState } from 'react'
import { useCvBuilder } from '@/contexts/cv-builder-context'
import { CvBuilderSectionSchema } from '@/types/cv-builder'
import { z } from 'zod'
import { Plus, X, Sparkles, Code, Users, Briefcase, TrendingUp, Check } from 'lucide-react'

type SkillCategory = 'all' | 'technical' | 'soft' | 'industry'

export function SkillsForm() {
  const { document, updateSkills } = useCvBuilder()
  const [newSkill, setNewSkill] = useState('')
  const [error, setError] = useState<string>()
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory>('all')
  const [showSuggestions, setShowSuggestions] = useState(true)

  // Get skills section
  const skillsSection = document.sections.find(s => s.type === 'skills')
  const skills = skillsSection?.type === 'skills' ? skillsSection.items : []

  const validateSkills = (skillsList: string[]): string | undefined => {
    try {
      // Validate individual skills
      const skillSchema = z.string()
        .min(2, 'Skill must be at least 2 characters')
        .max(50, 'Skill must be less than 50 characters')
      
      // Validate each skill
      for (const skill of skillsList) {
        skillSchema.parse(skill)
      }
      
      // Check array constraints
      if (skillsList.length > 20) {
        return 'Maximum 20 skills allowed'
      }
      
      return undefined
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors[0]?.message
      }
      return 'Invalid skill'
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
      } else {
        setError(validationError)
      }
    }
  }

  const getTechnicalSkillSuggestions = () => [
    // Programming Languages
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin', 'C++', 'Scala',
    
    // Web Technologies
    'React', 'Vue.js', 'Angular', 'Node.js', 'Express.js', 'Next.js', 'HTML5', 'CSS3', 'SASS', 'Tailwind CSS', 'Bootstrap', 'jQuery',
    
    // Databases
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'SQL Server', 'Cassandra', 'DynamoDB',
    
    // Cloud & DevOps
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'Git', 'GitHub', 'GitLab', 'CI/CD', 'Terraform', 'Ansible',
    
    // Data & Analytics
    'Excel', 'Power BI', 'Tableau', 'SQL', 'R', 'Pandas', 'NumPy', 'Machine Learning', 'Data Analysis', 'Spark', 'Hadoop',
    
    // Design & Creative
    'Adobe Creative Suite', 'Photoshop', 'Illustrator', 'Figma', 'Sketch', 'UI/UX Design', 'InDesign', 'After Effects'
  ]

  const getSoftSkillSuggestions = () => [
    'Communication', 'Leadership', 'Problem Solving', 'Critical Thinking', 'Team Collaboration',
    'Project Management', 'Time Management', 'Adaptability', 'Creativity', 'Analytical Thinking',
    'Customer Service', 'Presentation Skills', 'Conflict Resolution', 'Mentoring', 'Strategic Planning',
    'Attention to Detail', 'Decision Making', 'Negotiation', 'Public Speaking', 'Emotional Intelligence',
    'Stakeholder Management', 'Cross-functional Collaboration', 'Agile Methodology', 'Change Management'
  ]

  const getIndustrySkillSuggestions = () => [
    // Finance & Banking
    'Financial Analysis', 'Risk Management', 'Compliance', 'Investment Banking', 'Portfolio Management',
    'Regulatory Reporting', 'IFRS', 'Basel III', 'Anti-Money Laundering', 'KYC', 'Bloomberg Terminal',
    'Financial Modelling', 'Derivatives', 'Fixed Income', 'Equity Research', 'FX Trading',
    
    // Healthcare & Pharma
    'Clinical Research', 'GCP', 'Regulatory Affairs', 'Quality Assurance', 'Medical Writing',
    'Pharmacovigilance', 'Clinical Data Management', 'Biostatistics', 'FDA Regulations', 'EMA Guidelines',
    'Medical Device Regulation', 'Clinical Trial Management', 'SOP Development',
    
    // Marketing & Sales
    'Digital Marketing', 'SEO', 'SEM', 'Social Media Marketing', 'Content Marketing',
    'Sales Strategy', 'CRM', 'Lead Generation', 'Brand Management', 'Google Analytics',
    'HubSpot', 'Salesforce', 'Marketing Automation', 'B2B Sales', 'Account Management',
    
    // Operations & Supply Chain
    'Supply Chain Management', 'Logistics', 'Procurement', 'Inventory Management',
    'Process Improvement', 'Lean Six Sigma', 'Quality Management', 'SAP', 'ERP Systems',
    'Warehouse Management', 'Demand Planning', 'Vendor Management'
  ]

  const getAllSuggestions = () => {
    const allSkills = [
      ...getTechnicalSkillSuggestions(),
      ...getSoftSkillSuggestions(),
      ...getIndustrySkillSuggestions()
    ]
    return allSkills.filter(skill => !skills.includes(skill)).sort()
  }

  const filterSuggestions = (category: SkillCategory) => {
    let categorySkills: string[] = []
    
    switch (category) {
      case 'all':
        return getAllSuggestions()
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
    
    return categorySkills.filter(skill => !skills.includes(skill)).sort()
  }

  const getCategoryIcon = (category: SkillCategory) => {
    switch (category) {
      case 'technical':
        return <Code className="w-4 h-4" />
      case 'soft':
        return <Users className="w-4 h-4" />
      case 'industry':
        return <Briefcase className="w-4 h-4" />
      default:
        return <Sparkles className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-blue-600" />
            </div>
            Skills
          </h3>
          <span className="text-sm text-gray-500">
            {skills.length}/20 skills
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Add your technical and soft skills relevant to the Dublin job market. Focus on skills that match your target roles.
        </p>
      </div>

      {/* Current Skills */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Check className="w-4 h-4 text-green-600" />
          Your Current Skills
        </h4>
        
        {skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <div
                key={index}
                className="group relative inline-flex items-center px-3 py-1.5 rounded-lg text-sm bg-white border border-gray-200 hover:border-blue-300 transition-all duration-200"
              >
                <span className="text-gray-700">{skill}</span>
                <button
                  onClick={() => removeSkill(index)}
                  className="ml-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Remove skill"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm italic">
            No skills added yet. Start by adding your key competencies below.
          </p>
        )}

        {/* Validation Messages */}
        <div className="mt-3">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {skills.length >= 8 && skills.length <= 15 && !error && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-600 flex items-center gap-2">
                <Check className="w-4 h-4" />
                Perfect! You have an optimal number of skills for ATS systems.
              </p>
            </div>
          )}

          {skills.length > 0 && skills.length < 8 && !error && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                Consider adding {8 - skills.length} more skills to strengthen your profile.
              </p>
            </div>
          )}

          {skills.length > 15 && !error && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
              <p className="text-sm text-orange-700">
                Consider removing {skills.length - 15} skills to keep your CV focused.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add New Skill */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <label htmlFor="newSkill" className="block text-sm font-semibold text-gray-900 mb-3">
          Add Custom Skill
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              id="newSkill"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a skill (e.g., JavaScript, Excel, Leadership)"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              maxLength={50}
            />
          </div>
          <button
            onClick={addSkill}
            disabled={!newSkill.trim() || skills.length >= 20}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Type your skill and press Enter or click Add
        </p>
      </div>

      {/* Skill Suggestions */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900">
              Popular Skills for Dublin Jobs
            </h4>
            <button
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {showSuggestions ? 'Hide' : 'Show'} Suggestions
            </button>
          </div>
          
          {showSuggestions && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {getCategoryIcon('all')}
                  All Skills
                </span>
              </button>
              <button
                onClick={() => setSelectedCategory('technical')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedCategory === 'technical'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {getCategoryIcon('technical')}
                  Technical
                </span>
              </button>
              <button
                onClick={() => setSelectedCategory('soft')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedCategory === 'soft'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {getCategoryIcon('soft')}
                  Soft Skills
                </span>
              </button>
              <button
                onClick={() => setSelectedCategory('industry')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedCategory === 'industry'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {getCategoryIcon('industry')}
                  Industry
                </span>
              </button>
            </div>
          )}
        </div>
        
        {showSuggestions && (
          <div className="p-4 max-h-48 overflow-y-auto">
            <div className="flex flex-wrap gap-2">
              {filterSuggestions(selectedCategory).slice(0, 50).map(skill => (
                <button
                  key={skill}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    addSkillFromSuggestion(skill)
                  }}
                  disabled={skills.length >= 20}
                  className="group inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-50 text-gray-800 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 border border-gray-200 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  type="button"
                >
                  <Plus className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 pointer-events-none" />
                  <span className="pointer-events-none">{skill}</span>
                </button>
              ))}
              {filterSuggestions(selectedCategory).length === 0 && (
                <p className="text-sm text-gray-500 italic">No more suggestions available in this category.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Professional Tips Accordion */}
      <div className="space-y-3">
        {/* ATS Optimization Tips */}
        <details className="group bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <summary className="cursor-pointer p-4 flex items-center justify-between hover:bg-blue-100/50 transition-colors rounded-lg">
            <h4 className="text-sm font-semibold text-blue-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              ATS Optimization Tips
            </h4>
            <svg className="w-4 h-4 text-blue-600 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="px-4 pb-4">
            <ul className="text-sm text-blue-800 space-y-1.5">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Include 8-15 skills for optimal ATS performance</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Use exact keywords from job postings in your field</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Mix technical skills with soft skills (70/30 ratio for tech roles)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Avoid abbreviations unless widely recognized (e.g., AWS, SQL)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Include both tools and technologies (e.g., "React" and "JavaScript")</span>
              </li>
            </ul>
          </div>
        </details>

        {/* Dublin Market Insights */}
        <details className="group bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <summary className="cursor-pointer p-4 flex items-center justify-between hover:bg-green-100/50 transition-colors rounded-lg">
            <h4 className="text-sm font-semibold text-green-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Dublin Market Insights 2024
            </h4>
            <svg className="w-4 h-4 text-green-600 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="px-4 pb-4">
            <div className="text-sm text-green-800 space-y-3">
              <div>
                <p className="font-semibold mb-1">🏢 Tech Sector:</p>
                <p className="text-xs">React, Node.js, Python, AWS, Kubernetes, TypeScript, DevOps, Cybersecurity</p>
              </div>
              <div>
                <p className="font-semibold mb-1">💼 Finance Sector:</p>
                <p className="text-xs">Risk Management, Compliance, Regulatory Reporting, ESG, Bloomberg, Python</p>
              </div>
              <div>
                <p className="font-semibold mb-1">🏥 Pharma/Healthcare:</p>
                <p className="text-xs">Clinical Research, GCP, Regulatory Affairs, Quality Assurance, Validation</p>
              </div>
              <div>
                <p className="font-semibold mb-1">📊 All Sectors:</p>
                <p className="text-xs">Data Analysis, Project Management, Agile, Excel, Communication Skills</p>
              </div>
            </div>
          </div>
        </details>
      </div>
    </div>
  )
}