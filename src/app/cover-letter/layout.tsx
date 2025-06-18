import { CoverLetterProvider } from '@/contexts/cover-letter-context'

export default function CoverLetterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CoverLetterProvider>
      {children}
    </CoverLetterProvider>
  )
}