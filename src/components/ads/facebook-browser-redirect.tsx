'use client'

import { useEffect, useState } from 'react'

const FacebookBrowserRedirect = () => {
  const [showRedirectPrompt, setShowRedirectPrompt] = useState(false)

  useEffect(() => {
    // Detect Facebook in-app browser
    const isFacebookBrowser = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      return userAgent.includes('fban') || 
             userAgent.includes('fbav') || 
             userAgent.includes('facebook') ||
             userAgent.includes('instagram') ||
             (userAgent.includes('mobile') && userAgent.includes('safari') && userAgent.includes('fbios'))
    }

    // Detect other limited browsers
    const isLimitedBrowser = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      return userAgent.includes('wechat') ||
             userAgent.includes('line') ||
             userAgent.includes('kakaotalk') ||
             userAgent.includes('tiktok')
    }

    if (isFacebookBrowser() || isLimitedBrowser()) {
      // Small delay to ensure page is loaded
      const timer = setTimeout(() => {
        setShowRedirectPrompt(true)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [])

  const redirectToExternalBrowser = () => {
    const currentUrl = window.location.href
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isAndroid = /Android/.test(navigator.userAgent)

    if (isIOS) {
      // iOS: Try to open in Safari
      window.location.href = `x-web-search://?${encodeURIComponent(currentUrl)}`
      
      // Fallback: Direct URL (user will need to copy)
      setTimeout(() => {
        alert(`Please copy this URL and open it in Safari:\n\n${currentUrl}`)
      }, 1000)
      
    } else if (isAndroid) {
      // Android: Try to open in Chrome
      const chromeIntent = `intent://${currentUrl.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`
      window.location.href = chromeIntent
      
      // Fallback: Direct URL
      setTimeout(() => {
        window.open(currentUrl, '_blank')
      }, 1000)
      
    } else {
      // Desktop: Open in new tab/window
      window.open(currentUrl, '_blank')
    }
  }

  const dismissPrompt = () => {
    setShowRedirectPrompt(false)
    // Don't show again for this session
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem('fb-redirect-dismissed', 'true')
    }
  }

  // Don't show if already dismissed in this session
  if (typeof window !== 'undefined' && window.sessionStorage && sessionStorage.getItem('fb-redirect-dismissed')) {
    return null
  }

  if (!showRedirectPrompt) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <div className="text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Better Experience Available
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              For the best CV building experience with full functionality, please open this site in your main browser (Chrome, Safari, etc.).
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={redirectToExternalBrowser}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Open in Browser
            </button>
            
            <button
              onClick={dismissPrompt}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Continue Here
            </button>
          </div>

          <div className="mt-4 text-xs text-gray-500">
            Features like file uploads, notifications, and some AI tools work best in your main browser.
          </div>
        </div>
      </div>
    </div>
  )
}

export default FacebookBrowserRedirect 