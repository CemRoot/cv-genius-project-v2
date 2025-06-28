'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ClearPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Clear all storage
    sessionStorage.clear()
    localStorage.clear()
    
    // Redirect to builder
    router.push('/builder')
  }, [router])
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Clearing storage...</p>
    </div>
  )
}