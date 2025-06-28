'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  X, 
  FileText, 
  Image as ImageIcon, 
  Loader2, 
  CheckCircle,
  AlertCircle,
  Cloud,
  HardDrive
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { useFileUpload, compressImage, CloudStorageConfig } from '@/lib/cloud-storage'
import { useResponsive } from '@/hooks/use-responsive'
import { ResponsiveText } from '@/components/responsive/responsive-text'

interface CloudFileUploadProps {
  onUpload: (result: { url: string; fileName: string; fileType: string }) => void
  accept?: string
  maxSize?: number // in MB
  compress?: boolean
  multiple?: boolean
  storageProvider?: CloudStorageConfig['provider']
  className?: string
}

export function CloudFileUpload({
  onUpload,
  accept = 'image/*,application/pdf',
  maxSize = 10,
  compress = true,
  multiple = false,
  storageProvider = 'local',
  className
}: CloudFileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const { isMobile } = useResponsive()

  const { uploadFile, isUploading, progress, error, reset } = useFileUpload({
    provider: storageProvider,
    maxFileSize: maxSize * 1024 * 1024
  })

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  // Handle drop
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    await handleFiles(droppedFiles)
  }, [])

  // Handle file selection
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      await handleFiles(selectedFiles)
    }
  }, [])

  // Process files
  const handleFiles = async (newFiles: File[]) => {
    reset()
    
    // Filter valid files
    const validFiles = multiple ? newFiles : [newFiles[0]]
    setFiles(validFiles)

    // Upload each file
    for (const file of validFiles) {
      let fileToUpload = file

      // Compress images if enabled
      if (compress && file.type.startsWith('image/')) {
        try {
          fileToUpload = await compressImage(file)
          console.log(`Compressed ${file.name} from ${file.size} to ${fileToUpload.size}`)
        } catch (err) {
          console.error('Compression failed:', err)
        }
      }

      // Upload file
      const result = await uploadFile(fileToUpload)
      
      if (result) {
        setUploadedUrls(prev => [...prev, result.url])
        onUpload({
          url: result.url,
          fileName: result.fileName,
          fileType: result.type
        })
      }
    }
  }

  // Remove file
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
    setUploadedUrls(prev => prev.filter((_, i) => i !== index))
  }

  // Get file icon
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return ImageIcon
    return FileText
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Drop zone */}
      <div
        className={cn(
          'relative rounded-lg border-2 border-dashed transition-colors',
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300',
          error ? 'border-red-500' : '',
          'cursor-pointer'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className={cn(
          'flex flex-col items-center justify-center',
          isMobile ? 'p-6' : 'p-8'
        )}>
          {isUploading ? (
            <>
              <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
              <ResponsiveText size="sm" className="text-gray-600 mb-2">
                Uploading to {storageProvider === 'local' ? 'server' : storageProvider}...
              </ResponsiveText>
              {progress && (
                <div className="w-full max-w-xs">
                  <Progress value={progress.percentage} className="mb-2" />
                  <p className="text-xs text-center text-gray-500">
                    {progress.percentage}%
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="relative mb-4">
                <Upload className="w-10 h-10 text-gray-400" />
                {storageProvider !== 'local' && (
                  <Cloud className="w-5 h-5 text-blue-500 absolute -top-1 -right-1" />
                )}
              </div>
              
              <ResponsiveText size={isMobile ? 'base' : 'sm'} className="text-gray-600 mb-2">
                {isMobile ? 'Tap to upload' : 'Drag & drop or click to upload'}
              </ResponsiveText>
              
              <ResponsiveText size="xs" className="text-gray-500">
                {accept.includes('image') && accept.includes('pdf')
                  ? 'Images or PDF files'
                  : accept.includes('image')
                  ? 'Image files only'
                  : 'PDF files only'}
                {' • '}Max {maxSize}MB
              </ResponsiveText>

              {compress && accept.includes('image') && (
                <ResponsiveText size="xs" className="text-gray-500 mt-1">
                  Images will be compressed automatically
                </ResponsiveText>
              )}
            </>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <ResponsiveText size="sm" className="text-red-700">
              {error}
            </ResponsiveText>
          </div>
        </motion.div>
      )}

      {/* File list */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 space-y-2"
          >
            {files.map((file, index) => {
              const Icon = getFileIcon(file.type)
              const isUploaded = uploadedUrls[index]

              return (
                <motion.div
                  key={`${file.name}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border',
                    isUploaded ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                  )}
                >
                  <Icon className={cn(
                    'w-8 h-8 flex-shrink-0',
                    isUploaded ? 'text-green-600' : 'text-gray-400'
                  )} />
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                      {isUploaded && (
                        <>
                          {' • '}
                          <span className="text-green-600">Uploaded</span>
                        </>
                      )}
                    </p>
                  </div>

                  {isUploaded ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFile(index)
                      }}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  )}
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Storage provider indicator */}
      {storageProvider !== 'local' && (
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
          <Cloud className="w-3 h-3" />
          <span>Files stored in {storageProvider}</span>
        </div>
      )}
    </div>
  )
}