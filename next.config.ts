import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: "@svgr/webpack",
          options: {
            icon: true,
          },
        },
      ],
    });
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "simple-blog-storage.s3.ap-northeast-2.amazonaws.com",
        pathname: "**",
      },
    ],
  },
  logging: {
    fetches: { fullUrl: true },
  },
};

export default nextConfig;
