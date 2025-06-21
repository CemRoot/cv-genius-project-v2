'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MainLayout } from '@/components/layout/main-layout'
import { useMobileKeyboard } from '@/components/mobile'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Heart, Zap, Clock, CheckCircle, ArrowRight, Star } from 'lucide-react'

export default function CoverLetterPage() {
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)
  const { isKeyboardOpen, adjustedViewHeight } = useMobileKeyboard()

  // Detect mobile device
  useEffect(() => {
    // Ensure we're in the browser environment
    if (typeof window === 'undefined') return
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleStartBuilding = () => {
    router.push('/cover-letter/experience')
  }

  return (
    <MainLayout>
      <div 
        className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100"
        style={{ height: isMobile && isKeyboardOpen ? adjustedViewHeight : 'auto' }}
      >
        {/* Enhanced Mobile Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex justify-center mb-4"
              >
                <div className="bg-blue-100 rounded-full p-3 md:p-4">
                  <FileText className="h-8 w-8 md:h-12 md:w-12 text-blue-600" />
                </div>
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-2xl md:text-4xl font-bold text-gray-900 mb-4"
              >
                AI Cover Letter Builder
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto px-2"
              >
                Create professional cover letters tailored to your experience and career goals. 
                Our smart builder guides you through every step.
              </motion.p>
              
              {/* Mobile Quick Stats */}
              {isMobile && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex justify-center gap-6 mt-6 px-4"
                >
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">5min</div>
                    <div className="text-xs text-gray-500">Setup Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">AI</div>
                    <div className="text-xs text-gray-500">Powered</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-purple-600">Free</div>
                    <div className="text-xs text-gray-500">Forever</div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Enhanced Feature Cards for Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-8 md:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="p-4 md:p-6 text-center hover:shadow-lg transition-all duration-300 touch-manipulation group">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-7 h-7 md:w-8 md:h-8 text-blue-600" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">Smart Questionnaire</h3>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                Answer a few questions about your experience and background to personalize your cover letter
              </p>
              <div className="mt-4 flex items-center justify-center text-blue-600 text-sm font-medium">
                <Clock className="w-4 h-4 mr-1" />
                2-3 minutes
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="p-4 md:p-6 text-center hover:shadow-lg transition-all duration-300 touch-manipulation group">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Heart className="w-7 h-7 md:w-8 md:h-8 text-green-600" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">Choose Template</h3>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                Select from professionally designed templates and customize colors to match your style
              </p>
              <div className="mt-4 flex items-center justify-center text-green-600 text-sm font-medium">
                <Star className="w-4 h-4 mr-1" />
                6 Professional Templates
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="p-4 md:p-6 text-center hover:shadow-lg transition-all duration-300 touch-manipulation group">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7 md:w-8 md:h-8 text-purple-600" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">AI Generation</h3>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                Generate compelling content powered by AI, tailored to your specific situation and goals
              </p>
              <div className="mt-4 flex items-center justify-center text-purple-600 text-sm font-medium">
                <CheckCircle className="w-4 h-4 mr-1" />
                Instant Results
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Enhanced Mobile CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <div className="space-y-4">
            {/* Main CTA Button */}
            <Button
              onClick={handleStartBuilding}
              size="lg"
              className={`group relative overflow-hidden transition-all duration-300 ${
                isMobile 
                  ? 'w-full h-14 text-lg font-semibold touch-manipulation' 
                  : 'px-8 py-4 text-lg font-semibold hover:scale-105'
              }`}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Start Building Your Cover Letter
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>

            {/* Mobile-specific quick info */}
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>5 min setup</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Free forever</span>
              </div>
            </div>

            {/* Mobile step indicator preview */}
            {isMobile && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mt-6 p-4 bg-gray-50 rounded-lg"
              >
                <div className="text-sm font-medium text-gray-700 mb-3">Your Journey:</div>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mb-1">
                      <span className="text-white text-xs font-bold">1</span>
                    </div>
                    <span className="text-xs text-gray-600">Experience</span>
                  </div>
                  <div className="flex-1 h-px bg-gray-300 mx-2"></div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mb-1">
                      <span className="text-gray-600 text-xs font-bold">2</span>
                    </div>
                    <span className="text-xs text-gray-600">Template</span>
                  </div>
                  <div className="flex-1 h-px bg-gray-300 mx-2"></div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mb-1">
                      <span className="text-gray-600 text-xs font-bold">3</span>
                    </div>
                    <span className="text-xs text-gray-600">Generate</span>
                  </div>
                  <div className="flex-1 h-px bg-gray-300 mx-2"></div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mb-1">
                      <span className="text-gray-600 text-xs font-bold">4</span>
                    </div>
                    <span className="text-xs text-gray-600">Download</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
      </div>
    </MainLayout>
  )
}