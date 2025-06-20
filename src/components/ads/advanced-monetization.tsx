'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export function AdvancedMonetization() {
  const [isInitialized, setIsInitialized] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // Popup'ları belirli sayfalarda gösterme
    const restrictedPages = ['/builder', '/export', '/ats-check', '/admin']
    const shouldSkip = restrictedPages.some(page => pathname.includes(page))
    
    if (shouldSkip || isInitialized) {
      return
    }

    // Session'da popup kontrolü
    const lastPopup = sessionStorage.getItem('monetag-popup-shown')
    const now = Date.now()
    const cooldownPeriod = 10 * 60 * 1000 // 10 dakika cooldown

    if (lastPopup && (now - parseInt(lastPopup)) < cooldownPeriod) {
      return
    }

    // İlk sayfa yüklemesinden sonra gecikme
    const timer = setTimeout(() => {
      // Monetag zone 9469379 (OnClick/Popunder) - kontrollü şekilde
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
            s.setAttribute('data-zone', '9469379');
            s.setAttribute('data-cfasync', 'false');
            document.head.appendChild(s);
            
            // Session'a kaydet
            sessionStorage.setItem('monetag-popup-shown', Date.now().toString());
          }
          
          // İlk click'te popup'ı aktive et
          document.addEventListener('click', initPopunder, { once: true });
          
          // 2 dakika sonra otomatik olarak da aktive et (ama daha az agresif)
          setTimeout(initPopunder, 120000);
        })();
      `
      document.head.appendChild(script)
      setIsInitialized(true)
    }, 5000) // 5 saniye gecikme

    return () => clearTimeout(timer)
  }, [pathname, isInitialized])

  return null
}

export default AdvancedMonetization 