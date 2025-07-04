import { Suspense } from 'react'
import { MaintenanceDisplay } from '@/components/maintenance-display'

export const metadata = {
  title: 'Maintenance - CV Genius',
  description: 'We are currently performing maintenance. Please check back later.',
}

export default function Maintenance() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    }>
      <MaintenanceDisplay />
    </Suspense>
  )
}