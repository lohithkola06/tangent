/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable ESLint during build to prevent deployment failures
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Updated from experimental.serverComponentsExternalPackages for Next.js 15.3.2+
  serverExternalPackages: ['nodemailer', '@sendgrid/mail'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't bundle server-side email libraries on the client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        dns: false,
        tls: false,
        child_process: false,
      }
    }
    return config
  },
}

module.exports = nextConfig 