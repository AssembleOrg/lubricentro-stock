/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Netlify (required by @netlify/plugin-nextjs)
  output: 'standalone',
  // Ensure proper handling of dependencies
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'pg'],
  },
};

module.exports = nextConfig;
