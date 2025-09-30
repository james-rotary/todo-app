/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: [],
  },
  env: {
    API_BASE_URL_INTERNAL: process.env.API_BASE_URL_INTERNAL || 'http://localhost:8080',
  },
}

module.exports = nextConfig