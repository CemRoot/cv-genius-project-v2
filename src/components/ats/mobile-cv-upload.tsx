"use client"

import { useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Camera, 
  Eye,
  Trash2,
  AlertTriangle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMobileFileUpload } from '@/hooks/use-mobile-file-upload'

interface MobileCVUploadProps {
  onTextExtracted: (text: string, fileName?: string) => void
  onError?: (error: string) => void
  className?: string
}

export function MobileCVUpload({ onTextExtracted, onError, className = '' }: MobileCVUploadProps) {
  const [extracting, setExtracting] = useState(false)
  const [previewText, setPreviewText] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  // Enhanced file upload hook for CV files
  const {
    files,
    uploading,
    error: uploadError,
    addFiles,
    clearFiles,
    removeFile,
    fileInputProps,
    dragProps,
    formatFileSize
  } = useMobileFileUpload(undefined, {
    accept: '.pdf,.doc,.docx,.txt',
    multiple: false,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 1,
    enableCamera: false,
    enableGallery: false,
    onFileSelect: handleFileSelect,
    onError: (error) => {
      onError?.(error)
    }
  })

  // File validation for CV uploads
  const validateCVFile = useCallback((file: File): string | null => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ]
    
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt']
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      return 'Please upload a PDF, DOC, DOCX, or TXT file'
    }
    
    if (file.size > 5 * 1024 * 1024) {
      return 'File size must be less than 5MB'
    }
    
    if (file.size < 1024) { // Less than 1KB
      return 'File appears to be too small to contain a CV'
    }
    
    return null
  }, [])

  // Extract text from different file types
  async function extractTextFromFile(file: File): Promise<string> {
    setExtracting(true)
    
    try {
      if (file.type === 'text/plain') {
        return await extractFromTextFile(file)
      } else if (file.type === 'application/pdf') {
        return await extractFromPDF(file)
      } else if (file.type.includes('word') || file.name.toLowerCase().endsWith('.docx') || file.name.toLowerCase().endsWith('.doc')) {
        return await extractFromWord(file)
      } else {
        throw new Error('Unsupported file type')
      }
    } finally {
      setExtracting(false)
    }
  }

  // Extract text from plain text file
  async function extractFromTextFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        if (text && text.trim().length > 50) {
          resolve(text.trim())
        } else {
          reject(new Error('File appears to be empty or too short'))
        }
      }
      reader.onerror = () => reject(new Error('Failed to read text file'))
      reader.readAsText(file)
    })
  }

  // PDF text extraction with client-side processing
  async function extractFromPDF(file: File): Promise<string> {
    try {
      // Try client-side PDF parsing first
      const pdfToText = (await import('react-pdftotext')).default
      
      const extractedText = await pdfToText(file)
      
      if (extractedText && extractedText.trim().length > 50) {
        const wordCount = extractedText.trim().split(/\s+/).length
        return `✅ PDF "${file.name}" processed successfully!\n📊 ${wordCount} words extracted\n\n${extractedText}`
      } else {
        throw new Error('Insufficient text extracted from PDF')
      }
      
    } catch (error) {
      console.error('Client-side PDF extraction failed, trying API fallback:', error)
      
      // Fallback to API if client-side parsing fails
      try {
        const arrayBuffer = await file.arrayBuffer()
        
        const response = await fetch('/api/parse-pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/octet-stream',
          },
          body: arrayBuffer
        })
        
        const result = await response.json()
        
        if (!response.ok || !result.success) {
          throw new Error(result.error || 'API PDF parsing failed')
        }
        
        const extractedText = result.text || ''
        const wordCount = result.wordCount || 0
        const pages = result.pages || 1
        
        return `✅ PDF "${file.name}" processed successfully!\n📊 ${pages} pages, ${wordCount} words\n\n${extractedText}`
        
      } catch (apiError) {
        console.error('API PDF extraction also failed:', apiError)
        
        // User-friendly error message
        return `📄 PDF "${file.name}" uploaded\n\n⚠️ PDF text extraction failed. This might be due to:\n• Scanned PDF (image-based)\n• Complex formatting\n• Password protection\n\n💡 For best ATS analysis results, please copy-paste your CV text manually into the text area below.`
      }
    }
  }

  // Basic Word document extraction (limited without proper DOCX library)
  async function extractFromWord(file: File): Promise<string> {
    // In a real application, you'd use a library like mammoth.js
    // For now, we'll provide a fallback message
    return Promise.resolve(
      `Word document "${file.name}" uploaded successfully.\n\n` +
      `For best results, please copy and paste your CV text directly into the text area below.\n\n` +
      `This ensures accurate ATS analysis and keyword matching.`
    )
  }

  async function handleFileSelect(selectedFiles: File[]) {
    if (selectedFiles.length === 0) return
    
    const file = selectedFiles[0]
    
    // Validate file
    const validationError = validateCVFile(file)
    if (validationError) {
      onError?.(validationError)
      clearFiles()
      return
    }
    
    try {
      const extractedText = await extractTextFromFile(file)
      setPreviewText(extractedText)
      onTextExtracted(extractedText, file.name)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to extract text from file'
      onError?.(errorMessage)
      clearFiles()
    }
  }

  const handleRemoveFile = () => {
    removeFile(0)
    setPreviewText(null)
    setShowPreview(false)
  }

  const getFileIcon = (fileName: string) => {
    const ext = fileName.toLowerCase().split('.').pop()
    switch (ext) {
      case 'pdf': return '📄'
      case 'doc':
      case 'docx': return '📝'
      case 'txt': return '📃'
      default: return '📄'
    }
  }

  const getFileTypeColor = (fileName: string) => {
    const ext = fileName.toLowerCase().split('.').pop()
    switch (ext) {
      case 'pdf': return 'bg-red-50 border-red-200 text-red-700'
      case 'doc':
      case 'docx': return 'bg-blue-50 border-blue-200 text-blue-700'
      case 'txt': return 'bg-gray-50 border-gray-200 text-gray-700'
      default: return 'bg-gray-50 border-gray-200 text-gray-700'
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      {files.length === 0 && (
        <Card>
          <CardContent className="p-0">
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-cvgenius-primary transition-colors cursor-pointer"
              {...dragProps}
              onClick={() => fileInputProps.ref.current?.click()}
            >
              <input {...fileInputProps} />
              <Upload className="h-8 w-8 mx-auto mb-3 text-gray-400" />
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                Upload Your CV
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                PDF, DOC, DOCX or TXT (max 5MB)
              </p>
              <Button variant="outline" size="sm">
                Choose File
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Preview */}
      {files.length > 0 && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="text-2xl">
                      {getFileIcon(files[0].name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {files[0].name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(files[0].size)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {extracting && (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    )}
                    {previewText && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPreview(!showPreview)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Preview
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveFile}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Extraction Status */}
                {extracting && (
                  <div className="mt-3 flex items-center space-x-2">
                    <Progress value={undefined} className="flex-1 h-2" />
                    <span className="text-xs text-gray-500">Extracting text...</span>
                  </div>
                )}

                {/* File Type Badge */}
                <div className="mt-3">
                  <Badge className={getFileTypeColor(files[0].name)}>
                    {files[0].name.split('.').pop()?.toUpperCase()} File
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Text Preview */}
      {previewText && showPreview && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium">Extracted Text Preview</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPreview(false)}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
                <div className="bg-gray-50 rounded-md p-3 max-h-48 overflow-y-auto">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                    {previewText.substring(0, 500)}
                    {previewText.length > 500 && '...'}
                  </pre>
                </div>
                {previewText.length > 500 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Showing first 500 characters of {previewText.length} total
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Upload Error */}
      {uploadError && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700"
        >
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm">{uploadError}</span>
        </motion.div>
      )}

      {/* Mobile Tips */}
      <div className="bg-blue-50 rounded-lg p-3">
        <h4 className="text-sm font-medium text-blue-900 mb-1">💡 Upload Tips</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Text is automatically extracted from PDF files</li>
          <li>• For best results, copy-paste your CV text</li>
          <li>• Your files are processed securely</li>
          <li>• Maximum file size: 5MB</li>
        </ul>
      </div>
    </div>
  )
}