'use client'

import { useState, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Upload, 
  Camera,
  FileText,
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Smartphone,
  Cloud
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { CloudFileUpload } from '@/components/upload/cloud-file-upload'
import { useResponsive } from '@/hooks/use-responsive'

interface MobileUploadProps {
  onFileUpload: (file: File) => Promise<void>
}

export function MobileUpload({ onFileUpload }: MobileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    // Basic validation
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      setErrorMessage('File size must be less than 10MB')
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
      
      // Haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate(200)
      }
    } catch (error) {
      clearInterval(progressInterval)
      setUploadStatus('error')
      setErrorMessage('Failed to process file. Please try again.')
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
  }

  const uploadOptions = [
    {
      icon: <FileText className="w-8 h-8" />,
      title: 'Upload File',
      description: 'PDF or Word document',
      action: () => fileInputRef.current?.click()
    },
    {
      icon: <Camera className="w-8 h-8" />,
      title: 'Scan with Camera',
      description: 'Take a photo of your CV',
      action: () => cameraInputRef.current?.click()
    },
    {
      icon: <Cloud className="w-8 h-8" />,
      title: 'Cloud Storage',
      description: 'Google Drive, Dropbox',
      action: () => {
        // TODO: Implement cloud storage integration
        alert('Cloud storage integration coming soon!')
      }
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-6">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <Smartphone className="w-12 h-12 text-blue-600 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Upload Your CV
          </h1>
          <p className="text-gray-600">
            Choose how you'd like to import your existing CV
          </p>
        </div>

        <AnimatePresence mode="wait">
          {uploadStatus === 'idle' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {uploadOptions.map((option, index) => (
                <motion.button
                  key={option.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={option.action}
                  className="w-full"
                >
                  <Card className="p-6 hover:shadow-lg transition-shadow active:scale-95 transform">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        {option.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="font-semibold text-lg">{option.title}</h3>
                        <p className="text-sm text-gray-600">{option.description}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </Card>
                </motion.button>
              ))}
            </motion.div>
          )}

          {(uploadStatus === 'uploading' || uploadStatus === 'processing') && file && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card className="p-6">
                <div className="text-center mb-6">
                  <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-lg">
                    {uploadStatus === 'uploading' ? 'Uploading...' : 'Processing...'}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{file.name}</p>
                </div>

                <Progress value={uploadProgress} className="h-3 mb-4" />
                
                <p className="text-center text-sm text-gray-600">
                  {uploadStatus === 'uploading' 
                    ? 'Please wait while we upload your file' 
                    : 'Extracting information from your CV'
                  }
                </p>
              </Card>
            </motion.div>
          )}

          {uploadStatus === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="p-6 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-green-900 mb-2">
                  Success!
                </h3>
                <p className="text-gray-600 mb-6">
                  We've extracted your information. You can now review and edit it.
                </p>
                <Button onClick={resetUpload} variant="outline" className="w-full">
                  Upload Another File
                </Button>
              </Card>
            </motion.div>
          )}

          {uploadStatus === 'error' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Card className="p-6 text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-red-900 mb-2">
                  Upload Failed
                </h3>
                <p className="text-red-600 mb-6">{errorMessage}</p>
                <Button onClick={resetUpload} className="w-full">
                  Try Again
                </Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tips Section */}
        {uploadStatus === 'idle' && (
          <Card className="mt-6 p-4 bg-blue-50 border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload Tips
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• PDF format works best</li>
              <li>• Make sure text is clear and readable</li>
              <li>• File size should be under 10MB</li>
              <li>• Camera scan works for printed CVs</li>
            </ul>
          </Card>
        )}
      </div>

      {/* Skip Button - Fixed Bottom */}
      {uploadStatus === 'idle' && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
          <Button variant="ghost" className="w-full" onClick={resetUpload}>
            Skip Upload & Start Fresh
          </Button>
        </div>
      )}
    </div>
  )
}