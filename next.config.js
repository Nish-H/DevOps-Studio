/** @type {import('next').NextConfig} */
const nextConfig = {
  // STORAGE FIX: Remove static export to preserve localStorage functionality
  // Static export causes hydration issues that break persistent storage
  // ...(process.env.NODE_ENV === 'production' && {
  //   output: 'export',
  //   trailingSlash: true,
  // }),

  // Enable server-side rendering for proper localStorage hydration
  reactStrictMode: true,

  images: {
    unoptimized: true
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