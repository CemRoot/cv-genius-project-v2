'use client'

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { useResponsive } from '@/hooks/use-responsive'
import { getTouchTargetSize } from '@/lib/responsive'
import { ResponsiveLabel, ResponsiveCaption } from './responsive-text'

interface ResponsiveInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  fullWidth?: boolean
}

export const ResponsiveInput = forwardRef<HTMLInputElement, ResponsiveInputProps>(
  ({ className, label, error, helperText, fullWidth = true, id, ...props }, ref) => {
    const { deviceCategory } = useResponsive()
    const minHeight = getTouchTargetSize(deviceCategory)
    
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
    
    return (
      <div className={cn('space-y-1', fullWidth && 'w-full')}>
        {label && (
          <ResponsiveLabel 
            htmlFor={inputId}
            required={props.required}
          >
            {label}
          </ResponsiveLabel>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'rounded-lg border bg-white px-3 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            error ? 'border-red-500' : 'border-gray-300',
            deviceCategory === 'mobile' ? 'text-base' : 'text-sm',
            fullWidth && 'w-full',
            className
          )}
          style={{ minHeight: `${minHeight}px` }}
          {...props}
        />
        
        {error && (
          <ResponsiveCaption variant="error">
            {error}
          </ResponsiveCaption>
        )}
        
        {helperText && !error && (
          <ResponsiveCaption>
            {helperText}
          </ResponsiveCaption>
        )}
      </div>
    )
  }
)

ResponsiveInput.displayName = 'ResponsiveInput'

interface ResponsiveTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  fullWidth?: boolean
  minRows?: number
}

export const ResponsiveTextarea = forwardRef<HTMLTextAreaElement, ResponsiveTextareaProps>(
  ({ className, label, error, helperText, fullWidth = true, minRows = 3, id, ...props }, ref) => {
    const { deviceCategory } = useResponsive()
    
    const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`
    
    return (
      <div className={cn('space-y-1', fullWidth && 'w-full')}>
        {label && (
          <ResponsiveLabel 
            htmlFor={inputId}
            required={props.required}
          >
            {label}
          </ResponsiveLabel>
        )}
        
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'rounded-lg border bg-white px-3 py-2 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'resize-y',
            error ? 'border-red-500' : 'border-gray-300',
            deviceCategory === 'mobile' ? 'text-base' : 'text-sm',
            fullWidth && 'w-full',
            className
          )}
          rows={minRows}
          {...props}
        />
        
        {error && (
          <ResponsiveCaption variant="error">
            {error}
          </ResponsiveCaption>
        )}
        
        {helperText && !error && (
          <ResponsiveCaption>
            {helperText}
          </ResponsiveCaption>
        )}
      </div>
    )
  }
)

ResponsiveTextarea.displayName = 'ResponsiveTextarea'

interface ResponsiveSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  fullWidth?: boolean
  options: Array<{ value: string; label: string }>
  placeholder?: string
}

export const ResponsiveSelect = forwardRef<HTMLSelectElement, ResponsiveSelectProps>(
  ({ 
    className, 
    label, 
    error, 
    helperText, 
    fullWidth = true, 
    options, 
    placeholder,
    id,
    ...props 
  }, ref) => {
    const { deviceCategory } = useResponsive()
    const minHeight = getTouchTargetSize(deviceCategory)
    
    const inputId = id || `select-${Math.random().toString(36).substr(2, 9)}`
    
    return (
      <div className={cn('space-y-1', fullWidth && 'w-full')}>
        {label && (
          <ResponsiveLabel 
            htmlFor={inputId}
            required={props.required}
          >
            {label}
          </ResponsiveLabel>
        )}
        
        <select
          ref={ref}
          id={inputId}
          className={cn(
            'rounded-lg border bg-white px-3 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'appearance-none bg-[url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik02IDhMMCA2LjkzODc0ZS0wN0wxMiAwTDYgOFoiIGZpbGw9IiM2QjcyODAiLz4KPC9zdmc+)] bg-[position:right_0.75rem_center] bg-[size:12px] bg-no-repeat pr-10',
            error ? 'border-red-500' : 'border-gray-300',
            deviceCategory === 'mobile' ? 'text-base' : 'text-sm',
            fullWidth && 'w-full',
            className
          )}
          style={{ minHeight: `${minHeight}px` }}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {error && (
          <ResponsiveCaption variant="error">
            {error}
          </ResponsiveCaption>
        )}
        
        {helperText && !error && (
          <ResponsiveCaption>
            {helperText}
          </ResponsiveCaption>
        )}
      </div>
    )
  }
)

ResponsiveSelect.displayName = 'ResponsiveSelect'

// Responsive checkbox
interface ResponsiveCheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helperText?: string
}

export const ResponsiveCheckbox = forwardRef<HTMLInputElement, ResponsiveCheckboxProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const { deviceCategory } = useResponsive()
    const targetSize = getTouchTargetSize(deviceCategory)
    
    const inputId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`
    
    return (
      <div className="space-y-1">
        <label 
          htmlFor={inputId}
          className="flex items-start cursor-pointer"
          style={{ minHeight: `${targetSize}px` }}
        >
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            className={cn(
              'mt-1 rounded border-gray-300 text-blue-600',
              'focus:ring-2 focus:ring-blue-500 focus:ring-offset-0',
              deviceCategory === 'mobile' ? 'w-5 h-5' : 'w-4 h-4',
              error && 'border-red-500',
              className
            )}
            {...props}
          />
          <span className={cn(
            'ml-2 select-none',
            deviceCategory === 'mobile' ? 'text-base' : 'text-sm'
          )}>
            {label}
          </span>
        </label>
        
        {error && (
          <ResponsiveCaption variant="error" className="ml-7">
            {error}
          </ResponsiveCaption>
        )}
        
        {helperText && !error && (
          <ResponsiveCaption className="ml-7">
            {helperText}
          </ResponsiveCaption>
        )}
      </div>
    )
  }
)

ResponsiveCheckbox.displayName = 'ResponsiveCheckbox'

// Responsive radio group
interface ResponsiveRadioOption {
  value: string
  label: string
  disabled?: boolean
}

interface ResponsiveRadioGroupProps {
  name: string
  label?: string
  options: ResponsiveRadioOption[]
  value?: string
  onChange?: (value: string) => void
  error?: string
  helperText?: string
  orientation?: 'horizontal' | 'vertical'
}

export function ResponsiveRadioGroup({
  name,
  label,
  options,
  value,
  onChange,
  error,
  helperText,
  orientation = 'vertical'
}: ResponsiveRadioGroupProps) {
  const { deviceCategory } = useResponsive()
  const targetSize = getTouchTargetSize(deviceCategory)
  
  return (
    <div className="space-y-2">
      {label && (
        <ResponsiveLabel>
          {label}
        </ResponsiveLabel>
      )}
      
      <div className={cn(
        'flex',
        orientation === 'vertical' ? 'flex-col space-y-2' : 'flex-row flex-wrap gap-4'
      )}>
        {options.map((option) => (
          <label 
            key={option.value}
            className="flex items-center cursor-pointer"
            style={{ minHeight: `${targetSize}px` }}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange?.(e.target.value)}
              disabled={option.disabled}
              className={cn(
                'rounded-full border-gray-300 text-blue-600',
                'focus:ring-2 focus:ring-blue-500 focus:ring-offset-0',
                deviceCategory === 'mobile' ? 'w-5 h-5' : 'w-4 h-4',
                error && 'border-red-500'
              )}
            />
            <span className={cn(
              'ml-2 select-none',
              deviceCategory === 'mobile' ? 'text-base' : 'text-sm',
              option.disabled && 'text-gray-400'
            )}>
              {option.label}
            </span>
          </label>
        ))}
      </div>
      
      {error && (
        <ResponsiveCaption variant="error">
          {error}
        </ResponsiveCaption>
      )}
      
      {helperText && !error && (
        <ResponsiveCaption>
          {helperText}
        </ResponsiveCaption>
      )}
    </div>
  )
}