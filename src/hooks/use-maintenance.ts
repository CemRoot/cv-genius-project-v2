'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export function useMaintenance() {
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(false) // Start with false to avoid hydration mismatch

  useEffect(() => {
    // Skip for admin and API routes
    if (pathname.startsWith('/admin') || pathname.startsWith('/api') || pathname === '/maintenance') {
      return
    }

    const checkMaintenance = async () => {
      setIsChecking(true)
      try {
        const response = await fetch('/api/maintenance/status')
        if (response.ok) {
          const data = await response.json()
          
          // Check if current path is in maintenance
          const section = data.sections?.find((s: any) => 
            pathname.startsWith(s.path) && s.isInMaintenance
          )
          
          if (section) {
            // Redirect to maintenance page
            window.location.href = `/maintenance?section=${encodeURIComponent(section.name)}&message=${encodeURIComponent(section.message)}&estimatedTime=${encodeURIComponent(section.estimatedTime)}`
          }
        }
      } catch (error) {
        console.error('Maintenance check error:', error)
      } finally {
        setIsChecking(false)
      }
    }

    // Delay check to avoid hydration issues
    const timer = setTimeout(checkMaintenance, 100)
    return () => clearTimeout(timer)
  }, [pathname])

  return isChecking
}