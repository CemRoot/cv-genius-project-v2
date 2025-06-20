'use client'

import { useEffect } from 'react'

interface SidebarAdsProps {
  className?: string
}

export function SidebarAds({ className = '' }: SidebarAdsProps) {
  useEffect(() => {
    // Monetag sidebar ad - Zone 9469382 (In-Page Push)
    const container = document.getElementById('monetag-sidebar-ad')
    if (container && !container.hasChildNodes()) {
      // Create Monetag script for sidebar
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.innerHTML = `
        (function(d,z,s){
          s=d.createElement('script');
          s.async=true;
          s.src='https://fpyf8.com/88/tag.min.js';
          s.setAttribute('data-zone','9469382');
          s.setAttribute('data-cfasync','false');
          d.getElementsByTagName('head')[0].appendChild(s);
        })(document);
      `
      container.appendChild(script)
    }
  }, [])

  return (
    <div className={`w-full max-w-xs mx-auto space-y-4 lg:space-y-6 ${className}`}>
      {/* Monetag Sidebar Ad */}
      <div className="bg-gray-50 p-3 lg:p-4 rounded-lg shadow-sm">
        <div className="text-xs text-gray-500 mb-2 text-center font-medium">Advertisement</div>
        <div id="monetag-sidebar-ad" className="min-h-[200px] lg:min-h-[250px] bg-white rounded border flex items-center justify-center">
          <div className="text-gray-400 text-sm text-center">
            <div className="mb-1">📢</div>
            <div>Ad Space</div>
            <div className="text-xs opacity-70 mt-1">Loading...</div>
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