"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Star, Zap, Shield, Heart, CheckCircle, ArrowRight, Users, Award, Clock, FileText, Download, Target, Brain } from "lucide-react"
import { motion } from "framer-motion"
import { IrishFlag, ShamrockIcon } from "@/components/ui/irish-flag"
import { SidebarAds } from "@/components/ads/sidebar-ads"
import { BannerAds } from "@/components/ads/banner-ads"

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Enhanced Hero Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-background via-muted/20 to-cvgenius-purple/10 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="absolute top-0 right-0 -mt-40 -mr-40 w-80 h-80 cvgenius-gradient rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-0 left-0 -mb-40 -ml-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl opacity-20" />
        
        <div className="container mx-auto px-4 text-center relative">
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <Star className="h-16 w-16 text-cvgenius-purple fill-cvgenius-purple animate-pulse" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-2 border-cvgenius-purple/20 rounded-full"
              />
            </div>
          </motion.div>
          
          <motion.h1 
            {...fadeInUp}
            className="text-4xl lg:text-6xl font-bold mb-6 leading-tight"
          >
            Create <span className="cvgenius-text-gradient">ATS-Friendly CVs</span>
            <br />
            with AI for <span className="text-green-600 flex items-center gap-2 justify-center">
              Dublin Jobs <IrishFlag size="md" />
            </span>
          </motion.h1>
          
          <motion.p 
            {...fadeInUp}
            transition={{ delay: 0.2 }}
            className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            Build professional CVs optimized for the Irish job market. 
            AI-powered, privacy-first, and completely free. No signup required.
            <ShamrockIcon className="inline-block ml-2 h-5 w-5" />
          </motion.p>
          
          <motion.div 
            {...fadeInUp}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Button variant="cvgenius" size="lg" className="group" asChild>
              <Link href="/builder">
                <Zap className="mr-2 h-5 w-5" />
                Start Building Now
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/examples">
                <FileText className="mr-2 h-4 w-4" />
                View Examples
              </Link>
            </Button>
          </motion.div>

          {/* Key Benefits */}
          <motion.div 
            variants={staggerChildren}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            {[
              { icon: Brain, title: "AI-Powered", desc: "Smart suggestions tailored for Irish job market" },
              { icon: Shield, title: "Privacy First", desc: "No accounts, no tracking, your data stays local" },
              { icon: Heart, title: "100% Free", desc: "Made with love for Cem Koyluoglu" }
            ].map((item, index) => (
              <motion.div 
                key={item.title}
                variants={fadeInUp}
                className="text-center group"
              >
                <div className="w-12 h-12 cvgenius-gradient rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>


      {/* Quick Tools Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="lg:flex-1">
              <motion.h2 
                {...fadeInUp}
                className="text-3xl font-bold text-center mb-12"
              >
                Everything You Need to Land Your Dream Job
              </motion.h2>
          
          <motion.div 
            variants={staggerChildren}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { 
                icon: FileText, 
                title: "CV Builder", 
                desc: "Professional CVs with AI suggestions",
                href: "/builder",
                time: "5 min",
                variant: "cvgenius" as const
              },
              { 
                icon: Target, 
                title: "ATS Check", 
                desc: "Instant compatibility scoring",
                href: "/ats-check",
                time: "30 sec",
                variant: "outline" as const
              },
              { 
                icon: Award, 
                title: "Cover Letters", 
                desc: "Tailored letters in 6 templates",
                href: "/cover-letter",
                time: "2 min",
                variant: "outline" as const
              },
              { 
                icon: Download, 
                title: "Export CV", 
                desc: "PDF, Word & text formats",
                href: "/export",
                time: "Instant",
                variant: "outline" as const
              }
            ].map((tool, index) => (
              <motion.div 
                key={tool.title}
                variants={fadeInUp}
                className="bg-card p-6 rounded-lg shadow-sm border hover:shadow-md transition-all duration-300 group hover:border-cvgenius-purple/50"
              >
                <div className="flex items-center justify-between mb-4">
                  <tool.icon className="h-8 w-8 text-cvgenius-purple group-hover:scale-110 transition-transform" />
                  <span className="text-xs bg-cvgenius-purple/10 text-cvgenius-purple px-2 py-1 rounded-full">
                    {tool.time}
                  </span>
                </div>
                <h3 className="font-semibold mb-2">{tool.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{tool.desc}</p>
                <Button variant={tool.variant} size="sm" className="w-full" asChild>
                  <Link href={tool.href}>
                    Get Started
                    <ArrowRight className="ml-2 h-3 w-3" />
                  </Link>
                </Button>
              </motion.div>
            ))}
          </motion.div>
            </div>

            {/* Sidebar Ads */}
            <div className="lg:w-80">
              <div className="sticky top-8">
                <SidebarAds />
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Community Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4">
          <motion.div 
            {...fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Join Ireland's Leading Career Community
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
              Connect with job seekers, share insights, and accelerate your career journey with Ireland's most supportive professional network.
            </p>
          </motion.div>
          
          <motion.div 
            {...fadeInUp}
            transition={{ delay: 0.2 }}
            className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12"
          >
            {/* WhatsApp Community */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.525 3.488"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">WhatsApp Community</h3>
                  <p className="text-green-600 font-medium">Instant Networking</p>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Join our active WhatsApp group for real-time job alerts, quick networking, and immediate support from fellow professionals.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2 text-green-500" />
                  Real-time job postings & alerts
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2 text-green-500" />
                  Active community discussions
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Award className="h-4 w-4 mr-2 text-green-500" />
                  Quick interview tips & advice
                </div>
              </div>
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white" asChild>
                <Link href="https://chat.whatsapp.com/COtiAFIipkHA9PLo6G3pTT" target="_blank" rel="noopener noreferrer">
                  Join WhatsApp Group
                  <span className="ml-2 bg-green-800 text-green-100 text-xs px-2 py-1 rounded-full">250+ Members</span>
                </Link>
              </Button>
            </div>

            {/* Slack Community */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.521-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.523 2.521h-2.521V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.521A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.523v-2.521h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Slack Workspace</h3>
                  <p className="text-purple-600 font-medium">Professional Hub</p>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Access our comprehensive Slack workspace with dedicated channels for different industries, CV reviews, and structured networking.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <FileText className="h-4 w-4 mr-2 text-purple-500" />
                  Structured CV feedback & reviews
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Target className="h-4 w-4 mr-2 text-purple-500" />
                  Industry-specific job channels
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Brain className="h-4 w-4 mr-2 text-purple-500" />
                  Expert career coaching sessions
                </div>
              </div>
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white" asChild>
                <Link href="https://join.slack.com/t/corporatecare-x2t7491/shared_invite/zt-36v0dw0pf-5Pic~nMl_soYczCI3hZIXw" target="_blank" rel="noopener noreferrer">
                  Join Slack Workspace
                  <span className="ml-2 bg-purple-800 text-purple-100 text-xs px-2 py-1 rounded-full">800+ Members</span>
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Community Benefits */}
          <motion.div 
            {...fadeInUp}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <h3 className="text-xl font-semibold mb-6 text-gray-800">Why Join Our Communities?</h3>
            <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Daily Updates</h4>
                <p className="text-sm text-gray-600">Fresh job postings every day</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Peer Support</h4>
                <p className="text-sm text-gray-600">Connect with like-minded professionals</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Expert Advice</h4>
                <p className="text-sm text-gray-600">Tips from industry professionals</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="h-6 w-6 text-orange-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Success Stories</h4>
                <p className="text-sm text-gray-600">Learn from successful job searches</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bottom Banner Ad */}
      <section className="bg-white py-6 border-t">
        <div className="container mx-auto px-4">
          <BannerAds size="large" />
        </div>
      </section>

    </div>
  )
}