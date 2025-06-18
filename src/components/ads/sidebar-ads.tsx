'use client'

import { useEffect } from 'react'

interface SidebarAdsProps {
  className?: string
}

export function SidebarAds({ className = '' }: SidebarAdsProps) {
  useEffect(() => {
    // PropellerAds display ad loader
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.innerHTML = `
      atOptions = {
        'key' : 'YOUR_DISPLAY_AD_KEY',
        'format' : 'iframe',
        'height' : 250,
        'width' : 300,
        'params' : {}
      };
    `
    document.head.appendChild(script)

    const adScript = document.createElement('script')
    adScript.type = 'text/javascript'
    adScript.src = '//www.topcreativeformat.com/YOUR_AD_ID/invoke.js'
    document.head.appendChild(adScript)

    return () => {
      // Cleanup scripts
      document.head.removeChild(script)
      document.head.removeChild(adScript)
    }
  }, [])

  return (
    <div className={`w-full max-w-xs space-y-6 ${className}`}>
      {/* PropellerAds Display Ad */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="text-xs text-gray-500 mb-2 text-center">Advertisement</div>
        <div id="propeller-display-ad" className="min-h-[250px] bg-white rounded border flex items-center justify-center">
          <div className="text-gray-400 text-sm">Ad Space</div>
        </div>
      </div>

      {/* Amazon Affiliate Section */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-3">Recommended Resources</h3>
        <div className="space-y-3">
          <a 
            href="https://amazon.com/dp/CV_BOOK_ID?tag=YOUR_AFFILIATE_TAG" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block p-3 bg-white rounded border hover:shadow-md transition-shadow"
          >
            <div className="text-sm font-medium text-gray-900">CV Writing Guide</div>
            <div className="text-xs text-gray-600">Professional resume tips</div>
          </a>
          
          <a 
            href="https://amazon.com/dp/INTERVIEW_BOOK_ID?tag=YOUR_AFFILIATE_TAG" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block p-3 bg-white rounded border hover:shadow-md transition-shadow"
          >
            <div className="text-sm font-medium text-gray-900">Interview Success</div>
            <div className="text-xs text-gray-600">Ace your next interview</div>
          </a>
        </div>
      </div>
    </div>
  )
} 