import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

/**
 * Web App Manifest — cho phép "Thêm vào màn hình chính" rồi mở như một ứng dụng.
 *
 * `display: "standalone"` là mấu chốt: mở từ biểu tượng trên màn hình chính sẽ
 * KHÔNG có thanh địa chỉ trình duyệt, nên trang trông đúng như app. Thiếu khai
 * báo này thì dù giao diện có giống app đến đâu, người dùng vẫn thấy khung Safari
 * hay Chrome bao quanh.
 *
 * Next 16 tự phục vụ file này tại /manifest.webmanifest.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.productName} — ${siteConfig.company}`,
    short_name: siteConfig.productShort,
    description: siteConfig.tagline.vi,
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    // Trùng `--paper` của theme sáng để lúc khởi động không loé lên một màu khác.
    background_color: "#fffbf6",
    theme_color: "#fffbf6",
    lang: "vi",
    categories: ["business", "productivity"],
    icons: [
      {
        src: siteConfig.logo.badge,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: siteConfig.logo.badge,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
