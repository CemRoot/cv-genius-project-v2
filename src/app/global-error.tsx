"use client"

import "./404.css"

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
        <section className="page_404">
          <div className="container">
            <div className="row">
              <div className="col-sm-12">
                <div className="col-sm-10 col-sm-offset-1 text-center">
                  <div className="four_zero_four_bg">
                    <h1 className="text-center">ERROR</h1>
                  </div>
                  
                  <div className="contant_box_404">
                    <h3 className="h2">
                      Oops! Something went wrong
                    </h3>
                    
                    <p>An unexpected error has occurred. Don't worry, your data is safe!</p>
                    
                    {process.env.NODE_ENV === 'development' && (
                      <details className="mt-4 mb-4 text-left bg-gray-100 p-4 rounded-lg max-w-md mx-auto">
                        <summary className="cursor-pointer font-medium mb-2">
                          Technical Details
                        </summary>
                        <pre className="text-xs overflow-auto whitespace-pre-wrap">
                          {error.message}
                          {error.digest && `\nDigest: ${error.digest}`}
                        </pre>
                      </details>
                    )}
                    
                    <div className="flex gap-4 justify-center">
                      <button onClick={reset} className="link_404">
                        Try Again
                      </button>
                      <a href="/" className="link_404">
                        Go to Home
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </body>
    </html>
  )
}