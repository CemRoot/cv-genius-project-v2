'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function TwoFactorAuthPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to admin panel with security tab
    router.push('/admin?tab=security')
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Redirecting to admin panel...</p>
      </div>
    </div>
  )
}