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
        'key' : 'REPLACE_WITH_YOUR_DISPLAY_KEY',
        'format' : 'iframe',
        'height' : 250,
        'width' : 300,
        'params' : {}
      };
    `
    document.head.appendChild(script)

    const adScript = document.createElement('script')
    adScript.type = 'text/javascript'
    adScript.src = '//www.topcreativeformat.com/REPLACE_WITH_YOUR_AD_ID/invoke.js'
    document.head.appendChild(adScript)

    return () => {
      // Cleanup scripts
      document.head.removeChild(script)
      document.head.removeChild(adScript)
    }
  }, [])

  return (
    <div className={`w-full max-w-xs mx-auto space-y-4 lg:space-y-6 ${className}`}>
      {/* PropellerAds Display Ad */}
      <div className="bg-gray-50 p-3 lg:p-4 rounded-lg shadow-sm">
        <div className="text-xs text-gray-500 mb-2 text-center font-medium">Advertisement</div>
        <div id="propeller-display-ad" className="min-h-[200px] lg:min-h-[250px] bg-white rounded border flex items-center justify-center">
          <div className="text-gray-400 text-sm text-center">
            <div className="mb-1">📢</div>
            <div>Ad Space</div>
          </div>
        </div>
      </div>

      {/* Amazon Affiliate Section */}
      <div className="bg-blue-50 p-3 lg:p-4 rounded-lg shadow-sm">
        <h3 className="font-medium text-gray-900 mb-3 text-sm lg:text-base">Recommended Resources</h3>
        <div className="space-y-2 lg:space-y-3">
          <a 
            href="https://www.amazon.com/What-Color-Your-Parachute-2024/dp/1984860720?tag=cvgenius-ireland-20" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block p-2 lg:p-3 bg-white rounded border hover:shadow-md transition-shadow"
          >
            <div className="text-sm font-medium text-gray-900">What Color Is Your Parachute?</div>
            <div className="text-xs text-gray-600">Job search & career guidance</div>
          </a>
          
          <a 
            href="https://www.amazon.com/Great-Answers-Tough-Interview-Questions/dp/0749486406?tag=cvgenius-ireland-20" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block p-2 lg:p-3 bg-white rounded border hover:shadow-md transition-shadow"
          >
            <div className="text-sm font-medium text-gray-900">Great Interview Answers</div>
            <div className="text-xs text-gray-600">Ace tough interview questions</div>
          </a>
          
          <a 
            href="https://www.amazon.com/Resume-Writing-2024-Complete-Guide/dp/B0CHQX5K8P?tag=cvgenius-ireland-20" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block p-2 lg:p-3 bg-white rounded border hover:shadow-md transition-shadow"
          >
            <div className="text-sm font-medium text-gray-900">Resume Writing Guide 2024</div>
            <div className="text-xs text-gray-600">Complete CV writing guide</div>
          </a>
        </div>
      </div>
    </div>
  )
} 