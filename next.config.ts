/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  experimental: {
    serverActions: true,
  },

  // IMPORTANT: do NOT use standalone with OpenNext
  output: undefined,
};

module.exports = nextConfig;
