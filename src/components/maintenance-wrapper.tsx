'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { MaintenancePage } from './maintenance-page'
import { Loader2 } from 'lucide-react'

interface MaintenanceWrapperProps {
  children: React.ReactNode
}

export function MaintenanceWrapper({ children }: MaintenanceWrapperProps) {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [maintenanceInfo, setMaintenanceInfo] = useState<{
    isInMaintenance: boolean
    sectionName?: string
    message?: string
    estimatedTime?: string
  }>({ isInMaintenance: false })

  useEffect(() => {
    console.log('🔧 MaintenanceWrapper: Checking maintenance for path:', pathname)
    
    // Skip maintenance check for certain paths
    if (pathname.startsWith('/admin') || 
        pathname.startsWith('/api') || 
        pathname === '/maintenance' ||
        pathname.startsWith('/_next')) {
      console.log('🔧 MaintenanceWrapper: Skipping maintenance check for', pathname)
      setIsLoading(false)
      return
    }

    checkMaintenanceStatus()
  }, [pathname])

  const checkMaintenanceStatus = async () => {
    try {
      const response = await fetch('/api/maintenance/status')
      if (response.ok) {
        const data = await response.json()
        
        // Check global maintenance
        if (data.globalMaintenance) {
          setMaintenanceInfo({
            isInMaintenance: true,
            sectionName: 'The entire site',
            message: 'We are currently performing scheduled maintenance.',
            estimatedTime: '1 hour'
          })
          setIsLoading(false)
          return
        }

        // Check section-specific maintenance
        const section = data.sections.find((s: any) => 
          pathname.startsWith(s.path) && s.isInMaintenance
        )
        
        if (section) {
          setMaintenanceInfo({
            isInMaintenance: true,
            sectionName: section.name,
            message: section.message,
            estimatedTime: section.estimatedTime
          })
        } else {
          setMaintenanceInfo({ isInMaintenance: false })
        }
      }
    } catch (error) {
      console.error('Error checking maintenance status:', error)
      setMaintenanceInfo({ isInMaintenance: false })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (maintenanceInfo.isInMaintenance) {
    return (
      <MaintenancePage
        sectionName={maintenanceInfo.sectionName}
        message={maintenanceInfo.message}
        estimatedTime={maintenanceInfo.estimatedTime}
      />
    )
  }

  return <>{children}</>
}