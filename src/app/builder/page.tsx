'use client'

import { WebBuilderFlow } from './web/web-builder-flow'
import { useMaintenance } from '@/hooks/use-maintenance'

export default function CVBuilderPage() {
  useMaintenance() // Just run the hook
  
  return <WebBuilderFlow />
}