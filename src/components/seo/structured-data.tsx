'use client'

interface StructuredDataProps {
  type: 'WebApplication' | 'LocalBusiness' | 'JobPosting' | 'Article' | 'FAQPage'
  data: any
}

export function StructuredData({ type, data }: StructuredDataProps) {
  let schema = {}

  switch (type) {
    case 'WebApplication':
      schema = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": data.name || "CV Genius",
        "url": data.url || "https://cvgenius.ie",
        "description": data.description || "Create professional CVs with AI for Dublin jobs market",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web browser",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "EUR"
        },
        "featureList": [
          "AI-powered CV builder",
          "ATS-friendly templates", 
          "Dublin job market optimization",
          "Privacy-first design",
          "Free forever"
        ],
        "creator": {
          "@type": "Organization",
          "name": "CV Genius",
          "url": "https://cvgenius.ie"
        }
      }
      break

    case 'LocalBusiness':
      schema = {
        "@context": "https://schema.org",
        "@type": "ProfessionalService", 
        "name": "CV Genius",
        "url": "https://cvgenius.ie",
        "description": "Professional CV building service for Dublin job market",
        "areaServed": {
          "@type": "City",
          "name": "Dublin",
          "containedInPlace": {
            "@type": "Country", 
            "name": "Ireland"
          }
        },
        "serviceType": "Career Services",
        "priceRange": "Free",
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "CV Services",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "CV Builder",
                "description": "AI-powered CV creation for Dublin jobs"
              }
            },
            {
              "@type": "Offer", 
              "itemOffered": {
                "@type": "Service",
                "name": "ATS Checker",
                "description": "Check CV compatibility with applicant tracking systems"
              }
            }
          ]
        }
      }
      break

    case 'Article':
      schema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": data.title,
        "description": data.description,
        "url": data.url,
        "datePublished": data.datePublished || new Date().toISOString(),
        "dateModified": data.dateModified || new Date().toISOString(),
        "author": {
          "@type": "Organization",
          "name": "CV Genius",
          "url": "https://cvgenius.ie"
        },
        "publisher": {
          "@type": "Organization", 
          "name": "CV Genius",
          "url": "https://cvgenius.ie"
        },
        "mainEntityOfPage": data.url,
        "articleSection": "Career Advice",
        "keywords": data.keywords || ["Dublin jobs", "CV builder", "resume templates"],
        "about": {
          "@type": "Thing",
          "name": "Dublin Job Market"
        }
      }
      break

    case 'JobPosting':
      schema = {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        "title": data.title,
        "description": data.description,
        "hiringOrganization": {
          "@type": "Organization",
          "name": data.company
        },
        "jobLocation": {
          "@type": "Place",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Dublin",
            "addressCountry": "IE"
          }
        },
        "datePosted": data.datePosted,
        "employmentType": data.employmentType || "FULL_TIME",
        "baseSalary": {
          "@type": "MonetaryAmount",
          "currency": "EUR",
          "value": {
            "@type": "QuantitativeValue",
            "value": data.salary,
            "unitText": "YEAR"
          }
        }
      }
      break

    case 'FAQPage':
      schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": data.faqs?.map((faq: any) => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        })) || []
      }
      break
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Common structured data components for easy use
export function WebAppStructuredData() {
  return (
    <StructuredData 
      type="WebApplication"
      data={{
        name: "CV Genius - Dublin Jobs CV Builder",
        url: "https://cvgenius.ie",
        description: "Create winning CVs for Dublin jobs market 2025. AI-powered CV builder with Irish-focused templates."
      }}
    />
  )
}

export function LocalBusinessStructuredData() {
  return (
    <StructuredData 
      type="LocalBusiness"
      data={{}}
    />
  )
}

export function DublinJobsArticleStructuredData() {
  return (
    <StructuredData 
      type="Article"
      data={{
        title: "Dublin Jobs Market 2025 Guide",
        description: "Complete guide to Dublin job market including top employers, salary trends, and career tips",
        url: "https://cvgenius.ie/dublin-jobs",
        keywords: ["Dublin jobs", "Dublin employment", "Irish job market", "Dublin careers"]
      }}
    />
  )
}

export function DublinTechJobsArticleStructuredData() {
  return (
    <StructuredData 
      type="Article"
      data={{
        title: "Dublin Tech Jobs 2025 Complete Guide",
        description: "Land your dream tech job in Dublin 2025! Complete guide to Dublin's tech scene and top companies",
        url: "https://cvgenius.ie/dublin-tech-jobs",
        keywords: ["Dublin tech jobs", "Dublin software engineer", "Dublin IT careers", "Dublin tech companies"]
      }}
    />
  )
} 