import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow images from local uploads
  images: {
    localPatterns: [
      {
        pathname: "/uploads/**",
        search: "",
      },
    ],
  },
  // Ensure API routes have proper body size limit for file uploads
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
  // Experimental: server actions
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
