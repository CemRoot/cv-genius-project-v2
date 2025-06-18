'use client'

import { useEffect, useState } from 'react'

interface MobileAdsProps {
  position?: 'top' | 'bottom' | 'floating'
  className?: string
}

export function MobileAds({ position = 'bottom', className = '' }: MobileAdsProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // PropellerAds mobile configuration
    const script = document.createElement('script')
    script.type = 'text/javascript'
    
    const adConfig = {
      top: {
        key: 'REPLACE_WITH_MOBILE_TOP_KEY',
        width: 320,
        height: 50
      },
      bottom: {
        key: 'REPLACE_WITH_MOBILE_BOTTOM_KEY',
        width: 320,
        height: 50
      },
      floating: {
        key: 'REPLACE_WITH_MOBILE_FLOAT_KEY',
        width: 300,
        height: 250
      }
    }

    const config = adConfig[position]

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

    // Show ads after delay for better UX
    const timer = setTimeout(() => setIsVisible(true), 1500)

    return () => {
      clearTimeout(timer)
      try {
        document.head.removeChild(script)
        document.head.removeChild(adScript)
      } catch (e) {
        // Scripts already removed
      }
    }
  }, [position])

  const positionStyles = {
    top: 'sticky top-0 z-50 bg-white border-b shadow-sm',
    bottom: 'sticky bottom-0 z-50 bg-white border-t shadow-lg',
    floating: 'fixed bottom-20 right-4 z-50 shadow-2xl rounded-lg overflow-hidden'
  }

  const sizeStyles = {
    top: 'w-full h-[50px]',
    bottom: 'w-full h-[50px]',
    floating: 'w-[300px] h-[250px]'
  }

  if (!isVisible) return null

  return (
    <div className={`lg:hidden ${positionStyles[position]} ${className}`}>
      <div className={`${sizeStyles[position]} mx-auto bg-gray-100 border border-gray-200 flex items-center justify-center`}>
        <div className="text-center text-gray-500 text-xs">
          <div className="mb-1">📱 Mobile Ad</div>
          <div className="text-xs opacity-70">Loading...</div>
        </div>
      </div>
      
      {/* Close button for floating ads */}
      {position === 'floating' && (
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 w-6 h-6 bg-gray-800 text-white rounded-full text-xs flex items-center justify-center hover:bg-gray-900"
          aria-label="Close ad"
        >
          ×
        </button>
      )}
    </div>
  )
} 