'use client'

import { useEffect } from 'react'

interface BannerAdsProps {
  className?: string
  size?: 'large' | 'medium' | 'small'
}

export function BannerAds({ className = '', size = 'large' }: BannerAdsProps) {
  useEffect(() => {
    // PropellerAds banner ad configuration
    const script = document.createElement('script')
    script.type = 'text/javascript'
    
    // Different sizes for different placements
    const adConfig = {
      large: {
        key: 'REPLACE_WITH_LARGE_BANNER_KEY',
        width: 728,
        height: 90
      },
      medium: {
        key: 'REPLACE_WITH_MEDIUM_BANNER_KEY', 
        width: 468,
        height: 60
      },
      small: {
        key: 'REPLACE_WITH_SMALL_BANNER_KEY',
        width: 320,
        height: 50
      }
    }

    const config = adConfig[size]

    script.innerHTML = `
      atOptions = {
        'key' : '${config.key}',
        'format' : 'iframe',
        'height' : ${config.height},
        'width' : ${config.width},
        'params' : {}
      };
    `
    document.head.appendChild(script)

    const adScript = document.createElement('script')
    adScript.type = 'text/javascript'
    adScript.src = `//www.topcreativeformat.com/${config.key}/invoke.js`
    document.head.appendChild(adScript)

    return () => {
      // Cleanup scripts
      try {
        document.head.removeChild(script)
        document.head.removeChild(adScript)
      } catch (e) {
        // Script already removed or doesn't exist
      }
    }
  }, [size])

  const sizeClasses = {
    large: 'w-full max-w-[728px] h-[90px]',
    medium: 'w-full max-w-[468px] h-[60px]', 
    small: 'w-full max-w-[320px] h-[50px]'
  }

  return (
    <div className={`${sizeClasses[size]} ${className} mx-auto`}>
      <div className="bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-sm">
        <div className="text-center">
          <div className="mb-1">📢 Advertisement</div>
          <div className="text-xs opacity-70">Content loading...</div>
        </div>
      </div>
    </div>
  )
} 