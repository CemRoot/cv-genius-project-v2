/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🚀 DEV SERVER OPTIMIZATIONS - Prevent hanging on startup
  onDemandEntries: {
    // Keep pages in buffer longer to reduce recompilation
    maxInactiveAge: 15 * 60 * 1000, // 15 minutes
    pagesBufferLength: 6, // Keep more pages in memory
  },

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
    // Turbo optimizations for dev
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
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
  },
  // Webpack configuration to handle Node.js modules
  webpack: (config, { isServer }) => {
    // 🔧 DEV MODE OPTIMIZATIONS
    if (process.env.NODE_ENV === 'development') {
      // Disable source maps in dev to speed up compilation
      config.devtool = false;
      
      // Reduce memory usage
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      };
    }

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
    ]
  },
}

module.exports = nextConfig
