'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  FileText,
  Download,
  Eye,
  Settings,
  Palette,
  Layout,
  Type,
  Smartphone,
  MapPin,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { 
  generatePDFFromParsedData, 
  generatePDFFromScan,
  type PDFGenerationOptions,
  type PDFGenerationResult,
  type ParsedCVData 
} from '@/lib/pdf-generator'

interface PDFGeneratorPanelProps {
  parsedData?: ParsedCVData
  scannedImageData?: string
  onGenerated?: (result: PDFGenerationResult) => void
}

export default function PDFGeneratorPanel({ 
  parsedData, 
  scannedImageData, 
  onGenerated 
}: PDFGeneratorPanelProps) {
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<PDFGenerationResult | null>(null)
  const [options, setOptions] = useState<PDFGenerationOptions>({
    template: 'modern',
    includePhoto: false,
    colorScheme: 'blue',
    fontSize: 'medium',
    pageMargins: 'normal',
    includeBranding: true,
    optimizeForATS: true,
    dublinFocus: true
  })

  const handleGenerate = async () => {
    if (!parsedData && !scannedImageData) return

    setGenerating(true)
    try {
      let generationResult: PDFGenerationResult

      if (parsedData) {
        generationResult = await generatePDFFromParsedData(parsedData, options)
      } else if (scannedImageData) {
        generationResult = await generatePDFFromScan(scannedImageData, undefined, options)
      } else {
        throw new Error('No data to generate PDF from')
      }

      setResult(generationResult)
      onGenerated?.(generationResult)
    } catch (error) {
      console.error('PDF generation failed:', error)
      setResult({
        success: false,
        fileName: 'cv.pdf',
        error: error instanceof Error ? error.message : 'Unknown error',
        size: 0,
        pageCount: 0
      })
    } finally {
      setGenerating(false)
    }
  }

  const handleDownload = () => {
    if (result?.url) {
      const link = document.createElement('a')
      link.href = result.url
      link.download = result.fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handlePreview = () => {
    if (result?.url) {
      window.open(result.url, '_blank')
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const getTemplateDescription = (template: string): string => {
    switch (template) {
      case 'modern':
        return 'Clean, contemporary design with accent colors'
      case 'classic':
        return 'Traditional single-column layout'
      case 'minimal':
        return 'Ultra-clean design with maximum white space'
      case 'dublin-tech':
        return 'Optimized for Dublin tech industry roles'
      case 'dublin-corporate':
        return 'Professional design for corporate/finance roles'
      default:
        return 'Professional CV template'
    }
  }

  return (
    <div className="space-y-6">
      {/* Generation Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            PDF Generation Settings
          </CardTitle>
          <CardDescription>
            Customize your CV appearance and formatting options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Template Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Layout className="h-4 w-4" />
              <label className="text-sm font-medium">Template</label>
            </div>
            <Select 
              value={options.template} 
              onValueChange={(value: any) => setOptions(prev => ({ ...prev, template: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="modern">
                  <div>
                    <div className="font-medium">Modern</div>
                    <div className="text-xs text-gray-600">{getTemplateDescription('modern')}</div>
                  </div>
                </SelectItem>
                <SelectItem value="classic">
                  <div>
                    <div className="font-medium">Classic</div>
                    <div className="text-xs text-gray-600">{getTemplateDescription('classic')}</div>
                  </div>
                </SelectItem>
                <SelectItem value="minimal">
                  <div>
                    <div className="font-medium">Minimal</div>
                    <div className="text-xs text-gray-600">{getTemplateDescription('minimal')}</div>
                  </div>
                </SelectItem>
                <SelectItem value="dublin-tech">
                  <div>
                    <div className="font-medium">Dublin Tech</div>
                    <div className="text-xs text-gray-600">{getTemplateDescription('dublin-tech')}</div>
                  </div>
                </SelectItem>
                <SelectItem value="dublin-corporate">
                  <div>
                    <div className="font-medium">Dublin Corporate</div>
                    <div className="text-xs text-gray-600">{getTemplateDescription('dublin-corporate')}</div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Style Options */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Color Scheme */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                <label className="text-sm font-medium">Color Scheme</label>
              </div>
              <Select 
                value={options.colorScheme} 
                onValueChange={(value: any) => setOptions(prev => ({ ...prev, colorScheme: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blue">Blue (Professional)</SelectItem>
                  <SelectItem value="green">Green (Creative)</SelectItem>
                  <SelectItem value="purple">Purple (Modern)</SelectItem>
                  <SelectItem value="dark">Dark (Executive)</SelectItem>
                  <SelectItem value="professional">Professional (Navy)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Font Size */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                <label className="text-sm font-medium">Font Size</label>
              </div>
              <Select 
                value={options.fontSize} 
                onValueChange={(value: any) => setOptions(prev => ({ ...prev, fontSize: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small (Compact)</SelectItem>
                  <SelectItem value="medium">Medium (Standard)</SelectItem>
                  <SelectItem value="large">Large (Accessible)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Page Margins */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <label className="text-sm font-medium">Page Margins</label>
              </div>
              <Select 
                value={options.pageMargins} 
                onValueChange={(value: any) => setOptions(prev => ({ ...prev, pageMargins: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="narrow">Narrow (More content)</SelectItem>
                  <SelectItem value="normal">Normal (Balanced)</SelectItem>
                  <SelectItem value="wide">Wide (Clean look)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Toggle Options */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={options.optimizeForATS}
                  onChange={(e) => setOptions(prev => ({ ...prev, optimizeForATS: e.target.checked }))}
                  className="rounded"
                />
                <div>
                  <div className="text-sm font-medium">ATS Optimization</div>
                  <div className="text-xs text-gray-600">Format for applicant tracking systems</div>
                </div>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={options.dublinFocus}
                  onChange={(e) => setOptions(prev => ({ ...prev, dublinFocus: e.target.checked }))}
                  className="rounded"
                />
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <div>
                    <div className="text-sm font-medium">Dublin Job Focus</div>
                    <div className="text-xs text-gray-600">Optimize for Irish job market</div>
                  </div>
                </div>
              </label>
            </div>

            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={options.includeBranding}
                  onChange={(e) => setOptions(prev => ({ ...prev, includeBranding: e.target.checked }))}
                  className="rounded"
                />
                <div>
                  <div className="text-sm font-medium">Include Branding</div>
                  <div className="text-xs text-gray-600">Add CVGenius watermark</div>
                </div>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={options.includePhoto}
                  onChange={(e) => setOptions(prev => ({ ...prev, includePhoto: e.target.checked }))}
                  className="rounded"
                />
                <div>
                  <div className="text-sm font-medium">Include Photo</div>
                  <div className="text-xs text-gray-600">Add profile photo space</div>
                </div>
              </label>
            </div>
          </div>

          {/* Mobile Optimization Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Smartphone className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <div className="font-medium text-blue-900">Mobile Optimized</div>
                <div className="text-sm text-blue-700">
                  PDFs generated are optimized for mobile viewing and sharing. 
                  All templates are ATS-friendly and formatted for professional standards.
                </div>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <Button 
            onClick={handleGenerate} 
            disabled={(!parsedData && !scannedImageData) || generating}
            className="w-full"
            size="lg"
          >
            {generating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Generate PDF
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generation Result */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              Generation Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.success ? (
              <div className="space-y-4">
                {/* File Info */}
                <div className="grid md:grid-cols-3 gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-green-700">File Name</label>
                    <div className="text-sm text-green-900">{result.fileName}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-green-700">File Size</label>
                    <div className="text-sm text-green-900">{formatFileSize(result.size)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-green-700">Pages</label>
                    <div className="text-sm text-green-900">{result.pageCount}</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button onClick={handleDownload} className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button variant="outline" onClick={handlePreview}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </div>

                {/* Template Info */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Template: {options.template}</Badge>
                  <Badge variant="secondary">Color: {options.colorScheme}</Badge>
                  <Badge variant="secondary">Size: {options.fontSize}</Badge>
                  {options.optimizeForATS && <Badge variant="outline">ATS Optimized</Badge>}
                  {options.dublinFocus && <Badge variant="outline">Dublin Focused</Badge>}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-red-700 font-medium">Generation Failed</div>
                <div className="text-red-600 text-sm mt-1">{result.error}</div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleGenerate}
                  className="mt-3"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Preview Info */}
      {!parsedData && !scannedImageData && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <div className="font-medium">No Data Available</div>
              <div className="text-sm mt-1">
                Upload a CV or scan a document to generate a PDF
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}