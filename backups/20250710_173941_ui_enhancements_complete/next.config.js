/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use static export for Electron
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Disable all external optimizations
  optimizeFonts: false,
  swcMinify: false,
  // Skip external network requests during build
  experimental: {
    forceSwcTransforms: false
  }
}

module.exports = nextConfig