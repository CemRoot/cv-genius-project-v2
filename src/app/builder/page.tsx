'use client'

import { WebBuilderFlow } from './web/web-builder-flow'
import { useMaintenance } from '@/hooks/use-maintenance'
import { useAutoSave } from '@/hooks/use-auto-save'
import { FloatingAutoSaveIndicator } from '@/components/ui/auto-save-status'

export default function CVBuilderPage() {
  useMaintenance() // Just run the hook
  
  // Enable auto-save for CV builder
  useAutoSave({
    enabled: true,
    interval: 30000, // 30 seconds
    debounceDelay: 2000, // 2 seconds
    onSave: (data) => {
      console.log('✅ CV data auto-saved successfully')
    },
    onError: (error) => {
      console.error('❌ Auto-save failed:', error)
    }
  })
  
  return (
    <>
      <WebBuilderFlow />
      <FloatingAutoSaveIndicator />
    </>
  )
}