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
    value,
    ...props 
  }, ref) => {
    const [detectedMobile, setDetectedMobile] = useState(false)

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
      onChange?.(e)
    }

    const handleAutocompleteChange = (newValue: string) => {
      onValueChange?.(newValue)
      
      // React-hook-form can handle both events and direct values
      // Try to call onChange with just the value first
      if (onChange) {
        try {
          // @ts-ignore - react-hook-form's onChange can accept a value directly
          onChange(newValue)
        } catch (error) {
          // If that fails, create a synthetic event
          const event = {
            target: { 
              value: newValue,
              name: props.name,
              id: props.id,
            },
            currentTarget: { 
              value: newValue,
              name: props.name,
              id: props.id,
            },
            type: 'change',
            preventDefault: () => {},
            stopPropagation: () => {}
          } as React.ChangeEvent<HTMLInputElement>
          onChange(event)
        }
      }
    }

    const shouldUseAutocomplete = enableAutocomplete && (isMobile || detectedMobile)

    if (shouldUseAutocomplete) {
      return (
        <MobileAutocomplete
          ref={ref}
          value={value as string || ''}
          onChange={handleAutocompleteChange}
          type={autocompleteType}
          options={[]}
          {...props}
        />
      )
    }

    return (
      <Input
        ref={ref}
        value={value}
        onChange={handleChange}
        {...props}
      />
    )
  }
)

MobileInput.displayName = 'MobileInput'