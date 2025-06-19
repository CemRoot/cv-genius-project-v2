'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface DownloadRedirectHandlerProps {
  targetUrl: string
  redirectUrl: string
  downloadKey: string
}

export function DownloadRedirectHandler({ 
  targetUrl, 
  redirectUrl, 
  downloadKey 
}: DownloadRedirectHandlerProps) {
  const router = useRouter()

  useEffect(() => {
    // Check if user has already been redirected for this download
    const hasVisited = localStorage.getItem(`download_${downloadKey}_visited`)
    
    if (hasVisited) {
      // User has already visited the redirect page, proceed with download
      localStorage.removeItem(`download_${downloadKey}_visited`)
      window.location.href = targetUrl
    } else {
      // First visit - redirect to monetization page
      localStorage.setItem(`download_${downloadKey}_visited`, 'true')
      
      // Set a return URL
      localStorage.setItem('download_return_url', window.location.href)
      
      // Redirect to monetization page
      window.location.href = redirectUrl
    }
  }, [targetUrl, redirectUrl, downloadKey])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cvgenius-purple mx-auto mb-4"></div>
        <p className="text-lg">Preparing your download...</p>
      </div>
    </div>
  )
}

// Hook for download with redirect
export function useDownloadWithRedirect() {
  const router = useRouter()

  const handleDownload = (
    downloadUrl: string, 
    redirectUrl: string = 'https://www.example-monetization.com', // Replace with your ad URL
    downloadKey: string = 'default'
  ) => {
    const hasVisited = localStorage.getItem(`download_${downloadKey}_visited`)
    
    if (hasVisited) {
      // Already visited redirect, proceed with download
      localStorage.removeItem(`download_${downloadKey}_visited`)
      window.location.href = downloadUrl
    } else {
      // First time - set flag and redirect
      localStorage.setItem(`download_${downloadKey}_visited`, 'true')
      localStorage.setItem('download_return_url', window.location.href)
      
      // Open redirect in new tab
      window.open(redirectUrl, '_blank')
      
      // Show message to user
      alert('Please visit our sponsor page. Click the download button again after returning.')
    }
  }

  return { handleDownload }
}