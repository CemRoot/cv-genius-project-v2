import { isMobileDevice } from '@/lib/mobile-detect'
import { ReactNode } from 'react'
import { MainLayout } from '@/components/layout/main-layout'

export default async function BuilderLayout({
  children,
}: {
  children: ReactNode
}) {
  const isMobile = await isMobileDevice()
  
  return (
    <MainLayout>
      <div data-mobile={isMobile ? 'true' : 'false'}>
        {children}
      </div>
    </MainLayout>
  )
}