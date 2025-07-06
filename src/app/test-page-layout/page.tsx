'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, FileText } from 'lucide-react'

export default function TestPageLayout() {
  const [pageCount, setPageCount] = useState(2)

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">CV Page Layout Test</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - Controls */}
        <div className="space-y-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Test Controls</h2>
            <div className="flex items-center gap-4 mb-4">
              <Button 
                onClick={() => setPageCount(Math.max(1, pageCount - 1))}
                variant="outline"
              >
                - Page
              </Button>
              <span className="font-medium">Pages: {pageCount}</span>
              <Button 
                onClick={() => setPageCount(pageCount + 1)}
                variant="outline"
              >
                + Page
              </Button>
            </div>
          </Card>

          {/* Warning Message */}
          {pageCount > 1 && (
            <Card className="p-4 bg-amber-50 border-amber-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    Not: CV'niz {pageCount} sayfa içermektedir.
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    'Languages' ve 'References' gibi bazı bölümler yeni sayfada yer almaktadır. 
                    Lütfen PDF'nin tamamını kontrol ediniz.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right Side - Preview */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Preview</h2>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Auto-updates</Badge>
              {pageCount > 1 && (
                <Badge 
                  variant={pageCount > 2 ? "destructive" : "default"} 
                  className="flex items-center gap-1"
                >
                  {pageCount > 2 && <AlertTriangle className="w-3 h-3" />}
                  {pageCount} pages
                </Badge>
              )}
            </div>
          </div>

          {/* Mock CV Pages */}
          <div className="space-y-4">
            {Array.from({ length: pageCount }, (_, i) => (
              <Card key={i} className="relative overflow-hidden bg-white shadow-lg">
                <div className="aspect-[210/297] bg-gray-50 p-8">
                  <div className="absolute top-4 right-4 bg-gray-800/90 text-white text-sm px-3 py-1 rounded-lg font-medium">
                    Page {i + 1} of {pageCount}
                  </div>
                  
                  <div className="space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="space-y-2 mt-8">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </div>

                  {/* Page Break Indicator */}
                  {i < pageCount - 1 && (
                    <div className="absolute bottom-0 left-0 right-0">
                      <div className="h-px bg-gradient-to-r from-transparent via-red-400 to-transparent"></div>
                      <div className="text-center py-2 text-xs text-gray-500 bg-gray-100">
                        ── Page Break ──
                      </div>
                    </div>
                  )}

                  {/* Content labels for specific pages */}
                  {i === 1 && pageCount > 1 && (
                    <div className="absolute bottom-8 left-8 right-8">
                      <div className="p-3 bg-blue-50 rounded border border-blue-200">
                        <p className="text-sm font-medium text-blue-800">
                          Languages & References sections appear here
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}