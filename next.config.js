/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Netlify (required by @netlify/plugin-nextjs)
  output: 'standalone',
  // Ensure proper handling of dependencies (moved from experimental in Next.js 16)
  serverExternalPackages: ['@prisma/client', 'pg'],
};

module.exports = nextConfig;
