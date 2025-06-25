/**
 * Utility functions for processing signature images
 */

/**
 * Removes white background from a signature image and returns a transparent version
 * @param imageUrl - The URL of the signature image
 * @param tolerance - Tolerance for near-white pixels (default: 20)
 * @returns Promise<string> - Data URL of the processed image
 */
export async function removeWhiteBackground(imageUrl: string, tolerance: number = 20): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }
      
      // Set canvas size to image size
      canvas.width = img.width
      canvas.height = img.height
      
      // Draw image
      ctx.drawImage(img, 0, 0)
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const pixels = imageData.data
      
      // Process pixels - make white/near-white pixels transparent
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i]
        const g = pixels[i + 1]
        const b = pixels[i + 2]
        const a = pixels[i + 3]
        
        // Check if pixel is white or near-white
        if (r > 255 - tolerance && g > 255 - tolerance && b > 255 - tolerance) {
          // Make it transparent
          pixels[i + 3] = 0
        }
      }
      
      // Put processed image data back
      ctx.putImageData(imageData, 0, 0)
      
      // Trim the canvas to remove empty space
      const trimmedCanvas = trimCanvas(canvas)
      
      // Convert to data URL
      resolve(trimmedCanvas.toDataURL('image/png'))
    }
    
    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }
    
    img.src = imageUrl
  })
}

/**
 * Trims transparent pixels from canvas edges
 * @param canvas - Canvas to trim
 * @returns Canvas - Trimmed canvas
 */
function trimCanvas(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas
  
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = pixels.data
  const bound = {
    top: null as number | null,
    left: null as number | null,
    right: null as number | null,
    bottom: null as number | null
  }
  
  // Find boundaries of non-transparent pixels
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] !== 0) { // If pixel is not transparent
      const x = (i / 4) % canvas.width
      const y = Math.floor((i / 4) / canvas.width)
      
      if (bound.top === null) bound.top = y
      if (bound.left === null) bound.left = x
      else if (x < bound.left) bound.left = x
      if (bound.right === null) bound.right = x
      else if (bound.right < x) bound.right = x
      if (bound.bottom === null) bound.bottom = y
      else if (bound.bottom < y) bound.bottom = y
    }
  }
  
  // If no non-transparent pixels found, return original
  if (bound.top === null || bound.left === null || bound.right === null || bound.bottom === null) {
    return canvas
  }
  
  // Calculate trimmed dimensions with some padding
  const padding = 10
  const trimmedWidth = bound.right - bound.left + 1 + (padding * 2)
  const trimmedHeight = bound.bottom - bound.top + 1 + (padding * 2)
  
  // Create new canvas with trimmed dimensions
  const trimmedCanvas = document.createElement('canvas')
  trimmedCanvas.width = trimmedWidth
  trimmedCanvas.height = trimmedHeight
  
  const trimmedCtx = trimmedCanvas.getContext('2d')
  if (!trimmedCtx) return canvas
  
  // Copy trimmed image data
  trimmedCtx.putImageData(
    ctx.getImageData(
      bound.left - padding,
      bound.top - padding,
      trimmedWidth,
      trimmedHeight
    ),
    0,
    0
  )
  
  return trimmedCanvas
}

/**
 * Process signature for optimal display
 * @param signatureUrl - Original signature URL
 * @returns Promise<{ url: string, width: number, height: number }>
 */
export async function processSignature(signatureUrl: string): Promise<{
  url: string
  width: number
  height: number
}> {
  try {
    // Remove white background and trim
    const processedUrl = await removeWhiteBackground(signatureUrl)
    
    // Get dimensions
    const img = new Image()
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = processedUrl
    })
    
    return {
      url: processedUrl,
      width: img.width,
      height: img.height
    }
  } catch (error) {
    console.error('Failed to process signature:', error)
    // Return original if processing fails
    return {
      url: signatureUrl,
      width: 200,
      height: 80
    }
  }
}