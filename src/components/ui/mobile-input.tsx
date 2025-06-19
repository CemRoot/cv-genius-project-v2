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
    const [inputValue, setInputValue] = useState(value as string || '')
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

    // Update local state when external value changes
    useEffect(() => {
      setInputValue(value as string || '')
    }, [value])

    const handleChange = (newValue: string) => {
      setInputValue(newValue)
      onValueChange?.(newValue)
      
      // Call original onChange if provided
      if (onChange) {
        const syntheticEvent = {
          target: { value: newValue },
          currentTarget: { value: newValue }
        } as React.ChangeEvent<HTMLInputElement>
        onChange(syntheticEvent)
      }
    }

    const shouldUseAutocomplete = enableAutocomplete && (isMobile || detectedMobile)

    if (shouldUseAutocomplete) {
      return (
        <MobileAutocomplete
          ref={ref}
          value={inputValue}
          onChange={handleChange}
          type={autocompleteType}
          options={[]}
          {...props}
        />
      )
    }

    return (
      <Input
        ref={ref}
        value={inputValue}
        onChange={(e) => handleChange(e.target.value)}
        {...props}
      />
    )
  }
)

MobileInput.displayName = 'MobileInput'