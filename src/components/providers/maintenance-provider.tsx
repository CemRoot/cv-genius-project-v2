'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface MaintenanceProviderProps {
  children: React.ReactNode
}

export function MaintenanceProvider({ children }: MaintenanceProviderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Skip maintenance check for certain paths
    if (
      pathname.startsWith('/admin') ||
      pathname.startsWith('/api') ||
      pathname === '/maintenance' ||
      pathname.startsWith('/_next')
    ) {
      setIsChecking(false)
      return
    }

    const checkMaintenanceStatus = async () => {
      try {
        const response = await fetch('/api/maintenance/status', {
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()

          // Check global maintenance
          if (data.globalMaintenance) {
            router.replace(`/maintenance?section=Site&message=${encodeURIComponent('The entire site is currently undergoing maintenance.')}&estimatedTime=1+hour`)
            return
          }

          // Check section-specific maintenance
          const section = data.sections?.find((s: any) =>
            pathname.startsWith(s.path) && s.isInMaintenance
          )

          if (section) {
            const params = new URLSearchParams({
              section: section.name,
              message: section.message,
              estimatedTime: section.estimatedTime
            })
            router.replace(`/maintenance?${params.toString()}`)
            return
          }
        }
      } catch (error) {
        console.error('Error checking maintenance status:', error)
      } finally {
        setIsChecking(false)
      }
    }

    checkMaintenanceStatus()
  }, [pathname, router])

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return <>{children}</>
}