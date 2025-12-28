import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
};

module.exports = {
  productionBrowserSourceMaps: false,
}
export default nextConfig;