"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Home, Search, MapPin, Coffee } from "lucide-react"
import { motion } from "framer-motion"

const irishQuotes = [
  "Ah sure, you've taken a wrong turn somewhere!",
  "This page has gone on the lash and hasn't come home yet!",
  "Looks like this page is off having a pint in Temple Bar.",
  "Fair dinkum, this page must be stuck in traffic on the M50!",
  "This page is about as lost as a tourist in Dublin without a map.",
  "Grand so, seems this page has wandered off for a chicken roll.",
]

export default function NotFound() {
  const randomQuote = irishQuotes[Math.floor(Math.random() * irishQuotes.length)]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30">
      <div className="max-w-lg mx-auto text-center p-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="mb-8"
        >
          <div className="text-8xl font-bold text-cvgenius-purple mb-4">404</div>
          <MapPin className="h-16 w-16 mx-auto text-muted-foreground" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
          
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6 text-left">
            <p className="text-green-700 italic">
              "{randomQuote}"
            </p>
            <p className="text-green-600 text-sm mt-1">- Your friendly Dublin developer</p>
          </div>

          <p className="text-muted-foreground mb-8">
            Don't worry, your CV data is safe! This page just seems to have wandered off 
            for a coffee break. Let's get you back on track to landing that dream job in Dublin.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button variant="cvgenius" asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Back Home
              </Link>
            </Button>
            
            <Button variant="outline" asChild>
              <Link href="/builder">
                <Coffee className="mr-2 h-4 w-4" />
                Build CV
              </Link>
            </Button>
          </div>

          <div className="flex justify-center">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/faq">
                <Search className="mr-2 h-4 w-4" />
                Search FAQ
              </Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-xs text-muted-foreground"
        >
          <p>Lost? Join our WhatsApp group for help from the Dublin tech community!</p>
        </motion.div>
      </div>
    </div>
  )
}