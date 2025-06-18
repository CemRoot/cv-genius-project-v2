"use client"

import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, MessageCircle, Heart, Shield, Award, ExternalLink, Zap, Globe, UserCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
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

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            {...fadeInUp}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cvgenius-primary/10 rounded-full text-cvgenius-primary text-sm font-medium mb-4">
              <Users className="h-4 w-4" />
              1400+ Active Members
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Join the CVGenius Community
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Connect with professionals, get CV feedback, and accelerate your career growth. 
              100% free, supportive, and focused on helping each other succeed.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-12">
          {/* Community Platforms */}
          <motion.div
            variants={staggerChildren}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {/* WhatsApp Community */}
            <motion.div variants={fadeInUp}>
              <Card className="h-full border-green-200 bg-green-50/50">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-green-100 rounded-full">
                      <MessageCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-green-800">WhatsApp Community</CardTitle>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        1400+ Members
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-green-700">
                    Join our active WhatsApp community for real-time career support, CV reviews, 
                    and networking opportunities with professionals across Ireland and beyond.
                  </p>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-green-800">What you'll get:</h4>
                    <ul className="space-y-2 text-sm text-green-700">
                      <li className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4" />
                        Daily CV feedback from experienced professionals
                      </li>
                      <li className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Job opportunities shared by members
                      </li>
                      <li className="flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        Interview tips and success stories
                      </li>
                      <li className="flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        Supportive community during job search
                      </li>
                    </ul>
                  </div>

                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="lg"
                    asChild
                  >
                    <Link href="https://chat.whatsapp.com/cvgenius" target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Join WhatsApp Community
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Slack Workspace */}
            <motion.div variants={fadeInUp}>
              <Card className="h-full border-purple-200 bg-purple-50/50">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-purple-100 rounded-full">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-purple-800">Slack Workspace</CardTitle>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                        Professional Network
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-purple-700">
                    Join our organised Slack workspace with dedicated channels for different 
                    industries, experience levels, and career discussions.
                  </p>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-purple-800">Channels include:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-purple-700">#general</div>
                      <div className="text-purple-700">#tech-careers</div>
                      <div className="text-purple-700">#finance-jobs</div>
                      <div className="text-purple-700">#healthcare</div>
                      <div className="text-purple-700">#graduates</div>
                      <div className="text-purple-700">#career-change</div>
                      <div className="text-purple-700">#remote-work</div>
                      <div className="text-purple-700">#success-stories</div>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    size="lg"
                    asChild
                  >
                    <Link href="https://join.slack.com/t/cvgenius/shared_invite" target="_blank" rel="noopener noreferrer">
                      <Users className="h-4 w-4 mr-2" />
                      Join Slack Workspace
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Community Guidelines */}
          <motion.div {...fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Community Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-3">
                      <Heart className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold mb-2">100% Free Forever</h3>
                    <p className="text-sm text-muted-foreground">
                      No hidden fees, no premium tiers. Our community believes in helping each other succeed.
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-3">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Be Respectful</h3>
                    <p className="text-sm text-muted-foreground">
                      Treat everyone with respect. We're all here to support each other's career journey.
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="p-3 bg-red-100 rounded-full w-fit mx-auto mb-3">
                      <Shield className="h-6 w-6 text-red-600" />
                    </div>
                    <h3 className="font-semibold mb-2">No Spam Policy</h3>
                    <p className="text-sm text-muted-foreground">
                      No promotional content, MLM schemes, or irrelevant messages. Focus on career growth.
                    </p>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Zap className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-amber-800 mb-1">Quick Start Guide</h4>
                      <ol className="text-sm text-amber-700 space-y-1">
                        <li>1. Join your preferred platform (WhatsApp or Slack)</li>
                        <li>2. Introduce yourself with your background and goals</li>
                        <li>3. Share your CV for feedback (optional)</li>
                        <li>4. Help others when you can - pay it forward!</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>


          {/* Call to Action */}
          <motion.div {...fadeInUp}>
            <Card className="bg-gradient-to-r from-cvgenius-primary to-cvgenius-purple text-white">
              <CardContent className="py-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Ready to Accelerate Your Career?</h2>
                <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
                  Join thousands of professionals who are supporting each other's career growth. 
                  Your next opportunity might be just one conversation away.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg" 
                    variant="secondary"
                    asChild
                  >
                    <Link href="https://chat.whatsapp.com/cvgenius" target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Join WhatsApp Now
                    </Link>
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    asChild
                  >
                    <Link href="https://join.slack.com/t/cvgenius/shared_invite" target="_blank" rel="noopener noreferrer">
                      <Users className="h-4 w-4 mr-2" />
                      Join Slack Workspace
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}