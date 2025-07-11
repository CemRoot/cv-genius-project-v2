import React from 'react'
import { Input } from './input'

interface ColorPickerProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function ColorPicker({ value, onChange, className = '' }: ColorPickerProps) {
  return (
    <Input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`h-10 w-full cursor-pointer ${className}`}
    />
  )
}