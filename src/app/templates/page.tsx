"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Star, Eye, Download, Sparkles, Briefcase, Palette, Crown, GraduationCap, RefreshCw, Users, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"
import { MainLayout } from "@/components/layout/main-layout"

interface Template {
  id: string
  name: string
  description: string
  industry: string[]
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  features: string[]
  preview: string
  recommended: boolean
  comingSoon?: boolean
}

const templates: Template[] = [
  {
    id: "harvard",
    name: "Harvard Classic",
    description: "Traditional professional template based on Harvard Business School format. Perfect for conservative industries and senior roles.",
    industry: ["Finance", "Law", "Consulting", "Government", "Healthcare"],
    difficulty: "Beginner",
    features: ["ATS Optimized", "2-Page Limit", "Professional Typography", "Clean Layout"],
    preview: "/templates/harvard-preview.png",
    recommended: true
  },
  {
    id: "modern-tech",
    name: "Modern Tech", 
    description: "Clean, contemporary design optimized for tech roles. Includes sections for projects and technical skills.",
    industry: ["Software Engineering", "Data Science", "DevOps", "Product Management"],
    difficulty: "Beginner",
    features: ["Skills Matrix", "Project Showcase", "GitHub Integration", "Tech Keywords"],
    preview: "/templates/modern-tech-preview.png",
    recommended: true
  },
  {
    id: "creative",
    name: "Creative Portfolio",
    description: "Eye-catching design for creative professionals. Balances creativity with professionalism.",
    industry: ["Design", "Marketing", "Advertising", "Media", "Startups"],
    difficulty: "Intermediate",
    features: ["Portfolio Links", "Creative Layout", "Color Accents", "Visual Hierarchy"],
    preview: "/templates/creative-preview.png",
    recommended: false
  },
  {
    id: "executive",
    name: "Executive Leadership",
    description: "Sophisticated template for C-level and senior management positions. Emphasizes achievements and leadership.",
    industry: ["Executive", "Management", "Director Level", "Board Positions"],
    difficulty: "Advanced",
    features: ["Achievement Focus", "Leadership Emphasis", "Board Ready", "Premium Typography"],
    preview: "/templates/executive-preview.png",
    recommended: false
  },
  {
    id: "graduate",
    name: "Graduate Fresh",
    description: "Perfect for new graduates and early career professionals. Highlights education and potential.",
    industry: ["Entry Level", "Graduate Programs", "Internships", "Career Change"],
    difficulty: "Beginner",
    features: ["Education Focus", "Skills Emphasis", "Fresh Graduate Optimized", "Potential Focused"],
    preview: "/templates/graduate-preview.png",
    recommended: true
  },
  {
    id: "career-change",
    name: "Career Transition",
    description: "Designed for professionals changing careers. Emphasizes transferable skills and adaptability.",
    industry: ["Career Change", "Industry Switch", "Consulting", "Diverse Background"],
    difficulty: "Intermediate", 
    features: ["Skills Transfer", "Adaptability Focus", "Experience Reframing", "Story Telling"],
    preview: "/templates/career-change-preview.png",
    recommended: false,
    comingSoon: true
  }
]

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

export default function TemplatesPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          {...fadeInUp}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-4">
            <Palette className="h-12 w-12 text-cvgenius-purple" />
          </div>
          <h1 className="text-4xl font-bold mb-6">Professional CV Templates</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose from our collection of professionally designed templates, 
            each optimized for different industries and career levels in the Irish job market.
          </p>
        </motion.div>

        {/* Template Stats */}
        <motion.div 
          {...fadeInUp}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12"
        >
          {[
            { label: "Templates", value: "6", icon: Palette },
            { label: "Industries Covered", value: "15+", icon: Briefcase },
            { label: "Success Rate", value: "94%", icon: Star },
            { label: "ATS Optimized", value: "100%", icon: CheckCircle }
          ].map((stat) => (
            <div key={stat.label} className="text-center p-4 bg-muted/30 rounded-lg">
              <stat.icon className="h-6 w-6 text-cvgenius-purple mx-auto mb-2" />
              <div className="font-bold text-lg">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Templates Grid */}
        <motion.div 
          variants={staggerChildren}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
        >
          {templates.map((template, index) => (
            <motion.div 
              key={template.id}
              variants={fadeInUp}
              className="bg-card rounded-lg border overflow-hidden hover:shadow-lg transition-all duration-300 group relative"
            >
              {/* Recommended Badge */}
              {template.recommended && (
                <div className="absolute top-4 left-4 z-10 bg-cvgenius-purple text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  Recommended
                </div>
              )}

              {/* Coming Soon Badge */}
              {template.comingSoon && (
                <div className="absolute top-4 right-4 z-10 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                  Coming Soon
                </div>
              )}

              {/* Template Preview */}
              <div className="h-48 bg-gradient-to-br from-muted/30 to-muted/60 relative overflow-hidden">
                {/* Placeholder preview content */}
                <div className="absolute inset-4 bg-white rounded shadow-sm border">
                  <div className="p-3 space-y-2">
                    <div className="h-2 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-1.5 bg-gray-200 rounded w-1/2"></div>
                    <div className="space-y-1 mt-3">
                      <div className="h-1 bg-gray-200 rounded w-full"></div>
                      <div className="h-1 bg-gray-200 rounded w-4/5"></div>
                      <div className="h-1 bg-gray-200 rounded w-3/5"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div className="h-1 bg-cvgenius-purple/30 rounded"></div>
                      <div className="h-1 bg-cvgenius-purple/30 rounded"></div>
                    </div>
                  </div>
                </div>
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    {!template.comingSoon && (
                      <Button size="sm" variant="cvgenius">
                        <Download className="h-4 w-4 mr-2" />
                        Use Template
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Template Info */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">{template.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    template.difficulty === "Beginner" ? "bg-green-100 text-green-800" :
                    template.difficulty === "Intermediate" ? "bg-yellow-100 text-yellow-800" :
                    "bg-red-100 text-red-800"
                  }`}>
                    {template.difficulty}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground mb-4">{template.description}</p>

                {/* Industries */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">BEST FOR:</p>
                  <div className="flex flex-wrap gap-1">
                    {template.industry.slice(0, 3).map((industry) => (
                      <span key={industry} className="text-xs bg-muted px-2 py-1 rounded">
                        {industry}
                      </span>
                    ))}
                    {template.industry.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{template.industry.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">FEATURES:</p>
                  <div className="space-y-1">
                    {template.features.slice(0, 2).map((feature) => (
                      <div key={feature} className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span className="text-xs text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <Button 
                  variant={template.recommended ? "cvgenius" : "outline"} 
                  size="sm" 
                  className="w-full"
                  disabled={template.comingSoon}
                  asChild={!template.comingSoon}
                >
                  {template.comingSoon ? (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Coming Soon
                    </>
                  ) : (
                    <Link href={`/builder?template=${template.id}`}>
                      <Download className="mr-2 h-4 w-4" />
                      Use This Template
                    </Link>
                  )}
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Template Selection Guide */}
        <motion.div 
          {...fadeInUp}
          transition={{ delay: 0.6 }}
          className="bg-muted/30 rounded-lg p-8 mb-12"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">Not Sure Which Template to Choose?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <GraduationCap className="h-8 w-8 text-cvgenius-purple mx-auto mb-3" />
              <h3 className="font-semibold mb-2">New Graduate</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Fresh out of college or university? Start with <strong>Graduate Fresh</strong> or <strong>Harvard Classic</strong>.
              </p>
              <Button variant="outline" size="sm">Learn More</Button>
            </div>

            <div className="text-center">
              <Briefcase className="h-8 w-8 text-cvgenius-purple mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Experienced Professional</h3>
              <p className="text-sm text-muted-foreground mb-3">
                5+ years experience? Try <strong>Modern Tech</strong> or <strong>Harvard Classic</strong> for broad appeal.
              </p>
              <Button variant="outline" size="sm">Learn More</Button>
            </div>

            <div className="text-center">
              <RefreshCw className="h-8 w-8 text-cvgenius-purple mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Career Change</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Switching industries? <strong>Career Transition</strong> helps highlight transferable skills.
              </p>
              <Button variant="outline" size="sm">Learn More</Button>
            </div>
          </div>
        </motion.div>

        {/* Custom Template CTA */}
        <motion.div 
          {...fadeInUp}
          transition={{ delay: 0.8 }}
          className="bg-cvgenius-purple/5 rounded-lg p-8 text-center"
        >
          <h2 className="text-2xl font-bold mb-4">Need a Custom Template?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join our community and suggest new template ideas! We regularly add templates based on 
            community feedback and industry trends in the Dublin job market.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="cvgenius" asChild>
              <Link href="/builder">
                Start with Recommended Template
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="https://chat.whatsapp.com/COtiAFIipkHA9PLo6G3pTT" target="_blank" rel="noopener noreferrer">
                <Users className="mr-2 h-4 w-4" />
                Suggest a Template
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Back Navigation */}
        <div className="mt-12 text-center">
          <Button variant="outline" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
    </MainLayout>
  )
}