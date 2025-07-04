'use client'

import { useState, useEffect } from 'react'
import { Download, FileText, Clock, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface DownloadInterstitialProps {
  onComplete: () => void
  fileName?: string
  fileType?: 'pdf' | 'docx' | 'txt'
}

export function DownloadInterstitial({ onComplete, fileName = 'CV', fileType = 'pdf' }: DownloadInterstitialProps) {
  const [countdown, setCountdown] = useState(5)
  const [showAd, setShowAd] = useState(true)
  const [progress, setProgress] = useState(0)
  const [canDownload, setCanDownload] = useState(false)

  useEffect(() => {
    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 20
      })
    }, 1000)

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setCanDownload(true)
          clearInterval(countdownInterval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      clearInterval(progressInterval)
      clearInterval(countdownInterval)
    }
  }, [])

  const handleDownload = () => {
    if (canDownload) {
      setShowAd(false)
      onComplete()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-2 sm:p-4">
      <Card className="max-w-3xl w-full bg-white shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" />
              <div>
                <h2 className="text-lg sm:text-2xl font-bold">Preparing Your CV</h2>
                <p className="text-sm sm:text-base text-blue-100">Professional {fileType.toUpperCase()} format</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl sm:text-3xl font-bold">{countdown || '✓'}</div>
              <div className="text-xs sm:text-sm text-blue-100">
                {canDownload ? 'Ready!' : 'seconds'}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Processing...</span>
            <span className="text-sm font-medium text-gray-600">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Ad Space */}
        {showAd && (
          <div className="p-3 sm:p-6">
            <div className="text-xs text-gray-500 mb-2 sm:mb-3 text-center font-medium">Advertisement</div>
            
            {/* Desktop Ad */}
            <div className="hidden md:block">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg h-[300px] flex items-center justify-center border border-gray-200">
                <div className="text-center p-8">
                  <div className="text-5xl mb-4">💼</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Premium CV Templates</h3>
                  <p className="text-gray-600 mb-4">Get access to 50+ professional templates</p>
                  <div className="text-sm text-gray-500">728x300 - Google AdSense</div>
                </div>
              </div>
            </div>
            
            {/* Mobile Ad */}
            <div className="md:hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg h-[150px] sm:h-[200px] flex items-center justify-center border border-gray-200">
                <div className="text-center p-3 sm:p-4">
                  <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">📱</div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-1">Mobile Premium</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Professional templates</p>
                  <div className="text-xs text-gray-500">320x200 - Mobile Ad</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features while waiting */}
        <div className="px-3 sm:px-6 pb-4 sm:pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
              <span className="text-gray-700">ATS-friendly format</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
              <span className="text-gray-700">Professional design</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
              <span className="text-gray-700">High quality output</span>
            </div>
          </div>

          {/* Download Button */}
          <Button
            onClick={handleDownload}
            disabled={!canDownload}
            className={`w-full h-10 sm:h-12 text-sm sm:text-lg font-semibold transition-all touch-manipulation ${
              canDownload 
                ? 'bg-green-600 hover:bg-green-700 active:bg-green-800 text-white shadow-lg' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {canDownload ? (
              <>
                <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Download CV ({fileType.toUpperCase()})
              </>
            ) : (
              <>
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-pulse" />
                Please wait... ({countdown}s)
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  )
}