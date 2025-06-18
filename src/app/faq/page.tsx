"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronDown, ChevronRight, Star, Users, Shield, Zap, HelpCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
}

const faqData: FAQItem[] = [
  // Getting Started
  {
    id: "1",
    category: "Getting Started",
    question: "Do I need to create an account to use CVGenius?",
    answer: "No! CVGenius is completely account-free. Just visit the site and start building your CV immediately. Your data is stored locally in your browser, giving you complete privacy and control."
  },
  {
    id: "2", 
    category: "Getting Started",
    question: "Is CVGenius really free?",
    answer: "Yes, CVGenius is 100% free with no hidden costs, subscriptions, or premium tiers. We built this as a community service for Dublin's tech scene and believe everyone deserves access to professional CV tools."
  },
  {
    id: "3",
    category: "Getting Started", 
    question: "How long does it take to create a CV?",
    answer: "Most users complete their CV in 15-30 minutes. Our AI suggestions and Irish market templates help speed up the process significantly compared to starting from scratch."
  },

  // Irish Job Market
  {
    id: "4",
    category: "Irish Job Market",
    question: "What makes CVGenius specific to the Irish job market?",
    answer: "CVGenius includes Dublin-specific features like +353 phone formatting, Irish address defaults, GDPR-compliant design (no photos), 2-page CV standards, and keywords relevant to Irish employers like 'EU work authorization' and 'Stamp 4'."
  },
  {
    id: "5",
    category: "Irish Job Market",
    question: "Should I include a photo on my CV for Irish jobs?",
    answer: "No. Irish employers generally don't expect photos on CVs, and including one can actually hurt your chances due to GDPR compliance concerns and bias prevention. CVGenius templates are designed without photo sections."
  },
  {
    id: "6",
    category: "Irish Job Market",
    question: "What's the ideal CV length for Dublin jobs?",
    answer: "2 pages maximum is the standard for Irish CVs. CVGenius will warn you if your CV exceeds this limit and provides suggestions to trim content while maintaining impact."
  },
  {
    id: "7",
    category: "Irish Job Market", 
    question: "Do I need to mention work authorization status?",
    answer: "Yes, it's helpful to mention your work authorization status. Include phrases like 'EU Citizen', 'Stamp 4 holder', or 'Eligible to work in Ireland' in your personal details or summary section."
  },

  // Privacy & Security
  {
    id: "8",
    category: "Privacy & Security",
    question: "Where is my CV data stored?",
    answer: "All your CV data is stored locally in your browser's localStorage. We never see, store, or have access to your personal information. You maintain complete control over your data."
  },
  {
    id: "9",
    category: "Privacy & Security",
    question: "Is my data shared with third parties?",
    answer: "Never. We don't collect personal data, so there's nothing to share. The only data that leaves your device is when you use AI features, which are processed in real-time by Google's Gemini API and not stored."
  },
  {
    id: "10",
    category: "Privacy & Security",
    question: "Can I back up my CV data?",
    answer: "Yes! CVGenius allows you to export your CV data as JSON for backup purposes. You can also import this data later to restore your CVs on any device."
  },

  // Features
  {
    id: "11",
    category: "Features",
    question: "How does the AI content suggestion work?",
    answer: "Our AI analyzes your job title, experience, and target role to suggest relevant content, keywords, and improvements. It's specifically trained on Irish job market requirements and ATS optimization."
  },
  {
    id: "12",
    category: "Features",
    question: "What is ATS and why does it matter?",
    answer: "ATS (Applicant Tracking System) is software used by most Irish companies to filter CVs before human review. Our ATS checker ensures your CV is formatted correctly and includes relevant keywords to pass these filters."
  },
  {
    id: "13",
    category: "Features",
    question: "Can I export my CV to different formats?",
    answer: "Yes! CVGenius supports export to PDF (recommended), DOCX, plain text, and JSON backup formats. PDF is best for applications as it preserves formatting across all devices."
  },

  // Technical
  {
    id: "14",
    category: "Technical",
    question: "Which browsers does CVGenius support?",
    answer: "CVGenius works on all modern browsers including Chrome, Firefox, Safari, and Edge. We recommend using the latest version for the best experience."
  },
  {
    id: "15",
    category: "Technical",
    question: "Can I use CVGenius on mobile?",
    answer: "Absolutely! CVGenius is fully responsive and works great on mobile devices. You can even install it as a PWA (Progressive Web App) for a native app-like experience."
  },
  {
    id: "16",
    category: "Technical",
    question: "What happens if I clear my browser data?",
    answer: "Your CV data will be lost if you clear browser data without backing it up first. We recommend exporting your CV data regularly or using the auto-save feature."
  },

  // Community
  {
    id: "17",
    category: "Community",
    question: "How can I get help with my CV?",
    answer: "Join our WhatsApp group or Slack community! The Dublin tech community is incredibly supportive and regularly provides CV reviews, job tips, and career advice."
  },
  {
    id: "18", 
    category: "Community",
    question: "Can I contribute to CVGenius development?",
    answer: "Yes! CVGenius is open source and we welcome contributions. Check our GitHub repository for issues, feature requests, and contribution guidelines."
  }
]

const categories = ["Getting Started", "Irish Job Market", "Privacy & Security", "Features", "Technical", "Community"]

export default function FAQPage() {
  const [expandedItems, setExpandedItems] = useState<string[]>(["1"]) // First item expanded by default
  const [selectedCategory, setSelectedCategory] = useState<string>("All")

  const toggleItem = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const filteredFAQs = selectedCategory === "All" 
    ? faqData 
    : faqData.filter(item => item.category === selectedCategory)

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-4">
            <HelpCircle className="h-12 w-12 text-cvgenius-purple" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about creating professional CVs for the Irish job market
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12"
        >
          {[
            { icon: Users, label: "Users Helped", value: "2,500+" },
            { icon: Star, label: "Success Rate", value: "94%" },
            { icon: Shield, label: "Privacy First", value: "100%" },
            { icon: Zap, label: "Avg. Build Time", value: "20 min" }
          ].map((stat) => (
            <div key={stat.label} className="text-center p-4 bg-muted/30 rounded-lg">
              <stat.icon className="h-6 w-6 text-cvgenius-purple mx-auto mb-2" />
              <div className="font-bold text-lg">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Category Filter */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant={selectedCategory === "All" ? "cvgenius" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("All")}
            >
              All Questions
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "cvgenius" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* FAQ Items */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          {filteredFAQs.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleItem(item.id)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs bg-cvgenius-purple/10 text-cvgenius-purple px-2 py-1 rounded-full">
                      {item.category}
                    </span>
                  </div>
                  <h3 className="font-medium mt-2">{item.question}</h3>
                </div>
                <motion.div
                  animate={{ rotate: expandedItems.includes(item.id) ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {expandedItems.includes(item.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4 text-muted-foreground">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center bg-cvgenius-purple/5 rounded-lg p-8"
        >
          <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-muted-foreground mb-6">
            Join our active community of Dublin tech professionals for real-time help and support
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="cvgenius" asChild>
              <Link href="https://chat.whatsapp.com/COtiAFIipkHA9PLo6G3pTT" target="_blank" rel="noopener noreferrer">
                Join WhatsApp Group
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="https://join.slack.com/t/corporatecare-x2t7491/shared_invite/zt-36v0dw0pf-5Pic~nMl_soYczCI3hZIXw" target="_blank" rel="noopener noreferrer">
                Join Slack Community
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Back to Home */}
        <div className="mt-12 text-center">
          <Button variant="outline" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}