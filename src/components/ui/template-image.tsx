'use client'

import React, { useState } from 'react'
import Image from 'next/image'

interface TemplateImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
}

export function TemplateImage({ 
  src, 
  alt, 
  width = 600, 
  height = 800, 
  className = '',
  priority = false 
}: TemplateImageProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const handleError = () => {
    setImageError(true)
  }

  const handleLoad = () => {
    setImageLoaded(true)
  }

  // Use placeholder SVG if original image fails to load
  const imageSrc = imageError ? '/img/previews/placeholder.svg' : src

  return (
    <div className={`relative overflow-hidden bg-gray-100 ${className}`}>
      <Image
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onError={handleError}
        onLoad={handleLoad}
        priority={priority}
        style={{
          objectFit: 'cover',
          width: '100%',
          height: '100%'
        }}
      />
      
      {/* Loading placeholder */}
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <div className="w-8 h-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
            <span className="text-sm">Loading preview...</span>
          </div>
        </div>
      )}
    </div>
  )
} 