import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cvgenius-one.vercel.app'

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/ads.txt'],
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/static/',
          '/private/',
          '/tmp/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/static/',
          '/private/',
          '/tmp/',
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/static/',
          '/private/',
          '/tmp/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
} 