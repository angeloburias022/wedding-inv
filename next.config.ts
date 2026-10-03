import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The default (bottom-left) sits on top of the music button in development.
  devIndicators: { position: "top-right" },
};

export default nextConfig;
