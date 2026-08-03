import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /**
     * Cho phép tối ưu SVG vì toàn bộ file trong `public/templates` do chính
     * `scripts/generate-templates.mjs` sinh ra — không nhận SVG từ nguồn ngoài.
     */
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
