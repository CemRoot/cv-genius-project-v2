'use client'

import { useState, useRef, useEffect, forwardRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Search, Briefcase, Building, MapPin, GraduationCap } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface AutocompleteOption {
  value: string
  label: string
  category?: string
  icon?: React.ReactNode
}

interface MobileAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  options: AutocompleteOption[]
  disabled?: boolean
  className?: string
  id?: string
  name?: string
  type?: 'job-title' | 'company' | 'location' | 'university' | 'skill' | 'default'
  onBlur?: () => void
  onFocus?: () => void
}

// Predefined suggestions for different field types
const jobTitles = [
  'Software Engineer', 'Senior Software Engineer', 'Frontend Developer',
  'Backend Developer', 'Full Stack Developer', 'Data Scientist',
  'Product Manager', 'Project Manager', 'UX/UI Designer',
  'Marketing Manager', 'Sales Manager', 'Business Analyst',
  'DevOps Engineer', 'System Administrator', 'Data Analyst',
  'Accountant', 'Financial Analyst', 'HR Manager',
  'Customer Service Representative', 'Operations Manager',
  'Quality Assurance Engineer', 'Technical Writer'
]

const dublinCompanies = [
  'Google', 'Microsoft', 'Meta (Facebook)', 'Amazon', 'Apple',
  'Stripe', 'Shopify', 'Airbnb', 'LinkedIn', 'Twitter',
  'Bank of Ireland', 'AIB (Allied Irish Banks)', 'Ulster Bank',
  'Accenture', 'Deloitte', 'PwC', 'KPMG', 'EY',
  'Pfizer', 'Johnson & Johnson', 'Medtronic', 'Boston Scientific',
  'CRH', 'Ryanair', 'ESB', 'Eircom', 'Three Ireland'
]

const dublinLocations = [
  'Dublin', 'Dublin 1', 'Dublin 2', 'Dublin 3', 'Dublin 4',
  'Dublin 5', 'Dublin 6', 'Dublin 7', 'Dublin 8', 'Dublin 9',
  'Dublin 10', 'Dublin 11', 'Dublin 12', 'Dublin 13', 'Dublin 14',
  'Dublin 15', 'Dublin 16', 'Dublin 17', 'Dublin 18', 'Dublin 20',
  'Dublin 22', 'Dublin 24', 'Ballsbridge', 'Temple Bar', 'Docklands',
  'Ballymun', 'Blanchardstown', 'Tallaght', 'Dún Laoghaire'
]

const universities = [
  'Trinity College Dublin', 'University College Dublin (UCD)',
  'Dublin City University (DCU)', 'Dublin Institute of Technology (DIT)',
  'Technological University Dublin (TU Dublin)',
  'National University of Ireland Maynooth', 'University College Cork',
  'National University of Ireland Galway', 'University of Limerick',
  'Cork Institute of Technology', 'Waterford Institute of Technology'
]

const technicalSkills = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'React',
  'Node.js', 'Angular', 'Vue.js', 'HTML', 'CSS', 'SQL',
  'MongoDB', 'PostgreSQL', 'AWS', 'Azure', 'Docker',
  'Kubernetes', 'Git', 'Agile', 'Scrum', 'REST APIs'
]

const getDefaultOptions = (type: string): AutocompleteOption[] => {
  switch (type) {
    case 'job-title':
      return jobTitles.map(title => ({
        value: title,
        label: title,
        category: 'Common Roles',
        icon: <Briefcase className="h-4 w-4" />
      }))
    
    case 'company':
      return dublinCompanies.map(company => ({
        value: company,
        label: company,
        category: 'Dublin Companies',
        icon: <Building className="h-4 w-4" />
      }))
    
    case 'location':
      return dublinLocations.map(location => ({
        value: location,
        label: location,
        category: 'Dublin Areas',
        icon: <MapPin className="h-4 w-4" />
      }))
    
    case 'university':
      return universities.map(uni => ({
        value: uni,
        label: uni,
        category: 'Irish Universities',
        icon: <GraduationCap className="h-4 w-4" />
      }))
    
    case 'skill':
      return technicalSkills.map(skill => ({
        value: skill,
        label: skill,
        category: 'Technical Skills',
        icon: <Check className="h-4 w-4" />
      }))
    
    default:
      return []
  }
}

export const MobileAutocomplete = forwardRef<HTMLInputElement, MobileAutocompleteProps>(
  ({ 
    value, 
    onChange, 
    placeholder, 
    options, 
    disabled, 
    className, 
    id, 
    name, 
    type = 'default',
    onBlur,
    onFocus,
    ...props 
  }, ref) => {
    const [isOpen, setIsOpen] = useState(false)
    const [filteredOptions, setFilteredOptions] = useState<AutocompleteOption[]>([])
    const [highlightedIndex, setHighlightedIndex] = useState(-1)
    const containerRef = useRef<HTMLDivElement>(null)
    const optionsRef = useRef<HTMLDivElement>(null)

    // Get default options if none provided - memoize to prevent infinite re-renders
    const allOptions = useMemo(() => {
      return options.length > 0 ? options : getDefaultOptions(type)
    }, [options, type])

    // Filter options based on input
    useEffect(() => {
      if (!value || value.length < 1) {
        setFilteredOptions(allOptions.slice(0, 8)) // Show top 8 when empty
      } else {
        const filtered = allOptions.filter(option =>
          option.label.toLowerCase().includes(value.toLowerCase()) ||
          option.value.toLowerCase().includes(value.toLowerCase())
        ).slice(0, 8)
        setFilteredOptions(filtered)
      }
      setHighlightedIndex(-1)
    }, [value, allOptions])

    // Handle clicks outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false)
        }
      }

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside)
      }
      
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value)
      if (!isOpen && e.target.value.length > 0) {
        setIsOpen(true)
      }
    }

    const handleOptionSelect = (option: AutocompleteOption) => {
      onChange(option.value)
      setIsOpen(false)
      setHighlightedIndex(-1)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === 'ArrowDown' || e.key === 'Enter') {
          setIsOpen(true)
          e.preventDefault()
        }
        return
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setHighlightedIndex(prev => 
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          )
          break
        
        case 'ArrowUp':
          e.preventDefault()
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          )
          break
        
        case 'Enter':
          e.preventDefault()
          if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
            handleOptionSelect(filteredOptions[highlightedIndex])
          } else if (filteredOptions.length === 1) {
            handleOptionSelect(filteredOptions[0])
          }
          break
        
        case 'Escape':
          setIsOpen(false)
          setHighlightedIndex(-1)
          break
      }
    }

    const handleInputFocus = () => {
      setIsOpen(true)
      onFocus?.()
    }

    const handleInputBlur = () => {
      // Delay blur to allow option selection
      setTimeout(() => {
        onBlur?.()
      }, 150)
    }

    return (
      <div ref={containerRef} className="relative">
        <div className="relative">
          <Input
            ref={ref}
            id={id}
            name={name}
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={`pr-10 ${className}`}
            autoComplete="off"
            {...props}
          />
          
          {/* Search Icon */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Options Dropdown */}
        <AnimatePresence>
          {isOpen && filteredOptions.length > 0 && (
            <motion.div
              ref={optionsRef}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
            >
              {/* Header */}
              {filteredOptions[0]?.category && (
                <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b">
                  {filteredOptions[0].category}
                </div>
              )}

              {/* Options */}
              <div className="py-1">
                {filteredOptions.map((option, index) => (
                  <motion.button
                    key={`${option.value}-${index}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                    onClick={() => handleOptionSelect(option)}
                    className={`
                      w-full text-left px-3 py-2 text-sm hover:bg-gray-100 
                      flex items-center gap-3 transition-colors touch-manipulation
                      ${highlightedIndex === index ? 'bg-blue-50 text-blue-900' : 'text-gray-900'}
                    `}
                  >
                    {option.icon && (
                      <span className="text-gray-400 flex-shrink-0">
                        {option.icon}
                      </span>
                    )}
                    <span className="truncate">{option.label}</span>
                  </motion.button>
                ))}
              </div>

              {/* Footer for custom values */}
              {value && !allOptions.some(opt => opt.value.toLowerCase() === value.toLowerCase()) && (
                <div className="border-t px-3 py-2 text-xs text-gray-500">
                  Press Enter to use: "{value}"
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }
)

MobileAutocomplete.displayName = 'MobileAutocomplete'

// Hook for managing autocomplete state
export function useMobileAutocomplete(type: string) {
  const [suggestions] = useState(() => getDefaultOptions(type))
  
  return {
    suggestions,
    getSuggestions: (query: string) => {
      return suggestions.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    }
  }
}