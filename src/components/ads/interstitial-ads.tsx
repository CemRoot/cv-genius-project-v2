'use client'

import { useEffect, useState } from 'react'
import { useAdConfig } from './dynamic-ad-manager'
import { X } from 'lucide-react'

interface InterstitialAdsProps {
  onClose?: () => void
  trigger?: boolean
}

export function InterstitialAds({ onClose, trigger = false }: InterstitialAdsProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [countdown, setCountdown] = useState(5)
  const [canClose, setCanClose] = useState(false)
  
  // Always call hooks unconditionally
  const adConfigHook = useAdConfig() ?? {}
  const getAdsByType = adConfigHook.getAdsByType ?? (() => [])
  
  // If context is not available, return null after hooks
  if (!adConfigHook.getAdsByType) {
    return null
  }

  useEffect(() => {
    if (!trigger) return

    const interstitialAds = getAdsByType('interstitial')
    
    if (interstitialAds.length === 0) {
      return
    }

    const adConfig = interstitialAds[0]
    const delay = adConfig.settings?.delay || 0

    const timer = setTimeout(() => {
      setIsVisible(true)
      
      // Countdown timer
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setCanClose(true)
            clearInterval(countdownInterval)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(countdownInterval)
    }, delay)

    return () => clearTimeout(timer)
  }, [trigger, getAdsByType])

  const handleClose = () => {
    if (canClose) {
      setIsVisible(false)
      onClose?.()
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      <div className="relative max-w-4xl w-full bg-white rounded-lg shadow-2xl overflow-hidden">
        {/* Close button / Countdown */}
        <div className="absolute top-4 right-4 z-10">
          {canClose ? (
            <button
              onClick={handleClose}
              className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              aria-label="Close advertisement"
            >
              <X className="w-6 h-6" />
            </button>
          ) : (
            <div className="w-10 h-10 bg-gray-800 text-white rounded-full flex items-center justify-center">
              <span className="font-bold">{countdown}</span>
            </div>
          )}
        </div>

        {/* Ad Content */}
        <div className="p-8">
          <div className="text-xs text-gray-500 mb-4 text-center font-medium">Advertisement</div>
          
          {/* Desktop Interstitial */}
          <div className="hidden md:block">
            <div className="h-[600px] bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🎯</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Premium Interstitial Ad</h2>
                <p className="text-gray-600 mb-4">Full page advertisement experience</p>
                <div className="text-sm text-gray-500">800x600 - High Impact Display</div>
              </div>
            </div>
          </div>
          
          {/* Mobile Interstitial */}
          <div className="md:hidden">
            <div className="h-[400px] bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl mb-3">📱</div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Mobile Interstitial</h2>
                <p className="text-sm text-gray-600 mb-3">Full screen mobile ad</p>
                <div className="text-xs text-gray-500">320x480 - Mobile Display</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}