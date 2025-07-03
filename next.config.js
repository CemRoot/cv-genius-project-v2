/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons', 'framer-motion'],
    isrMemoryCacheSize: 0,
    serverComponentsExternalPackages: ['bcryptjs'],
    missingSuspenseWithCSRBailout: false,
  },
  
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // Optimize CSS
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Disable source map generation in development to reduce 404 warnings
  productionBrowserSourceMaps: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    domains: [
      'ui-avatars.com',
      'images.unsplash.com',
      'via.placeholder.com',
      'picsum.photos',
      'assets.aceternity.com',
      'aceternity.com'
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
  },
  // Webpack configuration to handle Node.js modules
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'fs' and 'zlib' modules on the client side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        zlib: false,
        path: false,
        stream: false,
        crypto: false,
      };
    }
    return config;
  },
  // Headers for service worker and PropuSH
  async headers() {
    return [
      {
        source: '/sw-check-permissions-36fdf.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      // Cache static assets
      {
        source: '/fonts/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, immutable, max-age=31536000',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, immutable, max-age=31536000',
          },
        ],
      },
      {
        source: '/api/admin/:path*',
        headers: [
          {
            key: 'X-Admin-Route',
            value: 'true',
          },
        ],
      },
    ]
  },
  // Disable static exports to ensure dynamic rendering
  trailingSlash: false,
  // Ensure all API routes are handled dynamically
  async rewrites() {
    return []
  },
}

module.exports = nextConfig
