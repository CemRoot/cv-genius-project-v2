'use client'

import { useState, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Upload, 
  File, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  FileText,
  X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface DragDropUploadProps {
  onFileUpload: (file: File) => Promise<void>
  acceptedFormats?: string[]
  maxSizeMB?: number
}

export function DragDropUpload({ 
  onFileUpload, 
  acceptedFormats = ['.pdf', '.doc', '.docx'],
  maxSizeMB = 10
}: DragDropUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): boolean => {
    // Check file size
    const maxSize = maxSizeMB * 1024 * 1024
    if (file.size > maxSize) {
      setErrorMessage(`File size must be less than ${maxSizeMB}MB`)
      return false
    }

    // Check file type
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`
    if (!acceptedFormats.includes(fileExtension)) {
      setErrorMessage(`File type not supported. Please upload ${acceptedFormats.join(', ')}`)
      return false
    }

    return true
  }

  const handleFile = async (file: File) => {
    if (!validateFile(file)) {
      setUploadStatus('error')
      return
    }

    setFile(file)
    setUploadStatus('uploading')
    setErrorMessage('')
    
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    try {
      await onFileUpload(file)
      setUploadProgress(100)
      setUploadStatus('success')
      clearInterval(progressInterval)
    } catch (error) {
      clearInterval(progressInterval)
      setUploadStatus('error')
      setErrorMessage('Failed to process file. Please try again.')
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFile(droppedFile)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFile(selectedFile)
    }
  }

  const resetUpload = () => {
    setFile(null)
    setUploadProgress(0)
    setUploadStatus('idle')
    setErrorMessage('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Card className="p-8">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold mb-2">Upload Your Existing CV</h3>
          <p className="text-sm text-gray-600">
            We'll extract your information to save you time
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />

        <AnimatePresence mode="wait">
          {uploadStatus === 'idle' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all
                ${isDragging 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }
              `}
            >
              <Upload className={`w-12 h-12 mx-auto mb-4 ${
                isDragging ? 'text-blue-500' : 'text-gray-400'
              }`} />
              
              <p className="text-lg font-medium mb-2">
                {isDragging ? 'Drop your file here' : 'Drag & drop your CV'}
              </p>
              
              <p className="text-sm text-gray-600 mb-4">
                or <span className="text-blue-600 hover:underline">browse files</span>
              </p>
              
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <span>Supported formats:</span>
                <span className="font-medium">{acceptedFormats.join(', ')}</span>
                <span>•</span>
                <span>Max {maxSizeMB}MB</span>
              </div>
            </motion.div>
          )}

          {(uploadStatus === 'uploading' || uploadStatus === 'processing') && file && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <FileText className="w-10 h-10 text-gray-400" />
                <div className="flex-1">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-gray-600">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{uploadStatus === 'uploading' ? 'Uploading' : 'Processing'}...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>

              <p className="text-sm text-gray-600 text-center">
                {uploadStatus === 'uploading' 
                  ? 'Uploading your CV...' 
                  : 'Extracting information from your CV...'
                }
              </p>
            </motion.div>
          )}

          {uploadStatus === 'success' && file && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <div>
                <h4 className="text-lg font-semibold text-green-900">Upload Successful!</h4>
                <p className="text-sm text-gray-600 mt-1">
                  We've extracted your information. You can now review and edit it.
                </p>
              </div>
              <Button onClick={resetUpload} variant="outline">
                Upload Another File
              </Button>
            </motion.div>
          )}

          {uploadStatus === 'error' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-4"
            >
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
              <div>
                <h4 className="text-lg font-semibold text-red-900">Upload Failed</h4>
                <p className="text-sm text-red-600 mt-1">{errorMessage}</p>
              </div>
              <Button onClick={resetUpload} variant="outline">
                Try Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* File Requirements */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Tips for best results:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use a well-formatted PDF or Word document</li>
            <li>• Ensure text is selectable (not scanned images)</li>
            <li>• Include clear section headers</li>
            <li>• Keep formatting simple and consistent</li>
          </ul>
        </div>
      </div>
    </Card>
  )
}