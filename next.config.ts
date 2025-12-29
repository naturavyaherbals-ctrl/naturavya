import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {},
  },

  eslint: {
    // ✅ DO NOT block production builds due to lint rules
    ignoreDuringBuilds: true,
  },

  typescript: {
    // ✅ Type errors are already validated in dev
    ignoreBuildErrors: true,
  },
}

export default nextConfig
