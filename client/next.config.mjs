/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    // This will allow Next.js to attempt self-healing if it crashes
    forceSwcTransforms: true,
    // Enable server-component mode
    serverComponentsExternalPackages: ['react-dom/server'], 
  },
  // Configure async timeouts
  experimental: {
    serverActionsTimeout: 120,
    serverComponentsTimeout: 120,
  },
  // Turn off source maps in production
  productionBrowserSourceMaps: false,
  // Proxy API requests to Django backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
      {
        source: '/admin/:path*',
        destination: 'http://localhost:8000/admin/:path*',
      },
    ];
  },
};

export default nextConfig;
