"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronRight, Star, Users, MapPin, Briefcase, ExternalLink, BookOpen, CheckCircle, AlertCircle, Info } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { MainLayout } from "@/components/layout/main-layout"

interface GuideItem {
  id: string
  question: string
  content: React.ReactNode
  category: string
}

const guideData: GuideItem[] = [
  {
    id: "1",
    question: "What are ATS (Applicant Tracking Systems) and How Do They Work?",
    category: "ATS Optimization",
    content: (
      <div className="space-y-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">What is ATS?</h4>
              <p className="text-blue-800 leading-relaxed">
                ATS (Applicant Tracking Systems) are software applications that help employers manage hiring by automatically filtering and ranking job applications. Major Dublin companies like Google, Meta, LinkedIn, Amazon, and Accenture all use these systems.
              </p>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-xl font-semibold mb-4 text-gray-800">How ATS Works</h4>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-cvgenius-purple text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">1</div>
              <div>
                <p className="font-medium text-gray-800">Keyword Scanning</p>
                <p className="text-gray-600 text-sm mt-1">Scans CVs for specific keywords from job descriptions</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-cvgenius-purple text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">2</div>
              <div>
                <p className="font-medium text-gray-800">Automatic Filtering</p>
                <p className="text-gray-600 text-sm mt-1">Eliminates CVs that don't match required qualifications</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-cvgenius-purple text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">3</div>
              <div>
                <p className="font-medium text-gray-800">Ranking System</p>
                <p className="text-gray-600 text-sm mt-1">Ranks applications based on keyword density and relevance</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-xl font-semibold mb-4 text-gray-800">ATS-Friendly CV Tips</h4>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { label: "Format", tip: "Clean layouts, no graphics" },
              { label: "Fonts", tip: "Arial, Calibri, Times New Roman" },
              { label: "Keywords", tip: "Use exact terms from job descriptions" },
              { label: "File Type", tip: "Save as .docx or PDF" },
              { label: "Headers", tip: "Use standard section titles" },
              { label: "Size", tip: "11-12pt for body text" }
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-800 text-sm">{item.label}</p>
                  <p className="text-gray-600 text-sm">{item.tip}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-cvgenius-purple/10 border border-cvgenius-purple/20 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-cvgenius-purple" />
            <p className="text-sm font-medium text-cvgenius-purple">
              Key Stat: 98% of Fortune 500 companies and 75% of Dublin companies use ATS systems
            </p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "2",
    question: "How Should I Format My CV for Dublin/Ireland Job Market?",
    category: "CV Formatting",
    content: (
      <div className="space-y-8">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-green-900 mb-2">Irish CV Standards</h4>
              <p className="text-green-800 leading-relaxed">
                Irish CV standards differ significantly from other countries. Here's what Dublin employers expect for professional applications.
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-xl font-semibold mb-4 text-red-700 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Don't Include
            </h4>
            <div className="space-y-3">
              {[
                "Photos or headshots",
                "Age or date of birth", 
                "Marital status",
                "Nationality details"
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                  <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                  <p className="text-red-800 text-sm">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xl font-semibold mb-4 text-green-700 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Must Include
            </h4>
            <div className="space-y-3">
              {[
                "Irish phone (+353)",
                "Dublin address",
                "LinkedIn profile", 
                "Professional email"
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <p className="text-green-800 text-sm">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-xl font-semibold mb-4 text-gray-800">Length Requirements</h4>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <ul className="space-y-2">
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-yellow-800"><strong>Maximum 2 pages</strong> for experienced professionals</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-yellow-800">1 page for graduates</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-yellow-800">Quality over quantity</span>
              </li>
            </ul>
          </div>
        </div>

        <div>
          <h4 className="text-xl font-semibold mb-4 text-gray-800">Perfect CV Structure</h4>
          <div className="space-y-3">
            {[
              { step: 1, title: "Personal Information", desc: "Name, location, contact details" },
              { step: 2, title: "Professional Summary", desc: "3-4 lines of career highlights" },
              { step: 3, title: "Work Experience", desc: "Reverse chronological with achievements" },
              { step: 4, title: "Education", desc: "Degrees, institutions, dates" },
              { step: 5, title: "Skills", desc: "Technical and soft skills" },
              { step: 6, title: "References", desc: '"Available upon request"' }
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
                <div className="bg-cvgenius-purple text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{item.title}</p>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  },
  {
    id: "3",
    question: "How Can I Use LinkedIn Effectively for Dublin Job Applications?",
    category: "LinkedIn Strategy",
    content: (
      <div className="space-y-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">LinkedIn's Power in Dublin</h4>
              <p className="text-blue-800 leading-relaxed">
                LinkedIn is the most powerful platform for Dublin job seekers, with 85% of local recruiters actively using it for talent acquisition and networking.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-xl font-semibold mb-6 text-gray-800">Profile Optimization</h4>
          <div className="space-y-4">
            {[
              {
                title: "Headline",
                content: 'Include your target role and location (e.g., "Software Engineer | Dublin | Full-Stack Developer specializing in React & Node.js")'
              },
              {
                title: "Location",
                content: 'Set to "Dublin, Ireland" to appear in local searches'
              },
              {
                title: "Open to Work Badge",
                content: 'Enable "Share with recruiters only" for discreet job searching'
              },
              {
                title: "Summary",
                content: "Mention your passion for Dublin's tech/business ecosystem"
              }
            ].map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-800 rounded-lg px-3 py-1 text-sm font-medium">
                    {item.title}
                  </div>
                </div>
                <p className="text-gray-600 mt-2 text-sm">{item.content}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xl font-semibold mb-6 text-gray-800">Top Dublin Companies</h4>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium text-gray-800 mb-2">Tech Companies</p>
                <p className="text-gray-600 text-sm">Google Dublin, Meta Dublin</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium text-gray-800 mb-2">Finance</p>
                <p className="text-gray-600 text-sm">Bank of Ireland, AIB, Stripe</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium text-gray-800 mb-2">Pharma</p>
                <p className="text-gray-600 text-sm">Pfizer Ireland, J&J Dublin</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium text-gray-800 mb-2">Consulting</p>
                <p className="text-gray-600 text-sm">Accenture, Deloitte</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-cvgenius-purple/10 border border-cvgenius-purple/20 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-cvgenius-purple" />
            <p className="text-sm font-medium text-cvgenius-purple">
              Pro Tip: 75% of Dublin tech jobs are filled through LinkedIn networking before being posted publicly
            </p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "4",
    question: "What Should I Expect in Dublin Job Interviews?",
    category: "Interview Preparation",
    content: (
      <div className="space-y-8">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-purple-900 mb-2">Dublin Interview Process</h4>
              <p className="text-purple-800 leading-relaxed">
                Dublin interviews typically follow a structured 2-3 stage process, with cultural nuances specific to Irish business practices and European workplace standards.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-xl font-semibold mb-6 text-gray-800">Interview Stages</h4>
          <div className="space-y-4">
            {[
              {
                stage: "Stage 1",
                title: "Phone/Video Screening",
                duration: "20-30 mins",
                content: "HR or recruiter discussing basics, salary expectations, visa status"
              },
              {
                stage: "Stage 2", 
                title: "Technical/Competency Interview",
                duration: "45-60 mins",
                content: "Department manager assessing skills and cultural fit"
              },
              {
                stage: "Stage 3",
                title: "Final Panel Interview",
                duration: "30-45 mins",
                content: "Senior management, sometimes including company culture assessment"
              }
            ].map((item) => (
              <div key={item.stage} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-cvgenius-purple text-white rounded-lg px-3 py-1 text-sm font-medium">
                    {item.stage}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h5 className="font-medium text-gray-800">{item.title}</h5>
                      <span className="text-sm text-gray-500">({item.duration})</span>
                    </div>
                    <p className="text-gray-600 text-sm">{item.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xl font-semibold mb-6 text-gray-800">Dress Code by Sector</h4>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { sector: "Financial Services/Law", dress: "Formal business attire (suit required)" },
              { sector: "Tech Companies", dress: "Smart-casual (button-down, chinos)" },
              { sector: "Startups", dress: "Business casual to smart-casual" },
              { sector: "Pharmaceuticals", dress: "Business professional" }
            ].map((item) => (
              <div key={item.sector} className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium text-gray-800 mb-1">{item.sector}</p>
                <p className="text-gray-600 text-sm">{item.dress}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <p className="text-sm font-medium text-green-800">
              Irish Tip: Use STAR method (Situation, Task, Action, Result) - Dublin employers love structured answers
            </p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "5",
    question: "What Are the Most Common CV Mistakes for Dublin Job Applications?",
    category: "Common Mistakes",
    content: (
      <div className="space-y-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-red-900 mb-2">Avoid These Critical Mistakes</h4>
              <p className="text-red-800 leading-relaxed">
                Understanding these common mistakes can significantly improve your chances in Dublin's competitive job market and help you avoid instant rejection.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-xl font-semibold mb-6 text-gray-800">Format and Length Errors</h4>
          <div className="space-y-4">
            {[
              { mistake: "Too Long", description: "CVs over 2 pages are automatically rejected by most Dublin employers" },
              { mistake: "Creative Layouts", description: "Graphics, unusual fonts, or complex designs confuse ATS systems" },
              { mistake: "Including Photos", description: "Unlike Germany or France, Irish CVs never include photographs" },
              { mistake: "Irrelevant Personal Info", description: "Age, marital status, or nationality are not required and can lead to bias" }
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-red-800">{item.mistake}</p>
                  <p className="text-red-700 text-sm mt-1">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xl font-semibold mb-6 text-gray-800">Dublin-Specific Errors</h4>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { error: "Work Authorization", issue: "Not mentioning EU status" },
              { error: "Local Knowledge", issue: "Ignoring Irish market" },
              { error: "Currency", issue: "Using GBP/USD not EUR (€)" },
              { error: "Contact Info", issue: "Wrong country code" }
            ].map((item) => (
              <div key={item.error} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="font-medium text-yellow-800">{item.error}</p>
                <p className="text-yellow-700 text-sm mt-1">{item.issue}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xl font-semibold mb-6 text-gray-800">Better Example</h4>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-red-700 text-sm line-through">Instead of: "Good team player"</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-700 text-sm font-medium">Write: "Led cross-functional team of 6 to deliver €2M project 3 weeks ahead of schedule"</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-cvgenius-purple/10 border border-cvgenius-purple/20 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-cvgenius-purple" />
            <p className="text-sm font-medium text-cvgenius-purple">
              Success Tip: Use Irish English spelling (specialise, colour, centre) and terminology throughout your CV
            </p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "6", 
    question: "Which Job Platforms Are Most Effective for Finding Work in Dublin?",
    category: "Job Platforms",
    content: (
      <div className="space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-xl font-semibold mb-4 text-gray-800">Irish Platforms</h4>
            <div className="space-y-3">
              {[
                { platform: "IrishJobs.ie", desc: "Ireland's largest job site" },
                { platform: "Jobs.ie", desc: "Great for retail, hospitality" },
                { platform: "Recruiters.ie", desc: "Finance & tech roles" },
                { platform: "TheJournal.ie Jobs", desc: "Dublin startups" }
              ].map((item) => (
                <div key={item.platform} className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="font-medium text-green-800">{item.platform}</p>
                  <p className="text-green-700 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xl font-semibold mb-4 text-gray-800">International Platforms</h4>
            <div className="space-y-3">
              {[
                { platform: "LinkedIn Jobs", desc: "Professional roles" },
                { platform: "Indeed.ie", desc: "Comprehensive coverage" },
                { platform: "Glassdoor.ie", desc: "Company research" },
                { platform: "Monster.ie", desc: "Multinational companies" }
              ].map((item) => (
                <div key={item.platform} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="font-medium text-blue-800">{item.platform}</p>
                  <p className="text-blue-700 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-xl font-semibold mb-6 text-gray-800">Platform Usage Strategy</h4>
          <div className="space-y-4">
            {[
              { step: 1, action: "Start with IrishJobs.ie and LinkedIn", desc: "for maximum coverage" },
              { step: 2, action: "Set up job alerts", desc: "with specific Dublin location filters" },
              { step: 3, action: "Apply directly to target companies", desc: "for senior roles" },
              { step: 4, action: "Use recruitment agencies", desc: "for specialized positions" },
              { step: 5, action: "Network actively", desc: "through professional events and online communities" }
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
                <div className="bg-cvgenius-purple text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{item.action}</p>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-cvgenius-purple/10 border border-cvgenius-purple/20 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-cvgenius-purple" />
            <p className="text-sm font-medium text-cvgenius-purple">
              Success Tip: Apply within 48 hours of job posting for 3x higher response rate in Dublin's fast-moving market
            </p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "7",
    question: "How Should I Follow Up After a Dublin Job Interview?",
    category: "Interview Follow-up",
    content: (
      <div className="space-y-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Professional Follow-Up is Crucial</h4>
              <p className="text-blue-800 leading-relaxed">
                Professional follow-up is crucial in Dublin's business culture. Here's the definitive guide to post-interview etiquette that Dublin employers expect.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-xl font-semibold mb-6 text-gray-800">Follow-Up Timeline</h4>
          <div className="space-y-4">
            {[
              { time: "Within 24 Hours", action: "Thank you email", color: "green" },
              { time: "Week 2", action: "Brief check-in if needed", color: "yellow" },
              { time: "Week 3", action: "Final polite follow-up", color: "orange" },
              { time: "After Week 3", action: "Move on gracefully", color: "gray" }
            ].map((item) => (
              <div key={item.time} className={`flex items-start gap-4 p-4 bg-${item.color}-50 border border-${item.color}-200 rounded-lg`}>
                <div className={`bg-${item.color}-500 text-white rounded-lg px-3 py-1 text-sm font-medium min-w-fit`}>
                  {item.time}
                </div>
                <p className={`text-${item.color}-800 font-medium`}>{item.action}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xl font-semibold mb-6 text-gray-800">Sample Thank You Email</h4>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-medium text-gray-800">Subject: Thank you - Senior Marketing Manager Interview - Sarah Johnson</p>
              </div>
              <div className="space-y-3 text-gray-700">
                <p>Dear Ms. Murphy,</p>
                <p>Thank you for taking the time to meet with me yesterday to discuss the Senior Marketing Manager position. I enjoyed our conversation about Dublin's evolving fintech landscape and your team's innovative approach to digital customer acquisition.</p>
                <p>Our discussion reinforced my enthusiasm for contributing to [Company]'s continued growth in the Irish market. I'm particularly excited about the opportunity to lead the expansion into the Dublin startup ecosystem that we discussed.</p>
                <p>Please let me know if you need any additional information. I look forward to hearing about the next steps in your process.</p>
                <p>Best regards,<br />Sarah Johnson</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-xl font-semibold mb-6 text-gray-800">Communication Channels</h4>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">Preferred Methods</span>
              </div>
              <div className="space-y-2">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-800 text-sm">Email (primary)</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-800 text-sm">LinkedIn message</p>
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-800">Avoid These</span>
              </div>
              <div className="space-y-2">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-800 text-sm">Text messages</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-800 text-sm">Social media</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-800 text-sm">Unannounced visits</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <p className="text-sm font-medium text-green-800">
              Dublin Success Tip: 68% of Dublin employers say thoughtful follow-up emails positively influence their hiring decisions
            </p>
          </div>
        </div>
      </div>
    )
  }
]

export default function CareerGuidePage() {
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleItem = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="flex justify-center mb-6">
              <div className="bg-cvgenius-purple/10 p-4 rounded-full">
                <BookOpen className="h-12 w-12 text-cvgenius-purple" />
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-6 text-gray-900">Dublin Career Mastery Guide</h1>
            <div className="space-y-4">
              <p className="text-xl text-cvgenius-purple font-medium">
                🚀 Your pathway to Irish job market success
              </p>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                🎯 Master Dublin's competitive job market with insider strategies! From ATS optimization to Irish business culture, this guide reveals the secrets that land interviews at Google Dublin, AIB, Stripe, and Ireland's top employers.
              </p>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
          >
            {[
              { icon: Users, label: "Success Stories", value: "3,200+" },
              { icon: Star, label: "Interview Rate", value: "85%" },
              { icon: MapPin, label: "Dublin Focus", value: "100%" },
              { icon: Briefcase, label: "ATS Optimized", value: "98%" }
            ].map((stat) => (
              <div key={stat.label} className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                <stat.icon className="h-8 w-8 text-cvgenius-purple mx-auto mb-3" />
                <div className="font-bold text-2xl text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Guide Items */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {guideData.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => toggleItem(item.id)}
                  className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="bg-cvgenius-purple/10 text-cvgenius-purple px-3 py-1 rounded-full text-sm font-medium">
                        {item.category}
                      </div>
                    </div>
                    <h3 className="font-semibold text-xl text-gray-900">{item.question}</h3>
                  </div>
                  <motion.div
                    animate={{ rotate: expandedItems.includes(item.id) ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="h-6 w-6 text-gray-400" />
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
                      <div className="px-8 pb-8 border-t border-gray-100">
                        <div className="pt-6">
                          {item.content}
                        </div>
                        <div className="mt-8 pt-6 border-t border-gray-100">
                          <div className="flex items-center gap-3 text-cvgenius-purple">
                            <div className="w-2 h-2 bg-cvgenius-purple rounded-full"></div>
                            <span className="font-medium text-sm">Expert insights for Dublin job market success</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>

          {/* Useful Resources */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-20 bg-white rounded-xl shadow-sm border border-gray-200 p-8"
          >
            <h2 className="text-3xl font-bold mb-8 text-gray-900">Useful Resources</h2>
            
            <div className="grid lg:grid-cols-2 gap-10">
              <div>
                <h3 className="text-xl font-semibold mb-6 text-gray-800">Essential Links</h3>
                <div className="space-y-4">
                  {[
                    { name: "IrishJobs.ie", url: "https://www.irishjobs.ie", description: "Ireland's largest job portal with 20,000+ active listings" },
                    { name: "LinkedIn Ireland", url: "https://www.linkedin.com/jobs/dublin-jobs/", description: "Professional network - 85% of Dublin employers use it" },
                    { name: "Jobs.ie", url: "https://www.jobs.ie", description: "Popular for retail, hospitality & entry-level positions" },
                    { name: "Indeed Ireland", url: "https://ie.indeed.com", description: "Global platform with excellent Dublin job coverage" },
                    { name: "Glassdoor Ireland", url: "https://www.glassdoor.ie", description: "Company reviews, salaries & interview insights" },
                    { name: "Citizens Information - Work", url: "https://www.citizensinformation.ie/en/employment/", description: "Official employment rights & visa requirements" },
                    { name: "Revenue.ie PAYE", url: "https://www.revenue.ie/en/jobs-and-pensions/index.aspx", description: "Tax information for employees in Ireland" },
                    { name: "Enterprise Ireland", url: "https://www.enterprise-ireland.com/en/start-a-business-in-ireland/", description: "Business support & startup ecosystem info" },
                    { name: "IDA Ireland", url: "https://www.idaireland.com", description: "Foreign direct investment & multinational companies" },
                    { name: "MyGovID", url: "https://www.mygovid.ie", description: "Essential for accessing Irish government services" },
                    { name: "Rent.ie", url: "https://www.rent.ie", description: "Dublin accommodation for job seekers" },
                    { name: "Dublin.ie", url: "https://www.dublin.ie", description: "Official Dublin city information & services" }
                  ].map((link) => (
                    <div key={link.name} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <ExternalLink className="h-5 w-5 text-cvgenius-purple mt-1 flex-shrink-0" />
                      <div>
                        <Link 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-medium text-cvgenius-purple hover:underline"
                        >
                          {link.name}
                        </Link>
                        <p className="text-sm text-gray-600 mt-1">{link.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-6 text-gray-800">Key Dublin Business Districts</h3>
                <div className="space-y-6">
                  <div className="bg-cvgenius-purple/5 border border-cvgenius-purple/20 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <MapPin className="h-5 w-5 text-cvgenius-purple" />
                      <span className="font-medium text-cvgenius-purple">Why This Matters</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Understanding Dublin's business districts helps you target the right companies, choose optimal commute routes, and demonstrate local market knowledge in interviews.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      { district: "IFSC (International Financial Services Centre)", companies: "Major banks and financial services, including Central Bank of Ireland, PwC, Credit Suisse" },
                      { district: "Docklands (Silicon Docks)", companies: "Google, Facebook, LinkedIn, Twitter, and other tech giants' European headquarters" },
                      { district: "Sandyford Business District", companies: "Microsoft, Oracle, Salesforce, and pharmaceutical companies" },
                      { district: "Citywest Business Park", companies: "SAP, startups and emerging tech companies with lower property costs" }
                    ].map((area) => (
                      <div key={area.district} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">{area.district}</h4>
                        <p className="text-sm text-gray-600">{area.companies}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
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
    </div>
    </MainLayout>
  )
}