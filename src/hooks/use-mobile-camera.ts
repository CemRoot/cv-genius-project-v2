'use client'

import { useState, useCallback, useRef } from 'react'

export interface CameraOptions {
  facingMode?: 'user' | 'environment'
  width?: number
  height?: number
  quality?: number // 0-1
  format?: 'image/jpeg' | 'image/png' | 'image/webp'
  enableFlash?: boolean
}

export interface CameraState {
  isActive: boolean
  isCapturing: boolean
  hasPermission: boolean | null
  error: string | null
  stream: MediaStream | null
  capturedImage: string | null
  deviceId?: string
}

export interface CameraDevice {
  deviceId: string
  label: string
  facing: 'user' | 'environment' | 'unknown'
}

const defaultOptions: Required<CameraOptions> = {
  facingMode: 'environment',
  width: 1920,
  height: 1080,
  quality: 0.8,
  format: 'image/jpeg',
  enableFlash: false
}

export function useMobileCamera(options: CameraOptions = {}) {
  const opts = { ...defaultOptions, ...options }
  
  const [state, setState] = useState<CameraState>({
    isActive: false,
    isCapturing: false,
    hasPermission: null,
    error: null,
    stream: null,
    capturedImage: null
  })

  const [availableDevices, setAvailableDevices] = useState<CameraDevice[]>([])
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Get available camera devices
  const getAvailableDevices = useCallback(async (): Promise<CameraDevice[]> => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')
      
      const cameraDevices: CameraDevice[] = videoDevices.map(device => ({
        deviceId: device.deviceId,
        label: device.label || `Camera ${device.deviceId.substring(0, 8)}`,
        facing: device.label.toLowerCase().includes('front') || device.label.toLowerCase().includes('user') 
          ? 'user' 
          : device.label.toLowerCase().includes('back') || device.label.toLowerCase().includes('environment')
          ? 'environment'
          : 'unknown'
      }))

      setAvailableDevices(cameraDevices)
      return cameraDevices
    } catch (error) {
      console.error('Error getting camera devices:', error)
      setState(prev => ({ ...prev, error: 'Failed to get camera devices' }))
      return []
    }
  }, [])

  // Request camera permission and start camera
  const startCamera = useCallback(async (deviceId?: string) => {
    try {
      setState(prev => ({ ...prev, isActive: true, error: null }))

      // Check for camera support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported on this device')
      }

      // Request permission and get stream
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: opts.facingMode,
          width: { ideal: opts.width },
          height: { ideal: opts.height },
          ...(deviceId && { deviceId: { exact: deviceId } })
        },
        audio: false
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      // Set video element source
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      setState(prev => ({
        ...prev,
        hasPermission: true,
        stream,
        error: null,
        deviceId
      }))

      // Get available devices after permission granted
      await getAvailableDevices()

    } catch (error: any) {
      console.error('Error starting camera:', error)
      
      let errorMessage = 'Failed to start camera'
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied'
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera found'
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Camera is being used by another application'
      }

      setState(prev => ({
        ...prev,
        isActive: false,
        hasPermission: false,
        error: errorMessage
      }))
    }
  }, [opts, getAvailableDevices])

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setState(prev => ({
      ...prev,
      isActive: false,
      stream: null,
      capturedImage: null
    }))
  }, [])

  // Capture photo
  const capturePhoto = useCallback((): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!videoRef.current || !canvasRef.current) {
        reject(new Error('Video or canvas element not available'))
        return
      }

      setState(prev => ({ ...prev, isCapturing: true }))

      try {
        const video = videoRef.current
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')

        if (!context) {
          throw new Error('Canvas context not available')
        }

        // Set canvas dimensions
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Convert to base64 image
        const imageData = canvas.toDataURL(opts.format, opts.quality)

        setState(prev => ({
          ...prev,
          capturedImage: imageData,
          isCapturing: false
        }))

        // Haptic feedback
        if ('vibrate' in navigator) {
          navigator.vibrate(50)
        }

        resolve(imageData)
      } catch (error) {
        setState(prev => ({
          ...prev,
          isCapturing: false,
          error: 'Failed to capture photo'
        }))
        reject(error)
      }
    })
  }, [opts.format, opts.quality])

  // Switch camera (front/back)
  const switchCamera = useCallback(async () => {
    const currentFacing = opts.facingMode
    const newFacing = currentFacing === 'user' ? 'environment' : 'user'
    
    // Find device with the desired facing mode
    const targetDevice = availableDevices.find(device => device.facing === newFacing)
    
    if (targetDevice) {
      stopCamera()
      setTimeout(() => {
        startCamera(targetDevice.deviceId)
      }, 100)
    } else {
      // Fallback: restart with new facing mode
      stopCamera()
      setTimeout(() => {
        opts.facingMode = newFacing
        startCamera()
      }, 100)
    }
  }, [availableDevices, opts, stopCamera, startCamera])

  // Toggle flash (if supported)
  const toggleFlash = useCallback(async () => {
    if (!streamRef.current) return

    const track = streamRef.current.getVideoTracks()[0]
    if (!track) return

    try {
      const capabilities = track.getCapabilities()
      if (capabilities.torch) {
        const settings = track.getSettings()
        await track.applyConstraints({
          advanced: [{ torch: !settings.torch } as any]
        })
      }
    } catch (error) {
      console.warn('Flash not supported:', error)
    }
  }, [])

  // Convert image to File object
  const imageToFile = useCallback((imageData: string, filename: string = 'captured-cv.jpg'): File => {
    const byteString = atob(imageData.split(',')[1])
    const mimeString = imageData.split(',')[0].split(':')[1].split(';')[0]
    
    const ab = new ArrayBuffer(byteString.length)
    const ia = new Uint8Array(ab)
    
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i)
    }
    
    return new File([ab], filename, { type: mimeString })
  }, [])

  // Clear captured image
  const clearCapture = useCallback(() => {
    setState(prev => ({ ...prev, capturedImage: null }))
  }, [])

  return {
    // State
    ...state,
    availableDevices,
    
    // Refs for components
    videoRef,
    canvasRef,
    
    // Control functions
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera,
    toggleFlash,
    clearCapture,
    getAvailableDevices,
    
    // Utility functions
    imageToFile,
    
    // Computed values
    canCapture: state.isActive && state.hasPermission && !state.isCapturing,
    canSwitchCamera: availableDevices.length > 1,
    isPortrait: window.innerHeight > window.innerWidth,
    
    // Camera info
    currentDevice: availableDevices.find(device => device.deviceId === state.deviceId),
    hasMultipleCameras: availableDevices.length > 1,
    
    // Error handling
    retryCamera: () => {
      setState(prev => ({ ...prev, error: null }))
      startCamera()
    }
  }
}

export default useMobileCamera