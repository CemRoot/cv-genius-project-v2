'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TrendingUp, PieChart, DollarSign, Briefcase, Users, MapPin, ArrowRight, FileText, Target, CheckCircle, Building } from "lucide-react"
import { motion } from "framer-motion"
import { IrishFlag, ShamrockIcon } from "@/components/ui/irish-flag"
import { MainLayout } from "@/components/layout/main-layout"
import GentleMonetization from "@/components/ads/gentle-monetization"

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

const dublinFinanceCompanies = [
  {
    name: "Bank of Ireland",
    sector: "Retail Banking",
    employees: "10,000+",
    location: "Dublin 2 (IFSC)",
    avgSalary: "€55,000",
    topRoles: ["Financial Analyst", "Credit Officer", "Relationship Manager", "Risk Analyst"]
  },
  {
    name: "AIB (Allied Irish Banks)",
    sector: "Commercial Banking", 
    employees: "8,500+",
    location: "Dublin 2 (City Centre)",
    avgSalary: "€52,000",
    topRoles: ["Investment Advisor", "Corporate Banking", "Treasury Analyst", "Compliance Officer"]
  },
  {
    name: "Central Bank of Ireland",
    sector: "Central Banking",
    employees: "2,000+",
    location: "Dublin 2 (North Wall Quay)",
    avgSalary: "€75,000",
    topRoles: ["Economist", "Policy Analyst", "Banking Supervisor", "Data Scientist"]
  },
  {
    name: "NTMA (National Treasury)",
    sector: "Government Finance",
    employees: "300+",
    location: "Dublin 2 (Treasury Building)",
    avgSalary: "€70,000",
    topRoles: ["Treasury Manager", "Debt Analyst", "Investment Officer", "Financial Controller"]
  },
  {
    name: "Stripe",
    sector: "Fintech/Payments",
    employees: "1,000+",
    location: "Dublin 2 (Grand Canal)",
    avgSalary: "€85,000",
    topRoles: ["Payment Engineer", "Risk Operations", "Financial Operations", "Product Manager"]
  },
  {
    name: "Fidelity Investments",
    sector: "Asset Management",
    employees: "2,500+",
    location: "Dublin 1 (IFSC)",
    avgSalary: "€68,000",
    topRoles: ["Portfolio Manager", "Investment Analyst", "Fund Administrator", "ESG Analyst"]
  }
]

const financeSkills = [
  {
    category: "Core Finance",
    skills: ["Financial Modeling", "Valuation", "Risk Management", "Portfolio Analysis", "FP&A"],
    demand: "Very High"
  },
  {
    category: "Technology",
    skills: ["Python", "R", "SQL", "Bloomberg Terminal", "Excel VBA", "Tableau"],
    demand: "Extremely High"
  },
  {
    category: "Regulatory & Compliance",
    skills: ["CRD IV", "MIFID II", "GDPR", "Basel III", "Solvency II"],
    demand: "High"
  },
  {
    category: "Certifications",
    skills: ["CFA", "FRM", "CAIA", "ACCA", "CIMA"],
    demand: "High"
  }
]

const salaryRanges = [
  {
    level: "Graduate/Entry Level",
    range: "€35,000 - €45,000",
    roles: ["Graduate Analyst", "Junior Accountant", "Credit Assistant"]
  },
  {
    level: "Mid-Level (3-5 years)",
    range: "€50,000 - €70,000", 
    roles: ["Financial Analyst", "Senior Accountant", "Portfolio Manager"]
  },
  {
    level: "Senior Level (5+ years)",
    range: "€70,000 - €95,000",
    roles: ["Finance Director", "Risk Manager", "Investment Director"]
  },
  {
    level: "Executive Level",
    range: "€100,000+",
    roles: ["CFO", "Head of Risk", "Managing Director"]
  }
]

export default function DublinFinanceJobsPage() {
  return (
    <MainLayout>
      <GentleMonetization />
      
      {/* Hero Section */}
      <section className="py-12 md:py-20 lg:py-32 bg-gradient-to-br from-background via-green-50/20 to-blue-50/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px] md:bg-[size:50px_50px]" />
        <div className="absolute top-0 right-0 -mt-20 -mr-20 md:-mt-40 md:-mr-40 w-40 h-40 md:w-80 md:h-80 bg-green-500/20 rounded-full blur-2xl md:blur-3xl opacity-30" />
        
        <div className="container mx-auto px-4 text-center relative">
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <DollarSign className="h-12 w-12 md:h-16 md:w-16 text-green-600 animate-pulse" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-2 border-green-600/20 rounded-full"
              />
            </div>
          </motion.div>
          
          <motion.h1 
            {...fadeInUp}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight px-2"
          >
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Dublin Finance Jobs</span>
            <br />
            2025 Opportunities <span className="text-green-600 flex items-center gap-2 justify-center">
              <IrishFlag size="sm" className="md:hidden" />
              <span className="hidden md:inline"><IrishFlag size="md" /></span>
            </span>
          </motion.h1>
          
          <motion.p 
            {...fadeInUp}
            transition={{ delay: 0.2 }}
            className="text-base md:text-lg lg:text-xl text-muted-foreground mb-6 md:mb-8 max-w-3xl mx-auto px-4"
          >
            Dublin's IFSC is Europe's leading financial hub. Discover banking, fintech, and investment opportunities. 
            Create a professional CV that stands out to Dublin's top financial employers.
            <ShamrockIcon className="inline-block ml-2 h-5 w-5" />
          </motion.p>
          
          <motion.div 
            {...fadeInUp}
            transition={{ delay: 0.4 }}
            className="flex flex-col gap-3 md:gap-4 justify-center mb-12 px-4"
          >
            <Button variant="cvgenius" size="lg" className="group w-full sm:w-auto min-h-[48px] text-base font-semibold touch-manipulation" asChild>
              <Link href="/builder">
                <FileText className="mr-2 h-5 w-5" />
                Build Finance CV
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto min-h-[48px] text-base font-semibold touch-manipulation" asChild>
              <Link href="/ats-check">
                <Target className="mr-2 h-4 w-4" />
                Finance ATS Check
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Dublin Finance Market Stats */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.h2 
            {...fadeInUp}
            className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 px-2"
          >
            Dublin Financial Services 2025
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { icon: TrendingUp, title: "Market Growth", value: "12%", desc: "Annual increase" },
              { icon: Building, title: "IFSC Companies", value: "500+", desc: "Financial firms" },
              { icon: Users, title: "Finance Jobs", value: "8,500+", desc: "Open positions" },
              { icon: DollarSign, title: "Avg Salary", value: "€65,000", desc: "Mid-level roles" }
            ].map((stat, index) => (
              <motion.div
                key={stat.title}
                {...fadeInUp}
                transition={{ delay: index * 0.1 }}
                className="bg-card p-4 md:p-6 rounded-lg shadow-sm border text-center hover:shadow-md transition-all duration-300 touch-manipulation"
              >
                <stat.icon className="h-8 w-8 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">{stat.value}</h3>
                <p className="font-semibold mb-1">{stat.title}</p>
                <p className="text-sm text-muted-foreground">{stat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Finance Companies */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <motion.h2 
            {...fadeInUp}
            className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 px-2"
          >
            Top Dublin Finance Employers
          </motion.h2>
          
          <div className="grid gap-6">
            {dublinFinanceCompanies.map((company, index) => (
              <motion.div
                key={company.name}
                {...fadeInUp}
                transition={{ delay: index * 0.1 }}
                className="bg-card p-4 md:p-6 rounded-lg shadow-sm border hover:shadow-md transition-all duration-300 touch-manipulation"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2">{company.name}</h3>
                    <p className="text-muted-foreground mb-2">{company.sector}</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded">{company.employees} employees</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{company.location}</span>
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">Avg: {company.avgSalary}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Popular Roles:</h4>
                  <div className="flex flex-wrap gap-2">
                    {company.topRoles.map((role) => (
                      <span 
                        key={role}
                        className="text-xs bg-muted text-foreground px-2 py-1 rounded-full"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Finance Skills */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.h2 
            {...fadeInUp}
            className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 px-2"
          >
            Essential Finance Skills in Dublin
          </motion.h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {financeSkills.map((category, index) => (
              <motion.div
                key={category.category}
                {...fadeInUp}
                transition={{ delay: index * 0.1 }}
                className="bg-card p-4 md:p-6 rounded-lg shadow-sm border touch-manipulation"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">{category.category}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    category.demand === 'Extremely High' ? 'bg-red-100 text-red-800' :
                    category.demand === 'Very High' ? 'bg-orange-100 text-orange-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {category.demand}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill) => (
                    <span 
                      key={skill}
                      className="text-sm bg-green-50 text-green-700 px-3 py-1 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Salary Guide */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <motion.h2 
            {...fadeInUp}
            className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 px-2"
          >
            Dublin Finance Salary Guide 2025
          </motion.h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {salaryRanges.map((range, index) => (
              <motion.div
                key={range.level}
                {...fadeInUp}
                transition={{ delay: index * 0.1 }}
                className="bg-card p-4 md:p-6 rounded-lg shadow-sm border hover:shadow-md transition-all duration-300 touch-manipulation"
              >
                <h3 className="text-xl font-bold mb-3">{range.level}</h3>
                <p className="text-2xl font-bold text-green-600 mb-4">{range.range}</p>
                
                <div>
                  <h4 className="font-semibold mb-2">Typical Roles:</h4>
                  <ul className="space-y-1">
                    {range.roles.map((role) => (
                      <li key={role} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        {role}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-green-600/10 to-blue-600/10">
        <div className="container mx-auto px-4 text-center">
          <motion.h2 
            {...fadeInUp}
            className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 px-2"
          >
            Ready to Launch Your Finance Career in Dublin?
          </motion.h2>
          
          <motion.p 
            {...fadeInUp}
            transition={{ delay: 0.2 }}
            className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto px-4"
          >
            Create a professional finance CV that impresses Dublin's top financial institutions. 
            Our templates are optimized for the Irish financial services industry.
          </motion.p>
          
          <motion.div 
            {...fadeInUp}
            transition={{ delay: 0.4 }}
            className="flex flex-col gap-3 md:gap-4 justify-center px-4"
          >
            <Button variant="cvgenius" size="lg" className="group w-full sm:w-auto min-h-[48px] text-base font-semibold touch-manipulation" asChild>
              <Link href="/builder">
                <PieChart className="mr-2 h-5 w-5" />
                Build Finance CV Now
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto min-h-[48px] text-base font-semibold touch-manipulation" asChild>
              <Link href="/dublin-jobs">
                <Briefcase className="mr-2 h-4 w-4" />
                All Dublin Jobs Guide
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </MainLayout>
  )
} 