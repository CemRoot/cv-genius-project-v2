'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Star, Briefcase, TrendingUp, Users, MapPin, Clock, CheckCircle, ArrowRight, FileText, Target } from "lucide-react"
import { motion } from "framer-motion"
import { IrishFlag, ShamrockIcon } from "@/components/ui/irish-flag"
import { MainLayout } from "@/components/layout/main-layout"
import { DublinJobsArticleStructuredData } from "@/components/seo/structured-data"

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

const dublinEmployers = [
  { name: "Google", sector: "Tech", employees: "5000+", growth: "+15%" },
  { name: "Microsoft", sector: "Tech", employees: "2500+", growth: "+12%" },
  { name: "Facebook/Meta", sector: "Tech", employees: "4000+", growth: "+8%" },
  { name: "Bank of Ireland", sector: "Finance", employees: "10000+", growth: "+5%" },
  { name: "AIB", sector: "Finance", employees: "8000+", growth: "+7%" },
  { name: "Accenture", sector: "Consulting", employees: "3000+", growth: "+10%" },
  { name: "Pfizer", sector: "Pharma", employees: "2000+", growth: "+6%" },
  { name: "Johnson & Johnson", sector: "Healthcare", employees: "1500+", growth: "+9%" }
]

const dublinSectors = [
  {
    name: "Technology & IT",
    growth: "18%",
    avgSalary: "€75,000",
    topRoles: ["Software Engineer", "Data Scientist", "Product Manager", "DevOps Engineer"],
    companies: ["Google", "Microsoft", "Meta", "Amazon", "Stripe"]
  },
  {
    name: "Financial Services",
    growth: "12%",
    avgSalary: "€68,000", 
    topRoles: ["Financial Analyst", "Risk Manager", "Investment Banking", "FinTech Developer"],
    companies: ["Bank of Ireland", "AIB", "Central Bank", "NTMA", "Davy"]
  },
  {
    name: "Healthcare & Pharma",
    growth: "15%",
    avgSalary: "€72,000",
    topRoles: ["Clinical Research", "Regulatory Affairs", "Medical Device", "Biotech Engineer"],
    companies: ["Pfizer", "Johnson & Johnson", "Medtronic", "Boston Scientific"]
  },
  {
    name: "Engineering",
    growth: "14%",
    avgSalary: "€70,000",
    topRoles: ["Civil Engineer", "Mechanical Engineer", "Electrical Engineer", "Project Manager"],
    companies: ["Arup", "Jacobs", "RPS", "PM Group"]
  }
]

export default function DublinJobsPage() {
  return (
    <MainLayout>
      <DublinJobsArticleStructuredData />
      
      {/* Hero Section - Mobile Optimized */}
      <section className="py-12 md:py-20 lg:py-32 bg-gradient-to-br from-background via-muted/20 to-cvgenius-purple/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px] md:bg-[size:50px_50px]" />
        <div className="absolute top-0 right-0 -mt-20 -mr-20 md:-mt-40 md:-mr-40 w-40 h-40 md:w-80 md:h-80 cvgenius-gradient rounded-full blur-2xl md:blur-3xl opacity-20" />
        
        <div className="container mx-auto px-4 text-center relative">
          
          <motion.h1 
            {...fadeInUp}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight px-2"
          >
            <span className="cvgenius-text-gradient">Dublin Jobs Market</span>
            <br />
            2025 Guide <span className="text-green-600 inline-flex items-center gap-1 md:gap-2 justify-center flex-wrap">
              <IrishFlag size="sm" className="md:hidden" /><IrishFlag size="md" className="hidden md:inline" /> & CV Tips
            </span>
          </motion.h1>
          
          <motion.p 
            {...fadeInUp}
            transition={{ delay: 0.2 }}
            className="text-base md:text-lg lg:text-xl text-muted-foreground mb-6 md:mb-8 max-w-3xl mx-auto px-4"
          >
            Master the Dublin job market with our comprehensive guide. Get insights on top employers, 
            salary trends, and create winning CVs tailored for Dublin's competitive landscape.
            <ShamrockIcon className="inline-block ml-2 h-4 w-4 md:h-5 md:w-5" />
          </motion.p>
          
          <motion.div 
            {...fadeInUp}
            transition={{ delay: 0.4 }}
            className="flex flex-col gap-3 md:gap-4 justify-center mb-8 md:mb-12 px-4"
          >
            <Button 
              variant="cvgenius" 
              size="lg" 
              className="group w-full sm:w-auto min-h-[48px] text-base font-semibold touch-manipulation" 
              asChild
            >
              <Link href="/builder">
                <FileText className="mr-2 h-5 w-5" />
                Build Dublin-Ready CV
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto min-h-[48px] text-base touch-manipulation" 
              asChild
            >
              <Link href="/ats-check">
                <Target className="mr-2 h-4 w-4" />
                Check ATS Compatibility
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Dublin Job Market Stats - Mobile Optimized */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.h2 
            {...fadeInUp}
            className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 px-2"
          >
            Dublin Job Market Overview 2025
          </motion.h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
            {[
              { icon: TrendingUp, title: "Job Growth", value: "15.3%", desc: "Year-over-year increase" },
              { icon: Users, title: "Open Positions", value: "28,500+", desc: "Active job listings" },
              { icon: MapPin, title: "Top Location", value: "Dublin 2", desc: "Most opportunities" },
              { icon: Clock, title: "Hiring Time", value: "3-4 weeks", desc: "Average process" }
            ].map((stat, index) => (
              <motion.div
                key={stat.title}
                {...fadeInUp}
                transition={{ delay: index * 0.1 }}
                className="bg-card p-4 md:p-6 rounded-lg shadow-sm border text-center hover:shadow-md transition-all duration-300 touch-manipulation"
              >
                <stat.icon className="h-6 w-6 md:h-8 md:w-8 text-cvgenius-purple mx-auto mb-3 md:mb-4" />
                <h3 className="text-xl md:text-2xl font-bold mb-2">{stat.value}</h3>
                <p className="font-semibold mb-1 text-sm md:text-base">{stat.title}</p>
                <p className="text-xs md:text-sm text-muted-foreground">{stat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Dublin Employers - Mobile Optimized */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.h2 
            {...fadeInUp}
            className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 px-2"
          >
            Top Dublin Employers Hiring in 2025
          </motion.h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {dublinEmployers.map((employer, index) => (
              <motion.div
                key={employer.name}
                {...fadeInUp}
                transition={{ delay: index * 0.05 }}
                className="bg-card p-3 md:p-4 rounded-lg border hover:shadow-md transition-all duration-300 touch-manipulation"
              >
                <h4 className="font-semibold text-base md:text-lg mb-2 truncate">{employer.name}</h4>
                <div className="space-y-1 text-xs md:text-sm">
                  <p className="text-muted-foreground">Sector: {employer.sector}</p>
                  <p className="text-muted-foreground">Size: {employer.employees}</p>
                  <p className="text-green-600 font-semibold">Growth: {employer.growth}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Dublin Sectors - Mobile Optimized */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <motion.h2 
            {...fadeInUp}
            className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 px-2"
          >
            Hottest Sectors in Dublin 2025
          </motion.h2>
          
          <div className="grid gap-4 md:gap-8">
            {dublinSectors.map((sector, index) => (
              <motion.div
                key={sector.name}
                {...fadeInUp}
                transition={{ delay: index * 0.1 }}
                className="bg-card p-4 md:p-6 lg:p-8 rounded-lg shadow-sm border hover:shadow-md transition-all duration-300"
              >
                <div className="flex flex-col mb-4 md:mb-6">
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold mb-2">{sector.name}</h3>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-sm">
                      <span className="text-green-600 font-semibold">Growth: {sector.growth}</span>
                      <span className="text-blue-600 font-semibold">Avg Salary: {sector.avgSalary}</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-sm md:text-base">Top Roles:</h4>
                    <ul className="space-y-2">
                      {sector.topRoles.map((role) => (
                        <li key={role} className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-xs md:text-sm">{role}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3 text-sm md:text-base">Top Employers:</h4>
                    <div className="flex flex-wrap gap-1.5 md:gap-2">
                      {sector.companies.map((company) => (
                        <span 
                          key={company}
                          className="text-xs bg-cvgenius-purple/10 text-cvgenius-purple px-2 py-1 rounded-full"
                        >
                          {company}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Mobile Optimized */}
      <section className="py-12 md:py-16 bg-cvgenius-purple/5">
        <div className="container mx-auto px-4 text-center">
          <motion.h2 
            {...fadeInUp}
            className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 px-2"
          >
            Ready to Land Your Dream Dublin Job?
          </motion.h2>
          
          <motion.p 
            {...fadeInUp}
            transition={{ delay: 0.2 }}
            className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto px-4"
          >
            Create a professional CV that stands out to Dublin employers. 
            Our AI-powered builder knows exactly what Irish recruiters are looking for.
          </motion.p>
          
          <motion.div 
            {...fadeInUp}
            transition={{ delay: 0.4 }}
            className="flex flex-col gap-3 md:gap-4 justify-center px-4"
          >
            <Button 
              variant="cvgenius" 
              size="lg" 
              className="group w-full sm:w-auto min-h-[48px] text-base font-semibold touch-manipulation" 
              asChild
            >
              <Link href="/builder">
                <FileText className="mr-2 h-5 w-5" />
                Build Your Dublin CV Now
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto min-h-[48px] text-base touch-manipulation" 
              asChild
            >
              <Link href="/templates">
                <Star className="mr-2 h-4 w-4" />
                View Dublin CV Templates
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </MainLayout>
  )
} 