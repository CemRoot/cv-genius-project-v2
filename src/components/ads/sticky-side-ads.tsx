'use client'

import { useEffect, useState } from 'react'
import { useAdConfig } from './dynamic-ad-manager'
import { X } from 'lucide-react'

export function StickySideAds() {
  const [isVisible, setIsVisible] = useState(false)
  const [leftClosed, setLeftClosed] = useState(false)
  const [rightClosed, setRightClosed] = useState(false)
  
  let getAdsByType
  try {
    ({ getAdsByType } = useAdConfig())
  } catch (error) {
    return null
  }

  useEffect(() => {
    const stickyAds = getAdsByType('sticky')
    
    if (stickyAds.length === 0) {
      return
    }

    const adConfig = stickyAds[0]
    const delay = adConfig.settings?.delay || 3000

    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [getAdsByType])

  if (!isVisible || (leftClosed && rightClosed)) return null

  return (
    <>
      {/* Left Sticky Ad */}
      {!leftClosed && (
        <div className="hidden xl:block fixed left-4 top-1/2 -translate-y-1/2 z-40">
          <div className="relative">
            <button
              onClick={() => setLeftClosed(true)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 shadow-lg z-10"
              aria-label="Close left ad"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-200">
              <div className="text-xs text-gray-500 text-center font-medium py-1 bg-gray-50">Advertisement</div>
              <div className="w-[160px] h-[600px] bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center">
                <div className="text-center p-4">
                  <div className="text-2xl mb-2">📌</div>
                  <div className="text-sm text-gray-600 font-medium">Sticky Ad</div>
                  <div className="text-xs text-gray-500 mt-1">160x600</div>
                  <div className="text-xs text-blue-600 mt-2">Google AdSense</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Right Sticky Ad */}
      {!rightClosed && (
        <div className="hidden xl:block fixed right-4 top-1/2 -translate-y-1/2 z-40">
          <div className="relative">
            <button
              onClick={() => setRightClosed(true)}
              className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 shadow-lg z-10"
              aria-label="Close right ad"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-200">
              <div className="text-xs text-gray-500 text-center font-medium py-1 bg-gray-50">Advertisement</div>
              <div className="w-[160px] h-[600px] bg-gradient-to-b from-green-50 to-blue-50 flex items-center justify-center">
                <div className="text-center p-4">
                  <div className="text-2xl mb-2">📍</div>
                  <div className="text-sm text-gray-600 font-medium">Sticky Ad</div>
                  <div className="text-xs text-gray-500 mt-1">160x600</div>
                  <div className="text-xs text-green-600 mt-2">Google AdSense</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 