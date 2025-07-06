export interface AdConfig {
  id: string
  name: string
  type: 'banner' | 'sidebar' | 'popup' | 'native' | 'push' | 'mobile' | 'inline' | 'footer' | 'interstitial' | 'sticky'
  enabled: boolean
  zone?: string
  position?: string
  settings?: {
    delay?: number
    cooldown?: number
    restrictedPages?: string[]
    adSenseSlot?: string
    adSenseClient?: string
    size?: string
    mobileKey?: string
    width?: number
    height?: number
    mobilePosition?: 'top' | 'bottom' | 'floating'
    platform?: 'adsense' | 'monetag' | 'propellerads' | 'custom'
  }
}

// Get ad configuration from environment variables
const getAdSenseClient = () => process.env.NEXT_PUBLIC_ADSENSE_CLIENT

// Bu fonksiyon artık sadece fallback için kullanılacak
const getAdSenseSlot = (type: string) => {
  switch (type) {
    case 'header':
      return process.env.NEXT_PUBLIC_ADSENSE_HEADER_SLOT
    case 'sidebar':
      return process.env.NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT
    case 'inline':
      return process.env.NEXT_PUBLIC_ADSENSE_INLINE_SLOT
    case 'footer':
      return process.env.NEXT_PUBLIC_ADSENSE_FOOTER_SLOT
    case 'sticky':
      return process.env.NEXT_PUBLIC_ADSENSE_STICKY_SLOT
    default:
      return undefined
  }
}

const getMonetagZone = (type: string) => {
  switch (type) {
    case 'popup':
      return process.env.NEXT_PUBLIC_MONETAG_ZONE_POPUP
    case 'push':
      return process.env.NEXT_PUBLIC_MONETAG_ZONE_PUSH
    case 'native':
      return process.env.NEXT_PUBLIC_MONETAG_ZONE_NATIVE
    case 'inpage':
      return process.env.NEXT_PUBLIC_MONETAG_ZONE_INPAGE
    default:
      return undefined
  }
}

const getMobileAdKey = (position: string) => {
  switch (position) {
    case 'top':
      return process.env.NEXT_PUBLIC_MOBILE_AD_TOP
    case 'bottom':
      return process.env.NEXT_PUBLIC_MOBILE_AD_BOTTOM
    case 'floating':
      return process.env.NEXT_PUBLIC_MOBILE_AD_FLOATING
    case 'interstitial':
      return process.env.NEXT_PUBLIC_MOBILE_AD_INTERSTITIAL
    default:
      return undefined
  }
}

export const defaultAdConfigs: AdConfig[] = [
  {
    id: 'banner-main',
    name: 'Main Banner (Leaderboard)',
    type: 'banner',
    enabled: true,
    position: 'header',
    settings: {
      size: 'large',
      delay: 2000,
      adSenseClient: getAdSenseClient() || 'ca-pub-1742989559393752',
      adSenseSlot: getAdSenseSlot('header') || '1006957692',
      platform: 'adsense'
    }
  },
  {
    id: 'banner-content',
    name: 'Content Banner',
    type: 'banner', 
    enabled: true,
    position: 'content',
    settings: {
      size: 'medium',
      delay: 3000
    }
  },
  {
    id: 'sidebar-main',
    name: 'Sidebar AdSense (300x300)',
    type: 'sidebar',
    enabled: true,
    zone: getAdSenseClient(),
    settings: {
      adSenseClient: getAdSenseClient(),
      adSenseSlot: getAdSenseSlot('sidebar'),
      delay: 2000,
      platform: 'adsense'
    }
  },
  {
    id: 'popup-onclick',
    name: 'Monetag OnClick Popunder',
    type: 'popup',
    enabled: false,
    zone: getMonetagZone('popup'),
    settings: {
      delay: 5000,
      cooldown: 600000, // 10 dakika
      restrictedPages: ['/builder', '/export', '/ats-check', '/admin']
    }
  },
  {
    id: 'push-notification',
    name: 'Monetag Push Notification',
    type: 'push',
    enabled: false,
    zone: getMonetagZone('push'),
    settings: {
      delay: 30000,
      cooldown: 3600000, // 1 saat
      restrictedPages: ['/builder', '/export', '/ats-check', '/admin']
    }
  },
  {
    id: 'native-banner',
    name: 'Monetag Native Banner',
    type: 'native',
    enabled: false,
    zone: getMonetagZone('native'),
    settings: {
      delay: 4000,
      restrictedPages: ['/admin']
    }
  },
  {
    id: 'inpage-push',
    name: 'Monetag In-Page Push',
    type: 'push',
    enabled: false,
    zone: getMonetagZone('inpage'),
    settings: {
      delay: 10000,
      cooldown: 1800000, // 30 dakika
      restrictedPages: ['/builder', '/export', '/ats-check', '/admin']
    }
  },
  // Mobile Ads
  {
    id: 'mobile-top-banner',
    name: 'Mobile Top Banner (320x50)',
    type: 'mobile',
    enabled: true,
    settings: {
      mobilePosition: 'top',
      mobileKey: getMobileAdKey('top'),
      width: 320,
      height: 50,
      delay: 2000,
      restrictedPages: ['/builder', '/export', '/ats-check', '/admin']
    }
  },
  {
    id: 'mobile-bottom-banner',
    name: 'Mobile Bottom Banner (320x50)',
    type: 'mobile',
    enabled: true,
    settings: {
      mobilePosition: 'bottom',
      mobileKey: getMobileAdKey('bottom'),
      width: 320,
      height: 50,
      delay: 3000,
      restrictedPages: ['/builder', '/export', '/ats-check', '/admin']
    }
  },
  {
    id: 'mobile-floating-ad',
    name: 'Mobile Floating Ad (300x250)',
    type: 'mobile',
    enabled: false,
    settings: {
      mobilePosition: 'floating',
      mobileKey: getMobileAdKey('floating'),
      width: 300,
      height: 250,
      delay: 5000,
      cooldown: 300000, // 5 dakika
      restrictedPages: ['/builder', '/export', '/ats-check', '/admin', '/cover-letter']
    }
  },
  {
    id: 'mobile-interstitial',
    name: 'Mobile Interstitial (Tam Ekran)',
    type: 'mobile',
    enabled: false,
    settings: {
      mobilePosition: 'floating',
      mobileKey: getMobileAdKey('interstitial'),
      width: 320,
      height: 480,
      delay: 8000,
      cooldown: 600000, // 10 dakika
      restrictedPages: ['/builder', '/export', '/ats-check', '/admin', '/cover-letter'],
      platform: 'propellerads'
    }
  },
  // Inline Ads
  {
    id: 'inline-content-ad',
    name: 'Inline Content Ad',
    type: 'inline',
    enabled: true,
    settings: {
      adSenseClient: getAdSenseClient(),
      adSenseSlot: getAdSenseSlot('inline'),
      width: 728,
      height: 250,
      delay: 2000,
      restrictedPages: ['/builder', '/export', '/admin'],
      platform: 'adsense'
    }
  },
  // Footer Ads
  {
    id: 'footer-banner',
    name: 'Footer Banner',
    type: 'footer',
    enabled: true,
    settings: {
      adSenseClient: getAdSenseClient(),
      adSenseSlot: getAdSenseSlot('footer'),
      width: 728,
      height: 90,
      delay: 1500,
      restrictedPages: ['/admin'],
      platform: 'adsense'
    }
  },
  // Interstitial Ads
  {
    id: 'page-interstitial',
    name: 'Page Transition Ad',
    type: 'interstitial',
    enabled: false,
    settings: {
      width: 800,
      height: 600,
      delay: 0,
      cooldown: 1800000, // 30 dakika
      restrictedPages: ['/builder', '/export', '/admin', '/ats-check'],
      platform: 'adsense'
    }
  },
  // Download Interstitial
  {
    id: 'download-interstitial',
    name: 'Pre-Download Ad',
    type: 'interstitial',
    enabled: true,
    position: 'download',
    settings: {
      delay: 0,
      cooldown: 0, // Her indirmede göster
      restrictedPages: [],
      platform: 'custom'
    }
  },
  // Sticky Side Ads
  {
    id: 'sticky-side-ads',
    name: 'Sticky Side Ads (Desktop)',
    type: 'sticky',
    enabled: false,
    settings: {
      adSenseClient: getAdSenseClient(),
      adSenseSlot: getAdSenseSlot('sticky'),
      width: 160,
      height: 600,
      delay: 3000,
      restrictedPages: ['/builder', '/export', '/admin', '/ats-check'],
      platform: 'adsense'
    }
  }
]

export function getAdConfig(id: string): AdConfig | undefined {
  const stored = getStoredAdConfigs()
  return stored.find(ad => ad.id === id)
}

export function getStoredAdConfigs(): AdConfig[] {
  if (typeof window === 'undefined') return defaultAdConfigs
  
  try {
    const stored = localStorage.getItem('ad-configs')
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Failed to read ad configs:', error)
  }
  
  return defaultAdConfigs
}

export function saveAdConfigs(configs: AdConfig[]) {
  if (typeof window === 'undefined') return
  
  try {    
    localStorage.setItem('ad-configs', JSON.stringify(configs))
  } catch (error) {
    console.error('Failed to save ad configs:', error)
  }
}

export function updateAdConfig(id: string, updates: Partial<AdConfig>) {
  const configs = getStoredAdConfigs()
  const index = configs.findIndex(ad => ad.id === id)
  
  if (index !== -1) {
    configs[index] = { ...configs[index], ...updates }
    saveAdConfigs(configs)
  }
}

// İlk kez sayfa yüklendiğinde default config'leri localStorage'a kaydet
export function initializeAdConfigs() {
  if (typeof window === 'undefined') return
  
  const stored = localStorage.getItem('ad-configs')
  if (!stored) {
    saveAdConfigs(defaultAdConfigs)
  }
}