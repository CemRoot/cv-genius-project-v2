"use client"

import { useState, useCallback, useRef } from 'react'

export interface FileUploadState {
  files: File[]
  uploading: boolean
  progress: number
  error: string | null
  previewUrls: string[]
  uploadedUrls: string[]
}

export interface FileUploadOptions {
  accept?: string
  multiple?: boolean
  maxFileSize?: number // in bytes
  maxFiles?: number
  quality?: number // for image compression (0-1)
  maxWidth?: number // for image resizing
  maxHeight?: number // for image resizing
  enableCamera?: boolean
  enableGallery?: boolean
  enableDragDrop?: boolean
  autoUpload?: boolean
  compressionFormat?: 'jpeg' | 'webp' | 'png'
  onFileSelect?: (files: File[]) => void
  onUploadProgress?: (progress: number, file: File) => void
  onUploadComplete?: (urls: string[], files: File[]) => void
  onError?: (error: string) => void
}

export interface CameraOptions {
  facingMode?: 'user' | 'environment'
  width?: number
  height?: number
  quality?: number
}

const defaultOptions: Required<Omit<FileUploadOptions, 'onFileSelect' | 'onUploadProgress' | 'onUploadComplete' | 'onError'>> = {
  accept: 'image/*',
  multiple: false,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,
  quality: 0.8,
  maxWidth: 1920,
  maxHeight: 1080,
  enableCamera: true,
  enableGallery: true,
  enableDragDrop: true,
  autoUpload: false,
  compressionFormat: 'jpeg',
}

export function useMobileFileUpload(
  uploadFunction?: (files: File[]) => Promise<string[]>,
  options: FileUploadOptions = {}
) {
  const opts = { ...defaultOptions, ...options }
  
  const [state, setState] = useState<FileUploadState>({
    files: [],
    uploading: false,
    progress: 0,
    error: null,
    previewUrls: [],
    uploadedUrls: [],
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // File validation
  const validateFile = useCallback((file: File): string | null => {
    if (file.size > opts.maxFileSize) {
      return `File ${file.name} is too large. Maximum size is ${(opts.maxFileSize / 1024 / 1024).toFixed(1)}MB`
    }

    if (opts.accept && opts.accept !== '*/*') {
      const acceptedTypes = opts.accept.split(',').map(type => type.trim())
      const isValidType = acceptedTypes.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.replace('/*', '/'))
        }
        return file.type === type || file.name.toLowerCase().endsWith(type.replace('.', ''))
      })
      
      if (!isValidType) {
        return `File ${file.name} is not a supported type. Accepted types: ${opts.accept}`
      }
    }

    return null
  }, [opts.accept, opts.maxFileSize])

  // Image compression and resizing
  const compressImage = useCallback(async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        reject(new Error('Canvas context not available'))
        return
      }

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img
        const aspectRatio = width / height

        if (width > opts.maxWidth) {
          width = opts.maxWidth
          height = width / aspectRatio
        }

        if (height > opts.maxHeight) {
          height = opts.maxHeight
          width = height * aspectRatio
        }

        // Set canvas dimensions
        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: `image/${opts.compressionFormat}`,
                lastModified: Date.now(),
              })
              resolve(compressedFile)
            } else {
              reject(new Error('Compression failed'))
            }
          },
          `image/${opts.compressionFormat}`,
          opts.quality
        )
      }

      img.onerror = () => reject(new Error('Image loading failed'))
      img.src = URL.createObjectURL(file)
    })
  }, [opts.quality, opts.maxWidth, opts.maxHeight, opts.compressionFormat])

  // Process selected files
  const processFiles = useCallback(async (fileList: FileList | File[]): Promise<File[]> => {
    const files = Array.from(fileList)
    const validFiles: File[] = []
    let errorMessages: string[] = []

    // Validate file count
    if (files.length > opts.maxFiles) {
      errorMessages.push(`Too many files selected. Maximum is ${opts.maxFiles}`)
      return []
    }

    // Validate and process each file
    for (const file of files) {
      const validationError = validateFile(file)
      if (validationError) {
        errorMessages.push(validationError)
        continue
      }

      try {
        // Compress images if needed
        if (file.type.startsWith('image/')) {
          const compressedFile = await compressImage(file)
          validFiles.push(compressedFile)
        } else {
          validFiles.push(file)
        }
      } catch (error) {
        errorMessages.push(`Failed to process ${file.name}: ${error}`)
      }
    }

    if (errorMessages.length > 0) {
      const errorMessage = errorMessages.join('\n')
      setState(prev => ({ ...prev, error: errorMessage }))
      opts.onError?.(errorMessage)
    }

    return validFiles
  }, [opts, validateFile, compressImage])

  // Add files to state
  const addFiles = useCallback(async (files: File[]) => {
    const processedFiles = await processFiles(files)
    
    if (processedFiles.length === 0) return

    // Create preview URLs
    const previewUrls = processedFiles.map(file => 
      file.type.startsWith('image/') ? URL.createObjectURL(file) : ''
    )

    setState(prev => {
      const newFiles = opts.multiple 
        ? [...prev.files, ...processedFiles].slice(0, opts.maxFiles)
        : processedFiles

      const newPreviewUrls = opts.multiple
        ? [...prev.previewUrls, ...previewUrls].slice(0, opts.maxFiles)
        : previewUrls

      return {
        ...prev,
        files: newFiles,
        previewUrls: newPreviewUrls,
        error: null,
      }
    })

    opts.onFileSelect?.(processedFiles)

    // Auto upload if enabled
    if (opts.autoUpload && uploadFunction) {
      upload(processedFiles)
    }
  }, [opts, processFiles, uploadFunction])

  // File input handler
  const handleFileInput = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      addFiles(Array.from(files))
    }
    // Reset input value to allow selecting the same file again
    event.target.value = ''
  }, [addFiles])

  // Camera capture
  const startCamera = useCallback(async (options: CameraOptions = {}): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: options.facingMode || 'environment',
          width: { ideal: options.width || 1280 },
          height: { ideal: options.height || 720 }
        }
      })

      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      return true
    } catch (error) {
      const errorMessage = `Camera access failed: ${error}`
      setState(prev => ({ ...prev, error: errorMessage }))
      opts.onError?.(errorMessage)
      return false
    }
  }, [opts.onError])

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  // Capture photo from camera
  const capturePhoto = useCallback(async (): Promise<File | null> => {
    if (!videoRef.current || !canvasRef.current) {
      setState(prev => ({ ...prev, error: 'Camera not available' }))
      return null
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      setState(prev => ({ ...prev, error: 'Canvas not available' }))
      return null
    }

    // Set canvas size to video dimensions
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0)

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `photo-${Date.now()}.jpg`, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          })
          resolve(file)
        } else {
          resolve(null)
        }
      }, 'image/jpeg', opts.quality)
    })
  }, [opts.quality])

  // Upload files
  const upload = useCallback(async (filesToUpload?: File[]): Promise<string[]> => {
    if (!uploadFunction) {
      throw new Error('Upload function not provided')
    }

    const files = filesToUpload || state.files
    if (files.length === 0) {
      throw new Error('No files to upload')
    }

    setState(prev => ({ ...prev, uploading: true, progress: 0, error: null }))

    try {
      const uploadedUrls = await uploadFunction(files)
      
      setState(prev => ({
        ...prev,
        uploading: false,
        progress: 100,
        uploadedUrls,
      }))

      opts.onUploadComplete?.(uploadedUrls, files)
      return uploadedUrls
    } catch (error) {
      const errorMessage = `Upload failed: ${error}`
      setState(prev => ({
        ...prev,
        uploading: false,
        progress: 0,
        error: errorMessage,
      }))
      opts.onError?.(errorMessage)
      throw error
    }
  }, [uploadFunction, state.files, opts])

  // Clear files
  const clearFiles = useCallback(() => {
    // Revoke preview URLs to prevent memory leaks
    state.previewUrls.forEach(url => {
      if (url) URL.revokeObjectURL(url)
    })

    setState({
      files: [],
      uploading: false,
      progress: 0,
      error: null,
      previewUrls: [],
      uploadedUrls: [],
    })
  }, [state.previewUrls])

  // Remove specific file
  const removeFile = useCallback((index: number) => {
    setState(prev => {
      const newFiles = [...prev.files]
      const newPreviewUrls = [...prev.previewUrls]
      
      // Revoke preview URL
      if (newPreviewUrls[index]) {
        URL.revokeObjectURL(newPreviewUrls[index])
      }
      
      newFiles.splice(index, 1)
      newPreviewUrls.splice(index, 1)
      
      return {
        ...prev,
        files: newFiles,
        previewUrls: newPreviewUrls,
      }
    })
  }, [])

  // Trigger file input
  const openFileSelector = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return {
    // State
    ...state,
    
    // Refs for custom implementations
    fileInputRef,
    videoRef,
    canvasRef,
    
    // Actions
    addFiles,
    removeFile,
    clearFiles,
    upload,
    openFileSelector,
    
    // Camera functions
    startCamera,
    stopCamera,
    capturePhoto,
    isCameraActive: () => streamRef.current !== null,
    
    // File input props
    fileInputProps: {
      ref: fileInputRef,
      type: 'file',
      accept: opts.accept,
      multiple: opts.multiple,
      onChange: handleFileInput,
      style: { display: 'none' },
    },
    
    // Drag and drop handlers
    dragProps: opts.enableDragDrop ? {
      onDragOver: (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
      },
      onDragEnter: (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
      },
      onDragLeave: (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
      },
      onDrop: (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        
        const files = Array.from(e.dataTransfer.files)
        if (files.length > 0) {
          addFiles(files)
        }
      },
    } : {},
    
    // Utility functions
    isImage: (file: File) => file.type.startsWith('image/'),
    formatFileSize: (bytes: number) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },
  }
}

export default useMobileFileUpload