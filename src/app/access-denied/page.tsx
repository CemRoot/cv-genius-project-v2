"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Home, Shield } from "lucide-react"
import "@/styles/404.css"

export default function AccessDenied() {
  return (
    <section className="page_404">
      <div className="container">
        <div className="row">
          <div className="col-sm-12">
            <div className="col-sm-10 col-sm-offset-1 text-center">
              <div className="four_zero_four_bg">
                <h1 className="text-center">403</h1>
              </div>
              
              <div className="contant_box_404">
                <h3 className="h2">
                  <Shield className="inline mr-2" size={32} />
                  Access Denied
                </h3>
                
                <p>You don't have permission to access this area!</p>
                <p className="text-sm text-gray-500 mt-2">Only authorized users can access the admin panel.</p>
                
                <Link href="/" className="link_404">
                  <Home className="inline mr-2" size={16} />
                  Go to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 