'use client'

import { useCVStore } from '@/store/cv-store'
import { useEffect } from 'react'

export default function TestDebugPage() {
  const { currentCV } = useCVStore()
  
  useEffect(() => {
    console.log('Current CV Data:', currentCV)
  }, [currentCV])
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">CV Debug Page</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Personal Info:</h2>
          <pre className="text-sm">{JSON.stringify(currentCV?.personal || {}, null, 2)}</pre>
        </div>
        
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Experience:</h2>
          <pre className="text-sm">{JSON.stringify(currentCV?.experience || [], null, 2)}</pre>
        </div>
        
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Full CV Data:</h2>
          <pre className="text-sm overflow-auto max-h-96">{JSON.stringify(currentCV, null, 2)}</pre>
        </div>
      </div>
    </div>
  )
}