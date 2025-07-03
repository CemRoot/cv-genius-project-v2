'use client'

import { forwardRef } from 'react'
import { Input } from '@/components/ui/input'

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
    ...props 
  }, ref) => {
    // For now, disable autocomplete entirely and just use regular Input
    // The autocomplete feature is causing issues with react-hook-form
    return (
      <Input
        ref={ref}
        {...props}
      />
    )
  }
)

MobileInput.displayName = 'MobileInput'