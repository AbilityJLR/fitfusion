/** @type {import('next').NextConfig} */
const nextConfig = {
  // Common settings
  experimental: {
    // Enable server-component mode
    serverComponentsExternalPackages: ['react-dom/server'],
  },
  
  // Proxy API requests to Django backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://server:8000/api/:path*',
      },
      {
        source: '/admin/:path*',
        destination: 'http://server:8000/admin/:path*',
      },
    ];
  },
  
  // Production-specific settings applied conditionally
  ...(process.env.NODE_ENV === 'production' ? {
    output: 'standalone',
    experimental: {
      // This will allow Next.js to attempt self-healing if it crashes
      forceSwcTransforms: true,
      // Enable server-component mode
      serverComponentsExternalPackages: ['react-dom/server'],
    },
    // Turn off source maps in production
    productionBrowserSourceMaps: false,
  } : {
    // Development-specific settings
    reactStrictMode: true,
  })
};

export default nextConfig;
