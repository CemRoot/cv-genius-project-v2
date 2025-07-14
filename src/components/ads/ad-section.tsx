import { useAdConfig } from './dynamic-ad-manager'
import { AdController } from './ad-controller'

interface AdSectionProps {
  type: 'sticky-side' | 'mobile-top' | 'mobile-bottom' | 'mobile-floating' | 'sidebar' | 'banner'
  position?: 'top' | 'bottom' | 'floating'
  size?: 'large' | 'medium' | 'small'
  className?: string
}

export function AdSection(props: AdSectionProps) {
  // Always call hooks unconditionally first
  const adConfigHook = useAdConfig()
  
  // Get admin settings with fallback
  const adminSettings = adConfigHook?.adminSettings ?? { enableAds: false, mobileAds: false }

  if (!adminSettings.enableAds) {
    return null
  }

  // Mobile ads için ayrıca mobileAds kontrolü
  if ((props.type === 'mobile-top' || props.type === 'mobile-bottom' || props.type === 'mobile-floating') && !adminSettings.mobileAds) {
    return null
  }

  return <AdController {...props} />
} 