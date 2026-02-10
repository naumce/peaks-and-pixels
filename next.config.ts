import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile mapbox packages
  transpilePackages: ['react-map-gl', 'mapbox-gl'],
};

export default nextConfig;
