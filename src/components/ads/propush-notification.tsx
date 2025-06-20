'use client'

import { useEffect, useState } from 'react'

export default function PropuShNotification() {
  const [hasShown, setHasShown] = useState(false)

  useEffect(() => {
    // Daha az agresif popup gösterimi
    const showPopupInterval = 5 * 60 * 1000 // 5 dakikada bir göster
    const initialDelay = 30 * 1000 // İlk 30 saniye bekle
    
    // Session storage'da kontrol et
    const lastShown = sessionStorage.getItem('propush-last-shown')
    const now = Date.now()
    
    if (lastShown && (now - parseInt(lastShown)) < showPopupInterval) {
      return // Henüz yeterli zaman geçmemiş
    }

    // İlk gösterim gecikmesi
    const initialTimer = setTimeout(() => {
      if (!hasShown) {
        // PropuSH script'ini yükle
        const script = document.createElement('script')
        script.src = '/sw-check-permissions-36fdf.js'
        script.async = true
        document.head.appendChild(script)
        
        setHasShown(true)
        sessionStorage.setItem('propush-last-shown', now.toString())
      }
    }, initialDelay)

    return () => {
      clearTimeout(initialTimer)
    }
  }, [hasShown])

  return null
} 