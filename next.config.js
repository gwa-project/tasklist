/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'standalone', // Disabled for Cloud Build compatibility
  serverExternalPackages: ['mongoose'],
  images: {
    domains: ['localhost'],
  },
}

module.exports = nextConfig