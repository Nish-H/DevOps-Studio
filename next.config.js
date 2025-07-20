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
  },
  // Exclude backup files and folders from build
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Exclude backup directories and files from being processed
    config.module.rules.push({
      test: /\.(js|jsx|ts|tsx)$/,
      exclude: [
        /node_modules/,
        /backups/,
        /backup/,
        /\.backup/,
        /archive/,
        /\.archive/,
        /temp/,
        /\.temp/
      ]
    })
    return config
  }
}

module.exports = nextConfig