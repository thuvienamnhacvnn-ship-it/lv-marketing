import type { Locale } from "@/i18n/config";
import type { PhotoKey } from "@/data/media";

type Localized = Record<Locale, string>;

export type TemplateCategory = "social" | "print" | "web" | "loyalty" | "signage" | "email";

/** Kiểu bố cục — quyết định cách `TemplateCard` dựng lớp chữ lên ảnh. */
export type TemplateLayout =
  | "post"
  | "story"
  | "beforeAfter"
  | "menu"
  | "priceList"
  | "voucher"
  | "loyaltyCard"
  | "reviewCard"
  | "landing"
  | "signage"
  | "newsletter"
  | "cover"
  | "businessCard"
  | "googlePost";

export type TemplateShape = "square" | "story" | "portrait" | "landscape" | "wide";

/** Tỷ lệ khung theo dạng, dùng cho cả lưới và xem lớn. */
export const SHAPE_RATIO: Record<TemplateShape, number> = {
  square: 1,
  story: 9 / 16,
  portrait: 1240 / 1754,
  landscape: 3 / 2,
  wide: 1640 / 624,
};

export type MarketingTemplate = {
  slug: string;
  photo: PhotoKey;
  /** Ảnh thứ hai — chỉ dùng cho bố cục before/after. */
  photoAlt?: PhotoKey;
  layout: TemplateLayout;
  shape: TemplateShape;
  category: TemplateCategory;
  /** Sắc chủ đạo của template. */
  tone: "brand" | "violet" | "magenta" | "amber" | "sky" | "ink";
  name: Localized;
  format: Localized;
  /** Nội dung mẫu in trên template. */
  copy: {
    eyebrow: Localized;
    headline: Localized;
    sub: Localized;
    badge: Localized;
  };
};

export const TEMPLATE_CATEGORIES: { key: TemplateCategory | "all"; label: Localized }[] = [
  { key: "all", label: { vi: "Tất cả", de: "Alle" } },
  { key: "social", label: { vi: "Social", de: "Social" } },
  { key: "print", label: { vi: "Ấn phẩm in", de: "Drucksachen" } },
  { key: "web", label: { vi: "Website", de: "Website" } },
  { key: "loyalty", label: { vi: "Khách thân thiết", de: "Treueprogramm" } },
  { key: "signage", label: { vi: "Biển hiệu", de: "Beschilderung" } },
  { key: "email", label: { vi: "Email", de: "E-Mail" } },
];

export const MARKETING_TEMPLATES: MarketingTemplate[] = [
  {
    slug: "post-restaurant",
    photo: "fineDiningPlate",
    layout: "post",
    shape: "square",
    category: "social",
    tone: "brand",
    name: { vi: "Bài đăng món mới", de: "Post: Neues Gericht" },
    format: { vi: "Instagram · Facebook · 1080×1080", de: "Instagram · Facebook · 1080×1080" },
    copy: {
      eyebrow: { vi: "NEU AUF DER KARTE", de: "NEU AUF DER KARTE" },
      headline: { vi: "Bún bò Huế", de: "Bún bò Huế" },
      sub: {
        vi: "Rinderbrühe, Zitronengras, frische Kräuter",
        de: "Rinderbrühe, Zitronengras, frische Kräuter",
      },
      badge: { vi: "ab 12,90 €", de: "ab 12,90 €" },
    },
  },
  {
    slug: "post-nail",
    photo: "nailsPink",
    layout: "post",
    shape: "square",
    category: "social",
    tone: "magenta",
    name: { vi: "Bài đăng mẫu nail", de: "Post: Nageldesign" },
    format: { vi: "Instagram · 1080×1080", de: "Instagram · 1080×1080" },
    copy: {
      eyebrow: { vi: "DESIGN DER WOCHE", de: "DESIGN DER WOCHE" },
      headline: { vi: "Soft Pink Chrome", de: "Soft Pink Chrome" },
      sub: { vi: "Gel-Modellage · ca. 75 Minuten", de: "Gel-Modellage · ca. 75 Minuten" },
      badge: { vi: "Termin buchen", de: "Termin buchen" },
    },
  },
  {
    slug: "post-spa",
    photo: "spaFacial",
    layout: "post",
    shape: "square",
    category: "social",
    tone: "violet",
    name: { vi: "Bài đăng liệu trình spa", de: "Post: Behandlung" },
    format: { vi: "Instagram · 1080×1080", de: "Instagram · 1080×1080" },
    copy: {
      eyebrow: { vi: "TREATMENT", de: "TREATMENT" },
      headline: { vi: "Hydra-Glow Facial", de: "Hydra-Glow Facial" },
      sub: { vi: "Tiefenreinigung · Serum · Lichttherapie", de: "Tiefenreinigung · Serum · Lichttherapie" },
      badge: { vi: "60 Min · 79 €", de: "60 Min · 79 €" },
    },
  },
  {
    slug: "story-promo",
    photo: "vietnameseDish",
    layout: "story",
    shape: "story",
    category: "social",
    tone: "brand",
    name: { vi: "Story khuyến mại", de: "Story: Aktion" },
    format: { vi: "Story · Reels · 1080×1920", de: "Story · Reels · 1080×1920" },
    copy: {
      eyebrow: { vi: "MITTAGSANGEBOT", de: "MITTAGSANGEBOT" },
      headline: { vi: "−20 %", de: "−20 %" },
      sub: { vi: "Montag bis Freitag · 11:30 – 15:00", de: "Montag bis Freitag · 11:30 – 15:00" },
      badge: { vi: "Jetzt reservieren", de: "Jetzt reservieren" },
    },
  },
  {
    slug: "story-beforeafter",
    photo: "manicureWork",
    photoAlt: "manicureHands",
    layout: "beforeAfter",
    shape: "story",
    category: "social",
    tone: "magenta",
    name: { vi: "Story before / after", de: "Story: Vorher / Nachher" },
    format: { vi: "Story · 1080×1920", de: "Story · 1080×1920" },
    copy: {
      eyebrow: { vi: "VORHER · NACHHER", de: "VORHER · NACHHER" },
      headline: { vi: "Auffüllen nach 5 Wochen", de: "Auffüllen nach 5 Wochen" },
      sub: { vi: "Gel-Modellage · Naturnagel geschont", de: "Gel-Modellage · Naturnagel geschont" },
      badge: { vi: "Termin sichern", de: "Termin sichern" },
    },
  },
  {
    slug: "google-post",
    photo: "cafeTable",
    layout: "googlePost",
    shape: "landscape",
    category: "social",
    tone: "sky",
    name: { vi: "Bài Google Business", de: "Google-Business-Post" },
    format: { vi: "Google Business · 1200×900", de: "Google Business · 1200×900" },
    copy: {
      eyebrow: { vi: "GOOGLE BUSINESS · UPDATE", de: "GOOGLE BUSINESS · UPDATE" },
      headline: { vi: "Neue Öffnungszeiten", de: "Neue Öffnungszeiten" },
      sub: { vi: "Ab 1. September öffnen wir bereits um 11:00 Uhr.", de: "Ab 1. September öffnen wir bereits um 11:00 Uhr." },
      badge: { vi: "Route planen", de: "Route planen" },
    },
  },
  {
    slug: "facebook-cover",
    photo: "restaurantBright",
    layout: "cover",
    shape: "wide",
    category: "social",
    tone: "ink",
    name: { vi: "Ảnh bìa Facebook", de: "Facebook-Titelbild" },
    format: { vi: "Facebook · 1640×624", de: "Facebook · 1640×624" },
    copy: {
      eyebrow: { vi: "SEIT 2016 · BERLIN MITTE", de: "SEIT 2016 · BERLIN MITTE" },
      headline: { vi: "Frisch gekocht. Jeden Tag.", de: "Frisch gekocht. Jeden Tag." },
      sub: { vi: "Vietnamesische Küche · Mo – So 11:30 – 22:00", de: "Vietnamesische Küche · Mo – So 11:30 – 22:00" },
      badge: { vi: "lv-groups.com", de: "lv-groups.com" },
    },
  },
  {
    slug: "menu-a4",
    photo: "foodFlatlay",
    layout: "menu",
    shape: "portrait",
    category: "print",
    tone: "brand",
    name: { vi: "Menu nhà hàng A4", de: "Speisekarte A4" },
    format: { vi: "In · A4 dọc", de: "Druck · A4 hoch" },
    copy: {
      eyebrow: { vi: "VIETNAMESISCHE KÜCHE · BERLIN", de: "VIETNAMESISCHE KÜCHE · BERLIN" },
      headline: { vi: "Speisekarte", de: "Speisekarte" },
      sub: { vi: "Allergene auf Anfrage · Preise inkl. MwSt.", de: "Allergene auf Anfrage · Preise inkl. MwSt." },
      badge: { vi: "0176 1159 8888", de: "0176 1159 8888" },
    },
  },
  {
    slug: "price-list",
    photo: "nailsDark",
    layout: "priceList",
    shape: "portrait",
    category: "print",
    tone: "magenta",
    name: { vi: "Bảng giá dịch vụ", de: "Preisliste" },
    format: { vi: "In · A4 dọc", de: "Druck · A4 hoch" },
    copy: {
      eyebrow: { vi: "NAGELSTUDIO · BERLIN", de: "NAGELSTUDIO · BERLIN" },
      headline: { vi: "Preisliste", de: "Preisliste" },
      sub: { vi: "Terminvereinbarung empfohlen", de: "Terminvereinbarung empfohlen" },
      badge: { vi: "0176 1159 8888", de: "0176 1159 8888" },
    },
  },
  {
    slug: "business-card",
    photo: "interiorModern",
    layout: "businessCard",
    shape: "landscape",
    category: "print",
    tone: "ink",
    name: { vi: "Danh thiếp", de: "Visitenkarte" },
    format: { vi: "In · 85×55 mm", de: "Druck · 85×55 mm" },
    copy: {
      eyebrow: { vi: "PROJEKTLEITUNG · INNENAUSBAU", de: "PROJEKTLEITUNG · INNENAUSBAU" },
      headline: { vi: "Nguyễn Văn Long", de: "Nguyễn Văn Long" },
      sub: { vi: "lv-groups.com · Berlin", de: "lv-groups.com · Berlin" },
      badge: { vi: "0176 1159 8888", de: "0176 1159 8888" },
    },
  },
  {
    slug: "voucher",
    photo: "spaProducts",
    layout: "voucher",
    shape: "landscape",
    category: "loyalty",
    tone: "violet",
    name: { vi: "Voucher quà tặng", de: "Geschenkgutschein" },
    format: { vi: "In · Digital · có QR", de: "Druck · Digital · mit QR" },
    copy: {
      eyebrow: { vi: "GUTSCHEIN", de: "GUTSCHEIN" },
      headline: { vi: "25 €", de: "25 €" },
      sub: { vi: "Einlösbar auf alle Behandlungen", de: "Einlösbar auf alle Behandlungen" },
      badge: { vi: "LV-8842-KX", de: "LV-8842-KX" },
    },
  },
  {
    slug: "loyalty-card",
    photo: "retailCounter",
    layout: "loyaltyCard",
    shape: "landscape",
    category: "loyalty",
    tone: "ink",
    name: { vi: "Thẻ thành viên", de: "Mitgliedskarte" },
    format: { vi: "Thẻ · QR tích điểm", de: "Karte · QR zum Punktesammeln" },
    copy: {
      eyebrow: { vi: "GOLD MEMBER", de: "GOLD MEMBER" },
      headline: { vi: "1.240", de: "1.240" },
      sub: { vi: "Punkte · 10 Punkte je 1 €", de: "Punkte · 10 Punkte je 1 €" },
      badge: { vi: "8842 1159 0176", de: "8842 1159 0176" },
    },
  },
  {
    slug: "review-card",
    photo: "portraitWoman",
    layout: "reviewCard",
    shape: "square",
    category: "loyalty",
    tone: "amber",
    name: { vi: "Thẻ mời đánh giá", de: "Bewertungskarte" },
    format: { vi: "Để bàn · có QR", de: "Tischaufsteller · mit QR" },
    copy: {
      eyebrow: { vi: "IHRE MEINUNG ZÄHLT", de: "IHRE MEINUNG ZÄHLT" },
      headline: { vi: "Wie war es bei uns?", de: "Wie war es bei uns?" },
      sub: { vi: "QR scannen · Bewertung abgeben", de: "QR scannen · Bewertung abgeben" },
      badge: { vi: "Danke!", de: "Danke!" },
    },
  },
  {
    slug: "landing-restaurant",
    photo: "restaurantInteriorWarm",
    layout: "landing",
    shape: "wide",
    category: "web",
    tone: "brand",
    name: { vi: "Landing page nhà hàng", de: "Restaurant-Landingpage" },
    format: { vi: "Web · desktop", de: "Web · Desktop" },
    copy: {
      eyebrow: { vi: "lv-groups.com/restaurant-mitte", de: "lv-groups.com/restaurant-mitte" },
      headline: { vi: "Vietnamesische Küche im Herzen Berlins", de: "Vietnamesische Küche im Herzen Berlins" },
      sub: { vi: "Täglich 11:30 – 22:00 Uhr geöffnet.", de: "Täglich 11:30 – 22:00 Uhr geöffnet." },
      badge: { vi: "Tisch reservieren", de: "Tisch reservieren" },
    },
  },
  {
    slug: "newsletter",
    photo: "bowlSalad",
    layout: "newsletter",
    shape: "portrait",
    category: "email",
    tone: "sky",
    name: { vi: "Newsletter hàng tháng", de: "Monats-Newsletter" },
    format: { vi: "Email · 600 px", de: "E-Mail · 600 px" },
    copy: {
      eyebrow: { vi: "NEWSLETTER · SEPTEMBER", de: "NEWSLETTER · SEPTEMBER" },
      headline: { vi: "Neue Herbstkarte", de: "Neue Herbstkarte" },
      sub: { vi: "Sechs neue Gerichte mit Kürbis und Ingwer.", de: "Sechs neue Gerichte mit Kürbis und Ingwer." },
      badge: { vi: "Zur Website", de: "Zur Website" },
    },
  },
  {
    slug: "signage",
    photo: "cafeSign",
    layout: "signage",
    shape: "wide",
    category: "signage",
    tone: "ink",
    name: { vi: "Biển hiệu mặt tiền", de: "Fassadenschild" },
    format: { vi: "Hộp đèn · chữ nổi", de: "Leuchtkasten · Profilbuchstaben" },
    copy: {
      eyebrow: { vi: "LEUCHTKASTEN · PROFILBUCHSTABEN", de: "LEUCHTKASTEN · PROFILBUCHSTABEN" },
      headline: { vi: "SEN VÀNG", de: "SEN VÀNG" },
      sub: { vi: "VIETNAMESISCHES RESTAURANT", de: "VIETNAMESISCHES RESTAURANT" },
      badge: { vi: "Musterstraße 12 · 10115 Berlin", de: "Musterstraße 12 · 10115 Berlin" },
    },
  },
];
