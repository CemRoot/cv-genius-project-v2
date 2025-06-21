'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, FileText, Link as LinkIcon, Share2 } from 'lucide-react'

function ImportContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  
  const source = searchParams.get('source')
  const filename = searchParams.get('filename')
  const filetype = searchParams.get('type')
  const url = searchParams.get('url')
  const title = searchParams.get('title')
  const text = searchParams.get('text')

  useEffect(() => {
    // Auto-process if we have content to import
    if (source && (filename || url || text)) {
      handleAutoImport()
    }
  }, [source, filename, url, text])

  const handleAutoImport = async () => {
    setIsProcessing(true)
    
    try {
      if (filename) {
        // Handle file import
        console.log('Processing shared file:', filename, filetype)
        // TODO: Process uploaded file
        router.push('/ats-check')
      } else if (url) {
        // Handle URL import
        console.log('Processing shared URL:', url)
        // TODO: Fetch and process URL content
        router.push('/builder')
      } else if (text || title) {
        // Handle text import
        console.log('Processing shared text:', { title, text })
        // TODO: Pre-fill builder with text content
        router.push('/builder')
      }
    } catch (error) {
      console.error('Import failed:', error)
      setIsProcessing(false)
    }
  }

  const handleManualUpload = () => {
    router.push('/ats-check')
  }

  const handleStartBuilder = () => {
    router.push('/builder')
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">Processing shared content...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto pt-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Import Your CV
          </h1>
          <p className="text-lg text-gray-600">
            Get started by importing an existing CV or create a new one from scratch
          </p>
        </div>

        {/* Show import details if available */}
        {source && (
          <Card className="mb-6 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5 text-purple-600" />
                Shared Content Detected
              </CardTitle>
              <CardDescription>
                Content was shared with CVGenius from {source}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filename && (
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">File: {filename}</span>
                </div>
              )}
              {url && (
                <div className="flex items-center gap-2 mb-2">
                  <LinkIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">URL: {url}</span>
                </div>
              )}
              {title && (
                <div className="text-sm mb-2">
                  <strong>Title:</strong> {title}
                </div>
              )}
              {text && (
                <div className="text-sm">
                  <strong>Text:</strong> {text.substring(0, 100)}...
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Upload existing CV */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleManualUpload}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Upload className="h-6 w-6 text-purple-600" />
                Upload Existing CV
              </CardTitle>
              <CardDescription>
                Upload your current CV to check ATS compatibility and get improvement suggestions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Drop your CV here or click to browse
                  </p>
                  <p className="text-xs text-gray-500">
                    Supports PDF, DOC, DOCX files
                  </p>
                </div>
                <Button className="w-full" onClick={handleManualUpload}>
                  Check ATS Compatibility
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Create new CV */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleStartBuilder}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-purple-600" />
                Create New CV
              </CardTitle>
              <CardDescription>
                Build a professional CV from scratch using our AI-powered builder
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    Professional templates
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    AI-powered content suggestions
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    ATS-optimized formatting
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    Dublin job market focused
                  </div>
                </div>
                <Button className="w-full" variant="outline" onClick={handleStartBuilder}>
                  Start Building
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional features */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 mb-4">
            Not sure where to start? Check out our guides and examples
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/examples')}>
              View Examples
            </Button>
            <Button variant="ghost" size="sm" onClick={() => router.push('/guides')}>
              Read Guides
            </Button>
            <Button variant="ghost" size="sm" onClick={() => router.push('/templates')}>
              Browse Templates
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ImportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    }>
      <ImportContent />
    </Suspense>
  )
}