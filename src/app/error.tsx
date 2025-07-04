"use client"

import { useEffect } from "react"
import "@/styles/404.css"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
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
                  Something went wrong!
                </h3>
                
                <p>We encountered an error while processing your request.</p>
                
                {error?.message && (
                  <div className="error-details">
                    <p>
                      <strong>Error:</strong> {error.message}
                    </p>
                  </div>
                )}
                
                <div className="button-group">
                  <button onClick={reset} className="link_404">
                    Try Again
                  </button>
                  <a href="/" className="link_404">
                    Back to Home
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}