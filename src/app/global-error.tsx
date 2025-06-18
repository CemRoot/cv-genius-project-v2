"use client"

import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md mx-auto text-center">
            <div className="flex justify-center mb-6">
              <AlertTriangle className="h-16 w-16 text-red-500" />
            </div>
            
            <h1 className="text-2xl font-bold mb-4">Ah Jaysus, Something's Gone Wrong!</h1>
            
            <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-6 text-left">
              <p className="text-orange-700 italic">
                "Well now, that's not supposed to happen! Don't worry, 
                your CV data is still safe as houses in your browser."
              </p>
              <p className="text-orange-600 text-sm mt-1">- CVGenius Error Handler</p>
            </div>

            <p className="text-muted-foreground mb-6">
              Something unexpected happened, but sure we'll sort it out in no time. 
              Your data is safe, and this is probably just a temporary hiccup.
            </p>

            {process.env.NODE_ENV === 'development' && (
              <details className="mb-6 text-left bg-muted/30 p-4 rounded-lg">
                <summary className="cursor-pointer font-medium mb-2">
                  Technical Details (Development)
                </summary>
                <pre className="text-xs overflow-auto whitespace-pre-wrap">
                  {error.message}
                  {error.digest && `\nDigest: ${error.digest}`}
                </pre>
              </details>
            )}

            <div className="space-y-4">
              <Button onClick={reset} variant="cvgenius" className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              
              <Button variant="outline" onClick={() => window.location.href = '/'} className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-6">
              If this keeps happening, drop us a line in our WhatsApp group. 
              The Dublin tech community is always happy to help!
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}