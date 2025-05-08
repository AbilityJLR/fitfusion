/** @type {import('next').NextConfig} */
const nextConfig = {
  // Watch for changes more frequently in dev mode
  experimental: {
    // Enable server-component mode
    serverComponentsExternalPackages: ['react-dom/server'],
  },
  // Proxy API requests to Django backend in development
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