import { isMobileDevice } from '@/lib/mobile-detect'
import { ReactNode } from 'react'

export default async function BuilderLayout({
  children,
}: {
  children: ReactNode
}) {
  const isMobile = await isMobileDevice()
  
  return (
    <div data-mobile={isMobile ? 'true' : 'false'}>
      {children}
    </div>
  )
}