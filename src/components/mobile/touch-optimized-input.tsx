'use client'

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { VoiceInputButton } from './voice-input-button'

interface TouchOptimizedInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  showVoiceInput?: boolean
  onVoiceInput?: (text: string) => void
}

export const TouchOptimizedInput = forwardRef<HTMLInputElement, TouchOptimizedInputProps>(
  ({ className, label, error, helperText, showVoiceInput, onVoiceInput, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-base font-medium text-gray-900 block">
            {label}
          </label>
        )}
        
        <div className="relative">
          <input
            ref={ref}
            className={cn(
              // Base styles
              'w-full rounded-lg border bg-white text-base',
              // Touch-optimized sizing (44px minimum height)
              'h-12 px-4',
              // Focus styles
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              // Error styles
              error ? 'border-red-500' : 'border-gray-300',
              // Voice input padding
              showVoiceInput && 'pr-14',
              className
            )}
            {...props}
          />
          
          {showVoiceInput && onVoiceInput && (
            <VoiceInputButton
              onTranscript={onVoiceInput}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
            />
          )}
        </div>
        
        {error && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <span className="inline-block w-1 h-1 bg-red-600 rounded-full" />
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p className="text-sm text-gray-600">{helperText}</p>
        )}
      </div>
    )
  }
)

TouchOptimizedInput.displayName = 'TouchOptimizedInput'

interface TouchOptimizedTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  showVoiceInput?: boolean
  onVoiceInput?: (text: string) => void
}

export const TouchOptimizedTextarea = forwardRef<HTMLTextAreaElement, TouchOptimizedTextareaProps>(
  ({ className, label, error, helperText, showVoiceInput, onVoiceInput, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-base font-medium text-gray-900 block">
            {label}
          </label>
        )}
        
        <div className="relative">
          <textarea
            ref={ref}
            className={cn(
              // Base styles
              'w-full rounded-lg border bg-white text-base',
              // Touch-optimized sizing
              'min-h-[120px] p-4',
              // Focus styles
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              // Error styles
              error ? 'border-red-500' : 'border-gray-300',
              // Voice input padding
              showVoiceInput && 'pr-14',
              // Resize control
              'resize-y',
              className
            )}
            {...props}
          />
          
          {showVoiceInput && onVoiceInput && (
            <VoiceInputButton
              onTranscript={onVoiceInput}
              className="absolute right-2 top-4 h-8 w-8"
            />
          )}
        </div>
        
        {error && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <span className="inline-block w-1 h-1 bg-red-600 rounded-full" />
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p className="text-sm text-gray-600">{helperText}</p>
        )}
      </div>
    )
  }
)

TouchOptimizedTextarea.displayName = 'TouchOptimizedTextarea'

// Touch-optimized select component
interface TouchOptimizedSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  options: { value: string; label: string }[]
}

export const TouchOptimizedSelect = forwardRef<HTMLSelectElement, TouchOptimizedSelectProps>(
  ({ className, label, error, helperText, options, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-base font-medium text-gray-900 block">
            {label}
          </label>
        )}
        
        <select
          ref={ref}
          className={cn(
            // Base styles
            'w-full rounded-lg border bg-white text-base',
            // Touch-optimized sizing (44px minimum height)
            'h-12 px-4',
            // Focus styles
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            // Error styles
            error ? 'border-red-500' : 'border-gray-300',
            // Select arrow
            'appearance-none bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%228%22%20viewBox%3D%220%200%2012%208%22%3E%3Cpath%20fill%3D%22%23374151%22%20d%3D%22M6%208L0%200h12z%22%2F%3E%3C%2Fsvg%3E")] bg-[position:right_1rem_center] bg-[size:12px] bg-no-repeat pr-10',
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {error && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <span className="inline-block w-1 h-1 bg-red-600 rounded-full" />
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p className="text-sm text-gray-600">{helperText}</p>
        )}
      </div>
    )
  }
)

TouchOptimizedSelect.displayName = 'TouchOptimizedSelect'