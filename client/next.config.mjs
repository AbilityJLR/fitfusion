/** @type {import('next').NextConfig} */
let nextConfig;

// Import the appropriate config based on environment
if (process.env.NODE_ENV === 'production') {
  nextConfig = require('./next.config.production.mjs').default;
} else {
  nextConfig = require('./next.config.development.mjs').default;
}

export default nextConfig;
