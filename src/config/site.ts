/**
 * Hằng số thương hiệu & thông tin doanh nghiệp LV GROUP.
 * Không hardcode ở component — luôn import từ đây.
 */

export const siteConfig = {
  productName: "LV Marketing Hub",
  productShort: "LV Hub",
  company: "LV GROUP",
  tagline: {
    vi: "Nền tảng Marketing thông minh dành cho doanh nghiệp địa phương tại Đức.",
    de: "Intelligente Marketing-Plattform für lokale Unternehmen in Deutschland.",
  },
  logo: {
    /** Logo gốc — PNG nền trong suốt, giữ nguyên tỷ lệ 1:1 */
    mark: "/brand/lv-group-logo.png",
    /** Huy hiệu tròn — dùng cho favicon / app icon */
    badge: "/brand/lv-group-badge.png",
    aspect: 1,
  },
  contact: {
    phone: "0176 1159 8888",
    phoneHref: "tel:+4917611598888",
    email: "info@lv-groups.com",
    website: "lv-groups.com",
    websiteHref: "https://lv-groups.com",
    city: "Berlin",
    coverage: {
      vi: "Có mặt trên toàn nước Đức",
      de: "Deutschlandweit im Einsatz",
    },
  },
  timezone: "Europe/Berlin",
} as const;

/** Ngày cập nhật văn bản pháp lý. Sửa tay mỗi lần chỉnh nội dung điều khoản. */
export const LEGAL_UPDATED_AT = "01.08.2026";

export const LV_BUSINESS_LINES = [
  "vat-lieu-trang-tri-noi-that",
  "thi-cong-noi-that",
  "marketing-solutions",
] as const;
