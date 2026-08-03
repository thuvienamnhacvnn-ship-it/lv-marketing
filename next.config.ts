import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /*
     * KHÔNG bật `dangerouslyAllowSVG`. Trước đây cờ này được bật để phục vụ
     * `public/templates` do `scripts/generate-templates.mjs` sinh ra — cả thư mục
     * lẫn script đều không còn tồn tại, và template hiện được dựng bằng React
     * (`src/components/marketing/template-card.tsx`) chứ không phải file SVG.
     * Không ảnh SVG nào đi qua trình tối ưu ảnh, nên bật cờ này chỉ mở thêm bề
     * mặt tấn công mà không đổi lại được gì.
     */
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
