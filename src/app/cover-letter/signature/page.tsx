'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Info, Upload } from 'lucide-react'
import { MainLayout } from '@/components/layout/main-layout'


export default function SignaturePage() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [activeTab, setActiveTab] = useState('draw')
  
  
  
  // Draw signature state
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawnSignature, setDrawnSignature] = useState<string | null>(null)
  
  // Upload signature state
  const [uploadedSignature, setUploadedSignature] = useState<string | null>(null)


  // Canvas drawing functionality with simplified scaling
  useEffect(() => {
    if (activeTab === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (ctx) {
        // Use simple 1:1 scaling for better touch responsiveness
        canvas.width = 600
        canvas.height = 200
        
        // Set CSS size to match
        canvas.style.width = '100%'
        canvas.style.height = '200px'
        
        // Configure drawing style
        ctx.lineWidth = 3
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.strokeStyle = 'black'
        ctx.imageSmoothingEnabled = true
        
        // Clear canvas
        ctx.clearRect(0, 0, 600, 200)
      }
    }
  }, [activeTab])

  const getCanvasCoordinates = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    
    const rect = canvas.getBoundingClientRect()
    
    // Scale coordinates from CSS pixels to canvas pixels
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    const x = (clientX - rect.left) * scaleX
    const y = (clientY - rect.top) * scaleY
    
    return { x, y }
  }

  const startDrawing = (clientX: number, clientY: number) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (canvas) {
      const coords = getCanvasCoordinates(clientX, clientY)
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.beginPath()
        ctx.moveTo(coords.x, coords.y)
      }
    }
  }

  const draw = (clientX: number, clientY: number) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (canvas) {
      const coords = getCanvasCoordinates(clientX, clientY)
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.lineTo(coords.x, coords.y)
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
        // Clear the entire canvas area
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
    
    if (activeTab === 'draw' && drawnSignature) {
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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="draw">✍️ Draw Signature</TabsTrigger>
              <TabsTrigger value="upload">📁 Upload Image</TabsTrigger>
            </TabsList>


            <TabsContent value="draw" className="space-y-6 mt-6">
              <div>
                <Label>Draw your signature below</Label>
                <div className="mt-2 border-2 border-gray-300 rounded-lg overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={200}
                    className="w-full bg-white cursor-crosshair"
                    style={{ touchAction: 'none' }}
                    onMouseDown={(e) => startDrawing(e.clientX, e.clientY)}
                    onMouseMove={(e) => draw(e.clientX, e.clientY)}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={(e) => {
                      e.preventDefault()
                      const touch = e.touches[0]
                      startDrawing(touch.clientX, touch.clientY)
                    }}
                    onTouchMove={(e) => {
                      e.preventDefault()
                      const touch = e.touches[0]
                      draw(touch.clientX, touch.clientY)
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault()
                      stopDrawing()
                    }}
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