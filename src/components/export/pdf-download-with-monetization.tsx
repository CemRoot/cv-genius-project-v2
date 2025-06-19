'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface PDFDownloadWithMonetizationProps {
  onDownload: () => Promise<void> | void
  children: React.ReactNode
  monetizationEnabled?: boolean
  redirectUrl?: string
  redirectDelay?: number // seconds
  className?: string
}

const PDFDownloadWithMonetization = ({ 
  onDownload, 
  children, 
  monetizationEnabled = false,
  redirectUrl,
  redirectDelay = 3,
  className 
}: PDFDownloadWithMonetizationProps) => {
  const [isDownloading, setIsDownloading] = useState(false)
  const [showRedirectCountdown, setShowRedirectCountdown] = useState(false)
  const [countdown, setCountdown] = useState(redirectDelay)

  const handleDownload = async () => {
    try {
      setIsDownloading(true)
      
      // Execute the actual download
      await onDownload()
      
      // Track successful download
      console.log('📥 PDF Download completed successfully')
      
      // If monetization is enabled, start countdown
      if (monetizationEnabled && redirectUrl) {
        setShowRedirectCountdown(true)
        
        // Start countdown
        let timeLeft = redirectDelay
        const countdownInterval = setInterval(() => {
          timeLeft -= 1
          setCountdown(timeLeft)
          
          if (timeLeft <= 0) {
            clearInterval(countdownInterval)
            
            // Trigger redirect
            console.log('💰 Monetization redirect triggered')
            
            // Option 1: PropuSH TrafficBack simulation
            if (redirectUrl.includes('propush') || redirectUrl.includes('monetization')) {
              // Use ProPush's redirect system
              const monetizationUrl = `${redirectUrl}?source=pdf_download&cv_downloaded=true&timestamp=${Date.now()}`
              window.open(monetizationUrl, '_blank')
            } else {
              // Regular redirect
              window.open(redirectUrl, '_blank')
            }
            
            setShowRedirectCountdown(false)
            setCountdown(redirectDelay)
          }
        }, 1000)
      }
      
    } catch (error) {
      console.error('PDF Download failed:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  const cancelRedirect = () => {
    setShowRedirectCountdown(false)
    setCountdown(redirectDelay)
  }

  return (
    <>
      <Button 
        onClick={handleDownload}
        disabled={isDownloading}
        className={className}
      >
        {isDownloading ? 'Downloading...' : children}
      </Button>

      {/* Monetization Countdown Modal */}
      {showRedirectCountdown && (
        <div className="fixed inset-0 z-[9999] bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-6 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                CV Downloaded Successfully! 🎉
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Thank you for using CVGenius. Redirecting to our partner in {countdown} seconds...
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${((redirectDelay - countdown) / redirectDelay) * 100}%` }}
                />
              </div>
              
              <button
                onClick={cancelRedirect}
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel ({countdown}s)
              </button>
            </div>

            <div className="mt-3 text-xs text-gray-500">
              This helps us keep CVGenius free for everyone
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default PDFDownloadWithMonetization 