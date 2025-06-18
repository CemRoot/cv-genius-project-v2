'use client'

import { usePathname } from 'next/navigation'
import { StickySideAds } from './sticky-side-ads'
import { MobileAds } from './mobile-ads'
import { SidebarAds } from './sidebar-ads'
import { BannerAds } from './banner-ads'
import { PropPushNotification } from './propush-notification'

// Pages where ads should be disabled
const NO_ADS_PAGES = [
  '/builder',
  '/cover-letter/job-description',
  '/cover-letter/experience', 
  '/cover-letter/strengths',
  '/cover-letter/work-style',
  '/cover-letter/customize',
  '/cover-letter/results',
  '/cover-letter/signature',
  '/ats-check',
  '/export'
]

// Pages where only minimal ads should be shown
const MINIMAL_ADS_PAGES = [
  '/templates',
  '/examples',
  '/cover-letter/choose-template',
  '/cover-letter/creation-mode'
]

interface AdControllerProps {
  type: 'sticky-side' | 'mobile-top' | 'mobile-bottom' | 'mobile-floating' | 'sidebar' | 'banner' | 'propush'
  position?: 'top' | 'bottom' | 'floating'
  size?: 'large' | 'medium' | 'small'
  className?: string
  trigger?: boolean
  onTrigger?: () => void
  delay?: number
}

export function AdController({ type, position, size, className, trigger, onTrigger, delay }: AdControllerProps) {
  const pathname = usePathname()

  // Check if ads should be completely disabled
  const isNoAdsPage = NO_ADS_PAGES.some(page => pathname.startsWith(page))
  if (isNoAdsPage) {
    return null
  }

  // Check if this is a minimal ads page
  const isMinimalAdsPage = MINIMAL_ADS_PAGES.some(page => pathname.startsWith(page))
  
  // On minimal ads pages, only show non-intrusive ads
  if (isMinimalAdsPage) {
    // Only allow sidebar and bottom mobile ads on minimal pages
    if (!['sidebar', 'mobile-bottom'].includes(type)) {
      return null
    }
  }

  // Render appropriate ad component
  switch (type) {
    case 'sticky-side':
      return <StickySideAds />
      
    case 'mobile-top':
      return <MobileAds position="top" className={className} />
      
    case 'mobile-bottom':
      return <MobileAds position="bottom" className={className} />
      
    case 'mobile-floating':
      return <MobileAds position="floating" className={className} />
      
    case 'sidebar':
      return <SidebarAds className={className} />
      
    case 'banner':
      return <BannerAds size={size} className={className} />
      
    case 'propush':
      return <PropPushNotification trigger={trigger} onTrigger={onTrigger} delay={delay} />
      
    default:
      return null
  }
} 