'use client'

import React, { useEffect, useState } from 'react'
import { useMobileCamera } from '@/hooks/use-mobile-camera'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Camera, 
  RotateCcw, 
  FlashOn, 
  FlashOff, 
  X, 
  Check, 
  AlertCircle,
  Upload,
  RefreshCw
} from 'lucide-react'

interface MobileCameraScannerProps {
  onCapture: (imageData: string, file: File) => void
  onCancel: () => void
  className?: string
}

export function MobileCameraScanner({ 
  onCapture, 
  onCancel, 
  className = '' 
}: MobileCameraScannerProps) {
  const {
    isActive,
    isCapturing,
    hasPermission,
    error,
    capturedImage,
    availableDevices,
    canCapture,
    canSwitchCamera,
    currentDevice,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera,
    toggleFlash,
    clearCapture,
    imageToFile,
    retryCamera
  } = useMobileCamera({
    facingMode: 'environment',
    quality: 0.9,
    format: 'image/jpeg'
  })

  const [flashEnabled, setFlashEnabled] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Start camera on component mount
  useEffect(() => {
    startCamera()
    
    return () => {
      stopCamera()
    }
  }, [startCamera, stopCamera])

  const handleCapture = async () => {
    try {
      const imageData = await capturePhoto()
      const file = imageToFile(imageData, `cv-scan-${Date.now()}.jpg`)
      
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 100, 50])
      }
      
      onCapture(imageData, file)
    } catch (error) {
      console.error('Capture failed:', error)
    }
  }

  const handleFlashToggle = async () => {
    await toggleFlash()
    setFlashEnabled(!flashEnabled)
  }

  const handleRetake = () => {
    clearCapture()
  }

  const handleConfirm = async () => {
    if (!capturedImage) return
    
    setIsProcessing(true)
    
    try {
      const file = imageToFile(capturedImage, `cv-scan-${Date.now()}.jpg`)
      onCapture(capturedImage, file)
    } catch (error) {
      console.error('Processing failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  // Permission denied state
  if (hasPermission === false) {
    return (
      <div className={`fixed inset-0 bg-black z-50 flex items-center justify-center p-4 ${className}`}>
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Camera Permission Required</h3>
              <p className="text-sm text-muted-foreground mb-4">
                To scan your CV, we need access to your camera. Please allow camera access and try again.
              </p>
              <div className="space-y-2">
                <Button onClick={retryCamera} className="w-full">
                  <Camera className="h-4 w-4 mr-2" />
                  Request Camera Access
                </Button>
                <Button onClick={onCancel} variant="outline" className="w-full">
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={`fixed inset-0 bg-black z-50 flex items-center justify-center p-4 ${className}`}>
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Camera Error</h3>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <div className="space-y-2">
                <Button onClick={retryCamera} className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button onClick={onCancel} variant="outline" className="w-full">
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`fixed inset-0 bg-black z-50 ${className}`}>
      {/* Camera view or captured image */}
      <div className="relative w-full h-full">
        {!capturedImage ? (
          // Live camera view
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
              autoPlay
            />
            
            {/* Camera overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Viewfinder overlay */}
              <div className="absolute inset-4 border-2 border-white/50 rounded-lg">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-lg"></div>
              </div>
              
              {/* Instructions */}
              <div className="absolute top-safe bottom-32 left-4 right-4 flex items-center justify-center">
                <Card className="bg-black/70 border-white/20">
                  <CardContent className="p-4">
                    <p className="text-white text-center text-sm">
                      Position your CV within the frame and tap capture
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        ) : (
          // Captured image preview
          <img
            src={capturedImage}
            alt="Captured CV"
            className="w-full h-full object-cover"
          />
        )}

        {/* Top controls */}
        <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 bg-gradient-to-b from-black/50 to-transparent">
          <Button
            onClick={onCancel}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
          
          <div className="text-white text-sm">
            {capturedImage ? 'Preview' : 'Scan CV'}
          </div>
          
          {!capturedImage && canSwitchCamera && (
            <Button
              onClick={switchCamera}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
          {!capturedImage ? (
            // Camera controls
            <div className="flex items-center justify-center space-x-8">
              {/* Flash toggle */}
              <Button
                onClick={handleFlashToggle}
                variant="ghost"
                size="lg"
                className="text-white hover:bg-white/20 rounded-full w-14 h-14"
                disabled={!isActive}
              >
                {flashEnabled ? (
                  <FlashOn className="h-6 w-6" />
                ) : (
                  <FlashOff className="h-6 w-6" />
                )}
              </Button>

              {/* Capture button */}
              <Button
                onClick={handleCapture}
                disabled={!canCapture}
                className="w-20 h-20 rounded-full bg-white hover:bg-gray-100 text-black border-4 border-white/50"
              >
                <Camera className="h-8 w-8" />
              </Button>

              {/* Upload alternative */}
              <Button
                onClick={() => {
                  // Trigger file upload
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = 'image/*'
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onload = (e) => {
                        const imageData = e.target?.result as string
                        onCapture(imageData, file)
                      }
                      reader.readAsDataURL(file)
                    }
                  }
                  input.click()
                }}
                variant="ghost"
                size="lg"
                className="text-white hover:bg-white/20 rounded-full w-14 h-14"
              >
                <Upload className="h-6 w-6" />
              </Button>
            </div>
          ) : (
            // Preview controls
            <div className="flex items-center justify-center space-x-4">
              <Button
                onClick={handleRetake}
                variant="outline"
                className="flex-1 bg-black/50 border-white/30 text-white hover:bg-white/20"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake
              </Button>
              
              <Button
                onClick={handleConfirm}
                disabled={isProcessing}
                className="flex-1 bg-white text-black hover:bg-gray-100"
              >
                {isProcessing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                {isProcessing ? 'Processing...' : 'Use Photo'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

export default MobileCameraScanner