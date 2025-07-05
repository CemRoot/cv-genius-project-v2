/**
 * A4 Document Utilities
 * Constants and helpers for A4 page dimensions and calculations
 */

// A4 dimensions at different DPIs
export const A4_DIMENSIONS = {
  // Physical dimensions
  MM: { width: 210, height: 297 },
  INCHES: { width: 8.27, height: 11.69 },
  
  // Digital dimensions at different DPIs
  DPI_72: { width: 595, height: 842 },    // PDF standard
  DPI_96: { width: 794, height: 1123 },   // Web standard (CSS pixels)
  DPI_150: { width: 1241, height: 1755 }, // High quality
  DPI_300: { width: 2480, height: 3508 }, // Print quality
} as const

// Get A4 dimensions for current device
export function getA4Dimensions(dpi: number = 96) {
  const inchWidth = A4_DIMENSIONS.INCHES.width
  const inchHeight = A4_DIMENSIONS.INCHES.height
  
  return {
    width: Math.round(inchWidth * dpi),
    height: Math.round(inchHeight * dpi),
    aspectRatio: inchWidth / inchHeight,
  }
}

// Calculate number of A4 pages needed for content
export function calculatePageCount(
  contentHeight: number,
  pageHeight: number = A4_DIMENSIONS.DPI_96.height,
  padding: number = 0
): number {
  const effectivePageHeight = pageHeight - (padding * 2)
  return Math.ceil(contentHeight / effectivePageHeight)
}

// Get page boundaries for pagination
export function getPageBoundaries(
  pageCount: number,
  pageHeight: number = A4_DIMENSIONS.DPI_96.height
): number[] {
  return Array.from({ length: pageCount - 1 }, (_, i) => (i + 1) * pageHeight)
}

// Calculate current page from scroll position
export function getCurrentPage(
  scrollTop: number,
  pageHeight: number = A4_DIMENSIONS.DPI_96.height
): number {
  return Math.floor(scrollTop / pageHeight) + 1
}

// Scale calculations for responsive preview
export function calculatePreviewScale(
  containerWidth: number,
  containerHeight: number,
  pageWidth: number = A4_DIMENSIONS.DPI_96.width,
  pageHeight: number = A4_DIMENSIONS.DPI_96.height,
  padding: number = 32
): number {
  const availableWidth = containerWidth - (padding * 2)
  const availableHeight = containerHeight - (padding * 2)
  
  const scaleX = availableWidth / pageWidth
  const scaleY = availableHeight / pageHeight
  
  // Use the smaller scale to ensure the page fits
  return Math.min(scaleX, scaleY, 1) // Cap at 100%
}

// Mobile-specific scale calculation
export function calculateMobileScale(
  viewportWidth: number,
  padding: number = 16
): number {
  const maxWidth = 450 // Max width for mobile preview
  const availableWidth = Math.min(viewportWidth - (padding * 2), maxWidth)
  const pageWidth = A4_DIMENSIONS.DPI_96.width
  
  return availableWidth / pageWidth
}

// Export helpers for different formats
export const exportDimensions = {
  pdf: A4_DIMENSIONS.DPI_72,
  print: A4_DIMENSIONS.DPI_300,
  web: A4_DIMENSIONS.DPI_96,
  thumbnail: { width: 200, height: 283 }, // Maintains aspect ratio
}

// Page margin presets (in mm)
export const pageMargins = {
  narrow: { top: 12.7, right: 12.7, bottom: 12.7, left: 12.7 },
  normal: { top: 25.4, right: 25.4, bottom: 25.4, left: 25.4 },
  wide: { top: 38.1, right: 38.1, bottom: 38.1, left: 38.1 },
  cv: { top: 20, right: 20, bottom: 20, left: 20 }, // Custom for CVs
}

// Convert mm to pixels
export function mmToPixels(mm: number, dpi: number = 96): number {
  const inches = mm / 25.4
  return Math.round(inches * dpi)
}

// Convert pixels to mm
export function pixelsToMm(pixels: number, dpi: number = 96): number {
  const inches = pixels / dpi
  return inches * 25.4
}