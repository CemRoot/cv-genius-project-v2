'use client'

import { forwardRef, useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { MobileAutocomplete } from '@/components/mobile'

interface MobileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  enableAutocomplete?: boolean
  autocompleteType?: 'job-title' | 'company' | 'location' | 'university' | 'skill' | 'default'
  isMobile?: boolean
  onValueChange?: (value: string) => void
}

export const MobileInput = forwardRef<HTMLInputElement, MobileInputProps>(
  ({ 
    enableAutocomplete = false, 
    autocompleteType = 'default', 
    isMobile = false,
    onValueChange,
    onChange,
    onBlur,
    value,
    name,
    ...props 
  }, ref) => {
    const [detectedMobile, setDetectedMobile] = useState(false)
    
    // Ensure we have a name prop (required by react-hook-form)
    const fieldName = name

    // Detect mobile on client side
    useEffect(() => {
      const checkMobile = () => {
        setDetectedMobile(window.innerWidth < 768)
      }
      checkMobile()
      window.addEventListener('resize', checkMobile)
      return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      onValueChange?.(newValue)
      
      // Call the onChange from react-hook-form if present
      if (onChange && typeof onChange === 'function') {
        onChange(e)
      }
    }

    const handleAutocompleteChange = (newValue: string) => {
      onValueChange?.(newValue)
      
      // React-hook-form's onChange needs an event
      if (onChange && typeof onChange === 'function') {
        // Debug: Check if we have a name
        const effectiveName = fieldName || ''
        
        if (!effectiveName) {
          console.warn('MobileInput: name prop is missing. This is required when using with react-hook-form.')
        }
        
        try {
          // Create a minimal but complete event
          const event = {
            target: { 
              value: newValue,
              name: effectiveName,
              type: 'text',
            },
            currentTarget: { 
              value: newValue,
              name: effectiveName,
              type: 'text',
            },
            type: 'change',
            preventDefault: () => {},
            stopPropagation: () => {},
            persist: () => {}
          } as React.ChangeEvent<HTMLInputElement>
          
          onChange(event)
        } catch (error) {
          console.error('MobileInput handleAutocompleteChange error:', error)
          console.error('Field name:', effectiveName)
          console.error('Value:', newValue)
        }
      }
    }

    const shouldUseAutocomplete = enableAutocomplete && (isMobile || detectedMobile)

    if (shouldUseAutocomplete) {
      return (
        <MobileAutocomplete
          ref={ref}
          name={fieldName}
          value={value as string || ''}
          onChange={handleAutocompleteChange}
          onBlur={onBlur}
          type={autocompleteType}
          options={[]}
          {...props}
        />
      )
    }

    return (
      <Input
        ref={ref}
        name={fieldName}
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        {...props}
      />
    )
  }
)

MobileInput.displayName = 'MobileInput'