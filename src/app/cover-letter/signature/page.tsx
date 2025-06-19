'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Info, Upload } from 'lucide-react'
import { MainLayout } from '@/components/layout/main-layout'

const signatureFonts = [
  { name: 'Mrs Saint Delafield', value: 'Mrs Saint Delafield' },
  { name: 'Dancing Script', value: 'Dancing Script' },
  { name: 'Great Vibes', value: 'Great Vibes' },
  { name: 'Pacifico', value: 'Pacifico' },
  { name: 'Allura', value: 'Allura' }
]

export default function SignaturePage() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [activeTab, setActiveTab] = useState('type')
  
  // Type signature state
  const [typedSignature, setTypedSignature] = useState('')
  const [selectedFont, setSelectedFont] = useState(signatureFonts[0].value)
  const [signatureAlign, setSignatureAlign] = useState<'left' | 'center' | 'right'>('left')
  const [signatureColor, setSignatureColor] = useState('black')
  const [signatureSize, setSignatureSize] = useState<'small' | 'large'>('small')
  
  // Draw signature state
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawnSignature, setDrawnSignature] = useState<string | null>(null)
  
  // Upload signature state
  const [uploadedSignature, setUploadedSignature] = useState<string | null>(null)

  // Get user's name from localStorage
  useEffect(() => {
    const templateData = localStorage.getItem('cover-letter-template-data')
    if (templateData) {
      const data = JSON.parse(templateData)
      if (data.personalInfo) {
        setTypedSignature(`${data.personalInfo.firstName} ${data.personalInfo.lastName}`)
      }
    }
  }, [])

  // Canvas drawing functionality
  useEffect(() => {
    if (activeTab === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.lineWidth = 2
        ctx.lineCap = 'round'
        ctx.strokeStyle = 'black'
      }
    }
  }, [activeTab])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (canvas) {
      const rect = canvas.getBoundingClientRect()
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.beginPath()
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
      }
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (canvas) {
      const rect = canvas.getBoundingClientRect()
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
        ctx.stroke()
      }
    }
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    if (canvasRef.current) {
      setDrawnSignature(canvasRef.current.toDataURL())
    }
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        setDrawnSignature(null)
      }
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setUploadedSignature(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleContinue = () => {
    let signatureData = null
    
    if (activeTab === 'type' && typedSignature) {
      signatureData = {
        type: 'typed',
        value: typedSignature,
        font: selectedFont,
        align: signatureAlign,
        color: signatureColor,
        size: signatureSize
      }
    } else if (activeTab === 'draw' && drawnSignature) {
      signatureData = {
        type: 'drawn',
        value: drawnSignature
      }
    } else if (activeTab === 'upload' && uploadedSignature) {
      signatureData = {
        type: 'uploaded',
        value: uploadedSignature
      }
    }
    
    if (signatureData) {
      localStorage.setItem('cover-letter-signature', JSON.stringify(signatureData))
      router.push('/cover-letter/results')
    }
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Add your signature
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              You can get a preview of your signature here and make changes to it later, if needed.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="p-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="type">Type</TabsTrigger>
              <TabsTrigger value="draw">Draw</TabsTrigger>
              <TabsTrigger value="upload">Upload</TabsTrigger>
            </TabsList>

            <TabsContent value="type" className="space-y-6 mt-6">
              <div>
                <Label htmlFor="signature-text">Signature Text</Label>
                <Input
                  id="signature-text"
                  value={typedSignature}
                  onChange={(e) => setTypedSignature(e.target.value)}
                  placeholder="Enter your signature"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="font-select">Signature Font</Label>
                <Select value={selectedFont} onValueChange={setSelectedFont}>
                  <SelectTrigger id="font-select" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {signatureFonts.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        <span style={{ fontFamily: font.value }}>{font.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Alignment</Label>
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant={signatureAlign === 'left' ? 'default' : 'outline'}
                      onClick={() => setSignatureAlign('left')}
                    >
                      Left
                    </Button>
                    <Button
                      size="sm"
                      variant={signatureAlign === 'center' ? 'default' : 'outline'}
                      onClick={() => setSignatureAlign('center')}
                    >
                      Center
                    </Button>
                    <Button
                      size="sm"
                      variant={signatureAlign === 'right' ? 'default' : 'outline'}
                      onClick={() => setSignatureAlign('right')}
                    >
                      Right
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Color</Label>
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant={signatureColor === 'black' ? 'default' : 'outline'}
                      onClick={() => setSignatureColor('black')}
                    >
                      Black
                    </Button>
                    <Button
                      size="sm"
                      variant={signatureColor === '#2027aa' ? 'default' : 'outline'}
                      onClick={() => setSignatureColor('#2027aa')}
                      style={{ color: '#2027aa' }}
                    >
                      Blue
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Size</Label>
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant={signatureSize === 'small' ? 'default' : 'outline'}
                      onClick={() => setSignatureSize('small')}
                    >
                      A
                    </Button>
                    <Button
                      size="sm"
                      variant={signatureSize === 'large' ? 'default' : 'outline'}
                      onClick={() => setSignatureSize('large')}
                    >
                      <span className="text-lg">A</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <p className="text-sm text-gray-500 mb-2">Preview:</p>
                <div className={`text-${signatureAlign}`}>
                  <span 
                    style={{ 
                      fontFamily: selectedFont, 
                      color: signatureColor,
                      fontSize: signatureSize === 'large' ? '24px' : '18px'
                    }}
                  >
                    {typedSignature || 'Your Signature'}
                  </span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="draw" className="space-y-6 mt-6">
              <div>
                <Label>Draw your signature below</Label>
                <div className="mt-2 border-2 border-gray-300 rounded-lg overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={200}
                    className="w-full bg-white cursor-crosshair"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearCanvas}
                  className="mt-2"
                >
                  Clear
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="upload" className="space-y-6 mt-6">
              <div>
                <div className="flex items-start gap-2 mb-4">
                  <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div className="text-sm text-gray-600">
                    <p className="font-semibold mb-1">Signature upload guidelines</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>A jpeg, jpg, png or gif format</li>
                      <li>Dimensions of 10 cm x 2.6 cm</li>
                      <li>A high resolution image</li>
                      <li>A file size of less than 5 MB</li>
                      <li>Black or blue font color for good contrast</li>
                    </ul>
                  </div>
                </div>

                <Label htmlFor="file-upload" className="cursor-pointer">
                  <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <span className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                          Upload a file
                        </span>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                </Label>

                {uploadedSignature && (
                  <div className="mt-4 border rounded-lg p-4 bg-gray-50">
                    <p className="text-sm text-gray-500 mb-2">Preview:</p>
                    <img src={uploadedSignature} alt="Uploaded signature" className="max-h-20" />
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-8 flex gap-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={handleContinue}
              disabled={
                (activeTab === 'type' && !typedSignature) ||
                (activeTab === 'draw' && !drawnSignature) ||
                (activeTab === 'upload' && !uploadedSignature)
              }
              className="flex-1"
            >
              Continue
            </Button>
          </div>
        </Card>
      </div>
      </div>
    </MainLayout>
  )
}