'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useAdConfig } from './dynamic-ad-manager'

export function AdvancedMonetization() {
  const [isInitialized, setIsInitialized] = useState(false)
  const pathname = usePathname()
  
  let getAdsByType
  try {
    ({ getAdsByType } = useAdConfig())
  } catch (error) {
    // Context henüz yüklenmemişse sessizce çık
    return null
  }

  useEffect(() => {
    // Admin ayarlarından popup/push reklamları kontrol et
    const popupAds = getAdsByType('popup')
    const pushAds = getAdsByType('push')
    
    if (popupAds.length === 0 && pushAds.length === 0) {
      return // Hiç popup/push reklam aktif değil
    }

    if (isInitialized) {
      return
    }

    // Aktif olan popup/push reklamları işle
    [...popupAds, ...pushAds].forEach(adConfig => {
      const restrictedPages = adConfig.settings?.restrictedPages || []
      const shouldSkip = restrictedPages.some(page => pathname.includes(page))
      
      if (shouldSkip) {
        return
      }

      // Session kontrolü
      const sessionKey = `monetag-${adConfig.id}-shown`
      const lastPopup = sessionStorage.getItem(sessionKey)
      const now = Date.now()
      const cooldownPeriod = adConfig.settings?.cooldown || 600000 // 10 dakika default

      if (lastPopup && (now - parseInt(lastPopup)) < cooldownPeriod) {
        return
      }

      // Reklam script'ini yükle
      const delay = adConfig.settings?.delay || 5000
      const timer = setTimeout(() => {
        if (adConfig.zone) {
          loadMonetagScript(adConfig.zone, sessionKey)
        }
      }, delay)

      return () => clearTimeout(timer)
    })

    setIsInitialized(true)
  }, [pathname, isInitialized, getAdsByType])

  return null
}

function loadMonetagScript(zone: string, sessionKey: string) {
  const script = document.createElement('script')
  script.innerHTML = `
    (function() {
      // Sadece kullanıcı click yaptığında popup göster
      let hasClicked = false;
      
      function initPopunder() {
        if (hasClicked) return;
        hasClicked = true;
        
        const s = document.createElement('script');
        s.src = 'https://fpyf8.com/88/tag.min.js';
        s.setAttribute('data-zone', '${zone}');
        s.setAttribute('data-cfasync', 'false');
        document.head.appendChild(s);
        
        // Session'a kaydet
        sessionStorage.setItem('${sessionKey}', Date.now().toString());
      }
      
      // İlk click'te popup'ı aktive et
      document.addEventListener('click', initPopunder, { once: true });
      
      // 2 dakika sonra otomatik olarak da aktive et (ama daha az agresif)
      setTimeout(initPopunder, 120000);
    })();
  `
  document.head.appendChild(script)
}

export default AdvancedMonetization 