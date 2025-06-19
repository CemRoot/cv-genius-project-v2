'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Code, Database, Smartphone, Cloud, Brain, Shield, ArrowRight, FileText, Target, CheckCircle, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"
import { IrishFlag, ShamrockIcon } from "@/components/ui/irish-flag"
import { MainLayout } from "@/components/layout/main-layout"
import { GentleMonetization } from "@/components/ads/gentle-monetization"
import { DublinTechJobsArticleStructuredData } from "@/components/seo/structured-data"

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

const dublinTechCompanies = [
  { 
    name: "Google", 
    employees: "5000+", 
    focus: "Search, Cloud, AI",
    avgSalary: "€95,000",
    growth: "+15%",
    roles: ["Software Engineer", "Site Reliability Engineer", "Product Manager"]
  },
  { 
    name: "Microsoft", 
    employees: "2500+", 
    focus: "Cloud, Enterprise",
    avgSalary: "€88,000",
    growth: "+12%",
    roles: ["Cloud Engineer", "Software Developer", "Data Scientist"]
  },
  { 
    name: "Meta (Facebook)", 
    employees: "4000+", 
    focus: "Social, VR, AI",
    avgSalary: "€98,000",
    growth: "+8%",
    roles: ["Frontend Engineer", "Backend Engineer", "ML Engineer"]
  },
  { 
    name: "Amazon", 
    employees: "3000+", 
    focus: "AWS, E-commerce",
    avgSalary: "€92,000",
    growth: "+10%",
    roles: ["DevOps Engineer", "Solutions Architect", "Software Engineer"]
  },
  { 
    name: "Stripe", 
    employees: "1000+", 
    focus: "Fintech, Payments",
    avgSalary: "€105,000",
    growth: "+20%",
    roles: ["Full Stack Engineer", "Payment Systems Engineer", "Security Engineer"]
  },
  { 
    name: "Shopify", 
    employees: "800+", 
    focus: "E-commerce Platform",
    avgSalary: "€85,000",
    growth: "+18%",
    roles: ["Ruby Developer", "React Developer", "Platform Engineer"]
  }
]

const techSkills = [
  {
    category: "Programming Languages",
    skills: ["JavaScript/TypeScript", "Python", "Java", "Go", "Rust", "C#"],
    demand: "Very High"
  },
  {
    category: "Frameworks & Libraries", 
    skills: ["React", "Angular", "Vue.js", "Node.js", "Spring Boot", ".NET"],
    demand: "High"
  },
  {
    category: "Cloud & DevOps",
    skills: ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "Jenkins"],
    demand: "Very High"
  },
  {
    category: "Databases",
    skills: ["PostgreSQL", "MongoDB", "Redis", "Elasticsearch", "MySQL"],
    demand: "High"
  },
  {
    category: "AI & Machine Learning",
    skills: ["TensorFlow", "PyTorch", "Scikit-learn", "Pandas", "OpenAI"],
    demand: "Extremely High"
  }
]

const dublinTechHubs = [
  {
    area: "Dublin 2 (City Centre)",
    companies: ["Google", "Facebook", "LinkedIn"],
    transport: "Excellent (DART, Luas, Bus)",
    avgRent: "€2,200/month",
    description: "Heart of Dublin's tech scene"
  },
  {
    area: "Dublin 4 (Ballsbridge)",
    companies: ["Microsoft", "Amazon", "Accenture"],
    transport: "Very Good (DART, Bus)",
    avgRent: "€2,000/month", 
    description: "Corporate headquarters hub"
  },
  {
    area: "Dublin 18 (Sandyford)",
    companies: ["Salesforce", "VMware", "Oracle"],
    transport: "Good (Luas Green Line)",
    avgRent: "€1,800/month",
    description: "Tech park with modern offices"
  }
]

export default function DublinTechJobsPage() {
  return (
    <MainLayout>
      <DublinTechJobsArticleStructuredData />
      <GentleMonetization />
      
      {/* Hero Section - Mobile Optimized */}
      <section className="py-12 md:py-20 lg:py-32 bg-gradient-to-br from-background via-blue-50/20 to-purple-50/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px] md:bg-[size:50px_50px]" />
        <div className="absolute top-0 right-0 -mt-20 -mr-20 md:-mt-40 md:-mr-40 w-40 h-40 md:w-80 md:h-80 bg-blue-500/20 rounded-full blur-2xl md:blur-3xl opacity-30" />
        
        <div className="container mx-auto px-4 text-center relative">
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-4 md:mb-6"
          >
            <div className="relative">
              <Code className="h-12 w-12 md:h-16 md:w-16 text-blue-600 animate-pulse" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-2 border-blue-600/20 rounded-full"
              />
            </div>
          </motion.div>
          
          <motion.h1 
            {...fadeInUp}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight px-2"
          >
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Dublin Tech Jobs</span>
            <br />
            2025 Complete Guide <span className="text-green-600 inline-flex items-center gap-1 md:gap-2 justify-center flex-wrap">
              <IrishFlag size="sm" className="md:hidden" /><IrishFlag size="md" className="hidden md:inline" />
            </span>
          </motion.h1>
          
          <motion.p 
            {...fadeInUp}
            transition={{ delay: 0.2 }}
            className="text-base md:text-lg lg:text-xl text-muted-foreground mb-6 md:mb-8 max-w-3xl mx-auto px-4"
          >
            Dublin is Europe's fastest-growing tech hub. Discover top tech companies, salary insights, 
            required skills, and create a winning CV for Dublin's competitive tech market.
            <ShamrockIcon className="inline-block ml-2 h-4 w-4 md:h-5 md:w-5" />
          </motion.p>
          
          <motion.div 
            {...fadeInUp}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Button variant="cvgenius" size="lg" className="group" asChild>
              <Link href="/builder">
                <FileText className="mr-2 h-5 w-5" />
                Build Tech CV
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/ats-check">
                <Target className="mr-2 h-4 w-4" />
                ATS Check for Tech
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Dublin Tech Stats */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.h2 
            {...fadeInUp}
            className="text-3xl font-bold text-center mb-12"
          >
            Dublin Tech Market 2025
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { icon: TrendingUp, title: "Growth Rate", value: "18%", desc: "Fastest in Europe" },
              { icon: Code, title: "Tech Jobs", value: "12,500+", desc: "Open positions" },
              { icon: Brain, title: "AI/ML Roles", value: "2,800+", desc: "Highest demand" },
              { icon: Database, title: "Avg Salary", value: "€92,000", desc: "Senior developers" }
            ].map((stat, index) => (
              <motion.div
                key={stat.title}
                {...fadeInUp}
                transition={{ delay: index * 0.1 }}
                className="bg-card p-6 rounded-lg shadow-sm border text-center hover:shadow-md transition-all duration-300"
              >
                <stat.icon className="h-8 w-8 text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">{stat.value}</h3>
                <p className="font-semibold mb-1">{stat.title}</p>
                <p className="text-sm text-muted-foreground">{stat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Tech Companies */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.h2 
            {...fadeInUp}
            className="text-3xl font-bold text-center mb-12"
          >
            Top Dublin Tech Employers 2025
          </motion.h2>
          
          <div className="grid gap-6">
            {dublinTechCompanies.map((company, index) => (
              <motion.div
                key={company.name}
                {...fadeInUp}
                transition={{ delay: index * 0.1 }}
                className="bg-card p-6 rounded-lg shadow-sm border hover:shadow-md transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2">{company.name}</h3>
                    <p className="text-muted-foreground mb-2">{company.focus}</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{company.employees} employees</span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Growth: {company.growth}</span>
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">Avg: {company.avgSalary}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Popular Roles:</h4>
                  <div className="flex flex-wrap gap-2">
                    {company.roles.map((role) => (
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

      {/* Required Skills */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.h2 
            {...fadeInUp}
            className="text-3xl font-bold text-center mb-12"
          >
            Most In-Demand Tech Skills in Dublin
          </motion.h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {techSkills.map((category, index) => (
              <motion.div
                key={category.category}
                {...fadeInUp}
                transition={{ delay: index * 0.1 }}
                className="bg-card p-6 rounded-lg shadow-sm border"
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
                      className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full"
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

      {/* Dublin Tech Hubs */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.h2 
            {...fadeInUp}
            className="text-3xl font-bold text-center mb-12"
          >
            Dublin's Tech Hubs & Locations
          </motion.h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {dublinTechHubs.map((hub, index) => (
              <motion.div
                key={hub.area}
                {...fadeInUp}
                transition={{ delay: index * 0.1 }}
                className="bg-card p-6 rounded-lg shadow-sm border hover:shadow-md transition-all duration-300"
              >
                <h3 className="text-xl font-bold mb-3">{hub.area}</h3>
                <p className="text-sm text-muted-foreground mb-4">{hub.description}</p>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Top Companies:</h4>
                    <div className="flex flex-wrap gap-1">
                      {hub.companies.map((company) => (
                        <span 
                          key={company}
                          className="text-xs bg-muted px-2 py-1 rounded"
                        >
                          {company}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Transport:</h4>
                    <p className="text-xs text-muted-foreground">{hub.transport}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Avg Rent:</h4>
                    <p className="text-xs font-bold text-green-600">{hub.avgRent}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600/10 to-purple-600/10">
        <div className="container mx-auto px-4 text-center">
          <motion.h2 
            {...fadeInUp}
            className="text-3xl font-bold mb-6"
          >
            Ready to Join Dublin's Tech Revolution?
          </motion.h2>
          
          <motion.p 
            {...fadeInUp}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            Create a tech-focused CV that gets noticed by Dublin's top tech recruiters. 
            Our AI knows exactly what tech companies in Dublin are looking for.
          </motion.p>
          
          <motion.div 
            {...fadeInUp}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button variant="cvgenius" size="lg" className="group" asChild>
              <Link href="/builder">
                <Code className="mr-2 h-5 w-5" />
                Build Tech CV Now
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/dublin-jobs">
                <FileText className="mr-2 h-4 w-4" />
                All Dublin Jobs Guide
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </MainLayout>
  )
} 