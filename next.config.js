/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },
  // Enable experimental features if needed
  experimental: {
    // optimizePackageImports: ['@/components'],
  },
}

module.exports = nextConfig

