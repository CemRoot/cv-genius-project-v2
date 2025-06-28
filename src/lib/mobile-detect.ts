import { headers } from 'next/headers'

export async function isMobileDevice(): Promise<boolean> {
  const headersList = await headers()
  const userAgent = headersList.get('user-agent') || ''
  
  // Check for mobile user agents
  const mobileRegex = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i
  return mobileRegex.test(userAgent)
}

export async function getDeviceType(): Promise<'mobile' | 'tablet' | 'desktop'> {
  const headersList = await headers()
  const userAgent = headersList.get('user-agent') || ''
  
  // Check for tablet first (as tablets often contain mobile keywords too)
  const tabletRegex = /iPad|Android.*Tablet|Tablet.*Android|Kindle|Silk|PlayBook/i
  if (tabletRegex.test(userAgent)) {
    return 'tablet'
  }
  
  // Then check for mobile
  const mobileRegex = /Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile/i
  if (mobileRegex.test(userAgent)) {
    return 'mobile'
  }
  
  return 'desktop'
}

// Client-side detection for hydration matching
export function getInitialMobileState(): boolean {
  // This runs on both server and client
  if (typeof window === 'undefined') {
    // Server-side: return false to avoid hydration mismatch
    // The actual detection will happen via props
    return false
  }
  
  // Client-side: do immediate detection
  const width = window.innerWidth
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  const userAgent = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  
  return width < 768 || isTouchDevice || userAgent
}