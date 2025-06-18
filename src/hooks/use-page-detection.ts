import { useEffect, useState, useRef } from 'react'

export function usePageDetection() {
  const [pageCount, setPageCount] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const calculatePages = () => {
      if (!containerRef.current || !contentRef.current) return

      // A4 dimensions in pixels at 96 DPI (web standard)
      // A4 = 210mm × 297mm = 8.27" × 11.69" = 794px × 1123px at 96 DPI
      const A4_HEIGHT_PX = 1123
      const contentHeight = contentRef.current.scrollHeight
      
      // Calculate how many A4 pages we need
      const calculatedPages = Math.ceil(contentHeight / A4_HEIGHT_PX)
      setPageCount(Math.max(1, calculatedPages))

      // Determine current page based on scroll position
      const scrollTop = containerRef.current.scrollTop || 0
      const currentPageNumber = Math.floor(scrollTop / A4_HEIGHT_PX) + 1
      setCurrentPage(Math.min(currentPageNumber, calculatedPages))
    }

    // Calculate on mount and when content changes
    calculatePages()

    // Use ResizeObserver to detect content size changes
    const contentElement = contentRef.current
    if (contentElement) {
      const resizeObserver = new ResizeObserver(calculatePages)
      resizeObserver.observe(contentElement)

      // Also observe for content mutations
      const mutationObserver = new MutationObserver(calculatePages)
      mutationObserver.observe(contentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true
      })

      return () => {
        resizeObserver.disconnect()
        mutationObserver.disconnect()
      }
    }
  }, [])

  // Handle scroll to update current page
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      const A4_HEIGHT_PX = 1123
      const scrollTop = container.scrollTop
      const currentPageNumber = Math.floor(scrollTop / A4_HEIGHT_PX) + 1
      setCurrentPage(Math.min(currentPageNumber, pageCount))
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [pageCount])

  return {
    pageCount,
    currentPage,
    containerRef,
    contentRef
  }
}