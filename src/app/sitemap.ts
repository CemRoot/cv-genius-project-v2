import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://cvgenius.ie'
  
  // Priority Dublin jobs keywords
  const dublinJobsPages = [
    'dublin-cv-builder',
    'dublin-resume-templates', 
    'dublin-jobs-cv-guide',
    'dublin-tech-jobs-cv',
    'dublin-finance-jobs-resume',
    'dublin-healthcare-jobs-cv',
    'dublin-engineering-jobs-cv',
    'dublin-it-jobs-resume',
    'dublin-accountant-cv-template',
    'dublin-software-engineer-cv'
  ]

  const basePages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0
    },
    {
      url: `${baseUrl}/builder`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9
    },
    {
      url: `${baseUrl}/templates`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8
    },
    {
      url: `${baseUrl}/ats-check`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8
    },
    {
      url: `${baseUrl}/cover-letter`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7
    },
    {
      url: `${baseUrl}/examples`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7
    },
    {
      url: `${baseUrl}/guides`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6
    },
    {
      url: `${baseUrl}/ai-tools`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6
    }
  ]

  // Generate Dublin jobs landing pages
  const dublinJobsEntries = dublinJobsPages.map(page => ({
    url: `${baseUrl}/${page}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8
  }))

  return [...basePages, ...dublinJobsEntries]
} 