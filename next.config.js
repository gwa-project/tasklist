/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ['mongoose'],
  images: {
    domains: ['localhost'],
  },
}

module.exports = nextConfig