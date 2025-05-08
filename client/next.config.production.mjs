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
  serverTimeout: 120000, // 2 minutes
  // Turn off source maps in production
  productionBrowserSourceMaps: false,
  // Proxy API requests to Django backend in production
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