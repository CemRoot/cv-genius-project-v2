'use client'

import { v4 as uuidv4 } from 'uuid'

// Cloud storage configuration
export interface CloudStorageConfig {
  provider: 'local' | 'cloudinary' | 's3' | 'firebase'
  maxFileSize: number // in bytes
  allowedTypes: string[]
  uploadEndpoint?: string
}

// Upload result interface
export interface UploadResult {
  url: string
  publicId: string
  size: number
  type: string
  fileName: string
  uploadedAt: Date
}

// Upload progress interface
export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

// Default configuration
const defaultConfig: CloudStorageConfig = {
  provider: 'local',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  uploadEndpoint: '/api/upload'
}

export class CloudStorage {
  private config: CloudStorageConfig

  constructor(config: Partial<CloudStorageConfig> = {}) {
    this.config = { ...defaultConfig, ...config }
  }

  // Validate file before upload
  private validateFile(file: File): void {
    if (file.size > this.config.maxFileSize) {
      throw new Error(`File size exceeds maximum allowed size of ${this.config.maxFileSize / 1024 / 1024}MB`)
    }

    if (!this.config.allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not allowed`)
    }
  }

  // Upload file with progress tracking
  async uploadFile(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    this.validateFile(file)

    switch (this.config.provider) {
      case 'local':
        return this.uploadToLocal(file, onProgress)
      case 'cloudinary':
        return this.uploadToCloudinary(file, onProgress)
      case 's3':
        return this.uploadToS3(file, onProgress)
      case 'firebase':
        return this.uploadToFirebase(file, onProgress)
      default:
        throw new Error(`Unsupported provider: ${this.config.provider}`)
    }
  }

  // Local upload (to server)
  private async uploadToLocal(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    const formData = new FormData()
    formData.append('file', file)

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress({
            loaded: e.loaded,
            total: e.total,
            percentage: Math.round((e.loaded / e.total) * 100)
          })
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText)
            resolve({
              url: response.url,
              publicId: response.publicId || uuidv4(),
              size: file.size,
              type: file.type,
              fileName: file.name,
              uploadedAt: new Date()
            })
          } catch (error) {
            reject(new Error('Invalid response from server'))
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`))
        }
      })

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'))
      })

      xhr.open('POST', this.config.uploadEndpoint!)
      xhr.send(formData)
    })
  }

  // Cloudinary upload
  private async uploadToCloudinary(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

    if (!cloudName || !uploadPreset) {
      throw new Error('Cloudinary configuration missing')
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', uploadPreset)

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress({
            loaded: e.loaded,
            total: e.total,
            percentage: Math.round((e.loaded / e.total) * 100)
          })
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText)
            resolve({
              url: response.secure_url,
              publicId: response.public_id,
              size: response.bytes,
              type: response.format,
              fileName: file.name,
              uploadedAt: new Date(response.created_at)
            })
          } catch (error) {
            reject(new Error('Invalid response from Cloudinary'))
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`))
        }
      })

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'))
      })

      xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/upload`)
      xhr.send(formData)
    })
  }

  // S3 upload (requires presigned URL)
  private async uploadToS3(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    // First get presigned URL from backend
    const presignedResponse = await fetch('/api/upload/s3/presigned', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size
      })
    })

    if (!presignedResponse.ok) {
      throw new Error('Failed to get presigned URL')
    }

    const { url, fields, publicId } = await presignedResponse.json()

    // Upload to S3
    const formData = new FormData()
    Object.entries(fields).forEach(([key, value]) => {
      formData.append(key, value as string)
    })
    formData.append('file', file)

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress({
            loaded: e.loaded,
            total: e.total,
            percentage: Math.round((e.loaded / e.total) * 100)
          })
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({
            url: `${url}/${publicId}`,
            publicId,
            size: file.size,
            type: file.type,
            fileName: file.name,
            uploadedAt: new Date()
          })
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`))
        }
      })

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'))
      })

      xhr.open('POST', url)
      xhr.send(formData)
    })
  }

  // Firebase Storage upload
  private async uploadToFirebase(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    // This would require Firebase SDK integration
    throw new Error('Firebase upload not implemented yet')
  }

  // Delete file from cloud storage
  async deleteFile(publicId: string): Promise<void> {
    const response = await fetch('/api/upload/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicId, provider: this.config.provider })
    })

    if (!response.ok) {
      throw new Error('Failed to delete file')
    }
  }

  // Get optimized image URL (for image files)
  getOptimizedImageUrl(url: string, options: {
    width?: number
    height?: number
    quality?: number
    format?: 'auto' | 'webp' | 'jpg' | 'png'
  } = {}): string {
    if (this.config.provider === 'cloudinary') {
      const { width, height, quality = 80, format = 'auto' } = options
      const transformations = []

      if (width) transformations.push(`w_${width}`)
      if (height) transformations.push(`h_${height}`)
      transformations.push(`q_${quality}`)
      transformations.push(`f_${format}`)

      // Extract cloud name and public ID from URL
      const urlParts = url.split('/')
      const uploadIndex = urlParts.indexOf('upload')
      
      if (uploadIndex !== -1) {
        urlParts.splice(uploadIndex + 1, 0, transformations.join(','))
        return urlParts.join('/')
      }
    }

    return url
  }
}

// Singleton instance
export const cloudStorage = new CloudStorage()

// React hook for file upload
export function useFileUpload(config?: Partial<CloudStorageConfig>) {
  const storage = new CloudStorage(config)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState<UploadProgress | null>(null)
  const [error, setError] = useState<string | null>(null)

  const uploadFile = async (file: File): Promise<UploadResult | null> => {
    setIsUploading(true)
    setError(null)
    setProgress(null)

    try {
      const result = await storage.uploadFile(file, (prog) => {
        setProgress(prog)
      })
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const reset = () => {
    setIsUploading(false)
    setProgress(null)
    setError(null)
  }

  return {
    uploadFile,
    isUploading,
    progress,
    error,
    reset
  }
}

// Utility to compress image before upload
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img

        // Calculate new dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width *= ratio
          height *= ratio
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'))
              return
            }

            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            })

            resolve(compressedFile)
          },
          'image/jpeg',
          quality
        )
      }

      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target?.result as string
    }

    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}