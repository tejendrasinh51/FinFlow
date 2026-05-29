/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['recharts', 'framer-motion', '@tanstack/react-table', 'lucide-react'],
  },
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },
  compress: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
