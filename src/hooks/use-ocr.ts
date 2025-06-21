'use client'

import { useState, useCallback, useRef } from 'react'

export interface OCRResult {
  text: string
  confidence: number
  blocks: OCRBlock[]
  words: OCRWord[]
}

export interface OCRBlock {
  text: string
  confidence: number
  bbox: BoundingBox
  type: 'paragraph' | 'line' | 'word'
}

export interface OCRWord {
  text: string
  confidence: number
  bbox: BoundingBox
}

export interface BoundingBox {
  x0: number
  y0: number
  x1: number
  y1: number
}

export interface OCROptions {
  language?: string
  engineMode?: number
  pageSegMode?: number
  enableProgress?: boolean
  onProgress?: (progress: number) => void
  onError?: (error: string) => void
  preprocessing?: boolean
}

export interface OCRState {
  isProcessing: boolean
  progress: number
  isSupported: boolean
  error: string | null
  result: OCRResult | null
}

const defaultOptions: Required<OCROptions> = {
  language: 'eng',
  engineMode: 1, // Neural nets LSTM engine
  pageSegMode: 1, // Automatic page segmentation with OSD
  enableProgress: true,
  onProgress: () => {},
  onError: () => {},
  preprocessing: true
}

// CV-specific text patterns for better parsing
const CV_PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /(\+\d{1,3}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g,
  education: /\b(bachelor|master|phd|diploma|degree|university|college|education)\b/gi,
  experience: /\b(experience|work|employment|job|position|role)\b/gi,
  skills: /\b(skills|technologies|programming|software|tools)\b/gi,
  dates: /\b(19|20)\d{2}\b|\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(19|20)\d{2}\b/gi
}

export function useOCR(options: OCROptions = {}) {
  const opts = { ...defaultOptions, ...options }
  
  const [state, setState] = useState<OCRState>({
    isProcessing: false,
    progress: 0,
    isSupported: typeof window !== 'undefined',
    error: null,
    result: null
  })

  const workerRef = useRef<any>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Initialize Tesseract worker
  const initializeWorker = useCallback(async () => {
    if (!state.isSupported) {
      throw new Error('OCR not supported in this environment')
    }

    try {
      // Dynamically import Tesseract.js
      const Tesseract = (await import('tesseract.js')).default
      
      // Create worker
      workerRef.current = await Tesseract.createWorker({
        logger: opts.enableProgress ? (m: any) => {
          if (m.status === 'recognizing text') {
            setState(prev => ({ ...prev, progress: m.progress }))
            opts.onProgress(m.progress)
          }
        } : undefined
      })

      // Load language
      await workerRef.current.loadLanguage(opts.language)
      await workerRef.current.initialize(opts.language)
      
      // Set parameters
      await workerRef.current.setParameters({
        tessedit_ocr_engine_mode: opts.engineMode,
        tessedit_pageseg_mode: opts.pageSegMode
      })

      return workerRef.current
    } catch (error) {
      console.error('Failed to initialize OCR worker:', error)
      throw new Error('Failed to initialize OCR engine')
    }
  }, [state.isSupported, opts])

  // Preprocess image for better OCR results
  const preprocessImage = useCallback((imageElement: HTMLImageElement): Promise<HTMLCanvasElement> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      
      canvas.width = imageElement.naturalWidth
      canvas.height = imageElement.naturalHeight
      
      // Draw original image
      ctx.drawImage(imageElement, 0, 0)
      
      if (opts.preprocessing) {
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data
        
        // Convert to grayscale and increase contrast
        for (let i = 0; i < data.length; i += 4) {
          // Grayscale conversion
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
          
          // Increase contrast
          const contrast = 1.5
          const factor = (259 * (contrast + 255)) / (255 * (259 - contrast))
          const enhancedGray = factor * (gray - 128) + 128
          
          // Threshold for better text recognition
          const threshold = enhancedGray > 128 ? 255 : 0
          
          data[i] = threshold     // Red
          data[i + 1] = threshold // Green
          data[i + 2] = threshold // Blue
          // Alpha stays the same
        }
        
        // Put processed image data back
        ctx.putImageData(imageData, 0, 0)
      }
      
      resolve(canvas)
    })
  }, [opts.preprocessing])

  // Extract text from image
  const extractText = useCallback(async (imageSource: string | HTMLImageElement | File): Promise<OCRResult> => {
    setState(prev => ({ 
      ...prev, 
      isProcessing: true, 
      progress: 0, 
      error: null, 
      result: null 
    }))

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController()

    try {
      // Initialize worker if not already done
      if (!workerRef.current) {
        await initializeWorker()
      }

      let processedImage: string | HTMLImageElement | HTMLCanvasElement = imageSource

      // Preprocess if it's an image element
      if (imageSource instanceof HTMLImageElement && opts.preprocessing) {
        processedImage = await preprocessImage(imageSource)
      }

      // Run OCR
      const { data } = await workerRef.current.recognize(processedImage)

      // Check if operation was aborted
      if (abortControllerRef.current?.signal.aborted) {
        throw new Error('OCR operation was cancelled')
      }

      // Process results
      const result: OCRResult = {
        text: data.text.trim(),
        confidence: data.confidence,
        blocks: data.blocks?.map((block: any) => ({
          text: block.text?.trim() || '',
          confidence: block.confidence || 0,
          bbox: block.bbox || { x0: 0, y0: 0, x1: 0, y1: 0 },
          type: block.paragraph ? 'paragraph' : block.line ? 'line' : 'word'
        })) || [],
        words: data.words?.map((word: any) => ({
          text: word.text?.trim() || '',
          confidence: word.confidence || 0,
          bbox: word.bbox || { x0: 0, y0: 0, x1: 0, y1: 0 }
        })) || []
      }

      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        progress: 100, 
        result 
      }))

      return result

    } catch (error: any) {
      const errorMessage = error.message || 'OCR processing failed'
      
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        error: errorMessage 
      }))
      
      opts.onError(errorMessage)
      throw error
    } finally {
      abortControllerRef.current = null
    }
  }, [initializeWorker, preprocessImage, opts])

  // Extract structured CV data
  const extractCVData = useCallback(async (imageSource: string | HTMLImageElement | File) => {
    const ocrResult = await extractText(imageSource)
    
    if (!ocrResult) {
      throw new Error('No OCR result available')
    }

    const text = ocrResult.text

    // Extract structured information
    const cvData = {
      // Contact Information
      emails: [...text.matchAll(CV_PATTERNS.email)].map(match => match[0]),
      phones: [...text.matchAll(CV_PATTERNS.phone)].map(match => match[0].trim()),
      
      // Sections
      hasEducation: CV_PATTERNS.education.test(text),
      hasExperience: CV_PATTERNS.experience.test(text),
      hasSkills: CV_PATTERNS.skills.test(text),
      
      // Dates (for experience/education periods)
      dates: [...text.matchAll(CV_PATTERNS.dates)].map(match => match[0]),
      
      // Raw text by confidence
      highConfidenceText: ocrResult.words
        .filter(word => word.confidence > 80)
        .map(word => word.text)
        .join(' '),
      
      // Structured blocks
      paragraphs: ocrResult.blocks
        .filter(block => block.type === 'paragraph' && block.confidence > 70)
        .map(block => block.text),
      
      // Overall quality
      averageConfidence: ocrResult.confidence,
      wordCount: ocrResult.words.length,
      
      // Raw OCR result for detailed processing
      rawOCR: ocrResult
    }

    return cvData
  }, [extractText])

  // Extract from camera capture
  const extractFromCapture = useCallback(async (imageData: string) => {
    // Convert base64 to image element
    const img = new Image()
    
    return new Promise<any>((resolve, reject) => {
      img.onload = async () => {
        try {
          const cvData = await extractCVData(img)
          resolve(cvData)
        } catch (error) {
          reject(error)
        }
      }
      
      img.onerror = () => {
        reject(new Error('Failed to load captured image'))
      }
      
      img.src = imageData
    })
  }, [extractCVData])

  // Cancel current OCR operation
  const cancelExtraction = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    setState(prev => ({ 
      ...prev, 
      isProcessing: false, 
      error: 'Operation cancelled' 
    }))
  }, [])

  // Cleanup worker
  const cleanup = useCallback(async () => {
    if (workerRef.current) {
      try {
        await workerRef.current.terminate()
        workerRef.current = null
      } catch (error) {
        console.error('Error terminating OCR worker:', error)
      }
    }
  }, [])

  // Auto-cleanup on unmount
  useCallback(() => {
    return () => {
      cleanup()
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [cleanup])

  // Get text quality assessment
  const getTextQuality = useCallback((result?: OCRResult) => {
    const ocrResult = result || state.result
    if (!ocrResult) return null

    const totalWords = ocrResult.words.length
    const highConfidenceWords = ocrResult.words.filter(w => w.confidence > 80).length
    const mediumConfidenceWords = ocrResult.words.filter(w => w.confidence > 60 && w.confidence <= 80).length
    
    return {
      overall: ocrResult.confidence,
      wordsTotal: totalWords,
      wordsHighConfidence: highConfidenceWords,
      wordsMediumConfidence: mediumConfidenceWords,
      wordsLowConfidence: totalWords - highConfidenceWords - mediumConfidenceWords,
      quality: ocrResult.confidence > 80 ? 'excellent' : 
               ocrResult.confidence > 60 ? 'good' : 
               ocrResult.confidence > 40 ? 'fair' : 'poor',
      recommendations: ocrResult.confidence < 70 ? [
        'Try better lighting',
        'Ensure text is not blurry',
        'Remove shadows',
        'Use higher resolution image'
      ] : []
    }
  }, [state.result])

  return {
    // State
    ...state,
    
    // Main functions
    extractText,
    extractCVData,
    extractFromCapture,
    cancelExtraction,
    cleanup,
    
    // Utility functions
    getTextQuality,
    
    // Worker management
    isWorkerReady: !!workerRef.current,
    
    // Configuration
    currentLanguage: opts.language,
    
    // Computed values
    hasResult: !!state.result,
    canProcess: state.isSupported && !state.isProcessing,
    
    // CV-specific helpers
    isLikelyCV: (text: string) => {
      const patterns = Object.values(CV_PATTERNS)
      const matches = patterns.reduce((count, pattern) => {
        return count + (pattern.test(text) ? 1 : 0)
      }, 0)
      return matches >= 2 // At least 2 CV patterns found
    }
  }
}

export default useOCR