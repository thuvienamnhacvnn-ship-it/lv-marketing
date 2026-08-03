/**
 * Registry ảnh của website.
 *
 * Mỗi ảnh có `src` (đường dẫn hoặc URL) + `alt` song ngữ.
 * Ảnh stock lấy từ Unsplash (giấy phép cho phép dùng thương mại, không cần ghi công).
 *
 * KHI CÓ ẢNH THẬT CỦA LV GROUP: đặt file vào `public/media/` rồi đổi `src`
 * thành `/media/<tên-file>` — không cần sửa chỗ nào khác.
 */
import type { Locale } from "@/i18n/config";

type Localized = Record<Locale, string>;

export type Photo = {
  src: string;
  alt: Localized;
  /** true khi là ảnh thật của LV GROUP, false khi là ảnh minh hoạ stock. */
  isReal?: boolean;
};

const unsplash = (id: string) => `https://images.unsplash.com/${id}`;

export const PHOTOS = {
  /* ── Ảnh thật của LV GROUP ────────────────────────────── */
  lvMaterialBanner: {
    src: "/media/lv-group-material-banner.png",
    isReal: true,
    alt: {
      vi: "Banner giới thiệu vật liệu trang trí nội thất của LV GROUP",
      de: "LV-GROUP-Banner für Innen-Deko-Material",
    },
  },

  /* ── Nhà hàng ─────────────────────────────────────────── */
  restaurantInterior: {
    src: unsplash("photo-1517248135467-4c7edcad34c4"),
    alt: { vi: "Không gian nhà hàng hiện đại", de: "Modernes Restaurant-Interieur" },
  },
  restaurantInteriorWarm: {
    src: unsplash("photo-1552566626-52f8b828add9"),
    alt: { vi: "Quầy bar nhà hàng ấm áp", de: "Warme Restaurantbar" },
  },
  restaurantBright: {
    src: unsplash("photo-1555396273-367ea4eb4db5"),
    alt: { vi: "Nhà hàng sáng, nhiều bàn", de: "Helles Restaurant mit vielen Tischen" },
  },
  fineDiningPlate: {
    src: unsplash("photo-1414235077428-338989a2e8c0"),
    alt: { vi: "Món ăn được bày biện tinh tế", de: "Fein angerichtetes Gericht" },
  },
  foodFlatlay: {
    src: unsplash("photo-1504674900247-0877df9cc836"),
    alt: { vi: "Các món ăn chụp từ trên xuống", de: "Gerichte von oben fotografiert" },
  },
  bowlSalad: {
    src: unsplash("photo-1546069901-ba9599a7e63c"),
    alt: { vi: "Bát salad nhiều màu", de: "Bunte Salatschale" },
  },
  noodles: {
    src: unsplash("photo-1585032226651-759b368d7246"),
    alt: { vi: "Mì xào châu Á", de: "Asiatische Bratnudeln" },
  },
  ramenBowl: {
    src: unsplash("photo-1569718212165-3a8278d5f624"),
    alt: { vi: "Bát mì nước kiểu châu Á", de: "Asiatische Nudelsuppe" },
  },
  vietnameseDish: {
    src: unsplash("photo-1559847844-5315695dadae"),
    alt: { vi: "Món tôm cơm kiểu Việt", de: "Vietnamesisches Garnelengericht" },
  },
  peopleEating: {
    src: unsplash("photo-1466978913421-dad2ebd01d17"),
    alt: { vi: "Khách cùng dùng bữa", de: "Gäste beim gemeinsamen Essen" },
  },

  /* ── Tiệm nail ────────────────────────────────────────── */
  nailsPink: {
    src: unsplash("photo-1632345031435-8727f6897d53"),
    alt: { vi: "Mẫu nail hồng nghệ thuật", de: "Pinkes Nageldesign" },
  },
  nailsDark: {
    src: unsplash("photo-1604654894610-df63bc536371"),
    alt: { vi: "Mẫu nail tối màu", de: "Dunkles Nageldesign" },
  },
  manicureHands: {
    src: unsplash("photo-1610992015732-2449b76344bc"),
    alt: { vi: "Bàn tay sau khi làm móng", de: "Hände nach der Maniküre" },
  },
  manicureWork: {
    src: unsplash("photo-1519014816548-bf5fe059798b"),
    alt: { vi: "Thợ nail đang làm móng cho khách", de: "Maniküre-Behandlung im Studio" },
  },

  /* ── Spa & thẩm mỹ ────────────────────────────────────── */
  spaFacial: {
    src: unsplash("photo-1600334089648-b0d9d3028eb2"),
    alt: { vi: "Liệu trình chăm sóc da mặt", de: "Gesichtsbehandlung" },
  },
  spaFacialTwo: {
    src: unsplash("photo-1596178065887-1198b6148b2b"),
    alt: { vi: "Khách đang trị liệu da mặt", de: "Kundin bei der Gesichtsbehandlung" },
  },
  spaStones: {
    src: unsplash("photo-1540555700478-4be289fbecef"),
    alt: { vi: "Massage đá nóng", de: "Hot-Stone-Massage" },
  },
  spaProducts: {
    src: unsplash("photo-1544161515-4ab6ce6db874"),
    alt: { vi: "Sản phẩm chăm sóc và khăn spa", de: "Pflegeprodukte und Handtücher" },
  },
  spaMassage: {
    src: unsplash("photo-1570172619644-dfd03ed5d881"),
    alt: { vi: "Massage tinh dầu", de: "Aroma-Massage" },
  },

  /* ── Café ─────────────────────────────────────────────── */
  cafeStreet: {
    src: unsplash("photo-1445116572660-236099ec97a0"),
    alt: { vi: "Quán café vỉa hè", de: "Straßencafé" },
  },
  cafeInterior: {
    src: unsplash("photo-1559925393-8be0ec4767c8"),
    alt: { vi: "Không gian bên trong quán café", de: "Café-Innenraum" },
  },
  cafeTable: {
    src: unsplash("photo-1554118811-1e0d58224f24"),
    alt: { vi: "Bàn café bên cửa sổ", de: "Cafétisch am Fenster" },
  },
  cafeSign: {
    src: unsplash("photo-1501339847302-ac426a4a7cbb"),
    alt: { vi: "Biển hiệu quán café", de: "Café-Schild" },
  },

  /* ── Bán lẻ & showroom ────────────────────────────────── */
  retailStore: {
    src: unsplash("photo-1441986300917-64674bd600d8"),
    alt: { vi: "Cửa hàng thời trang", de: "Modegeschäft" },
  },
  retailCounter: {
    src: unsplash("photo-1556742049-0cfed4f6a45d"),
    alt: { vi: "Quầy thanh toán cửa hàng", de: "Ladenkasse" },
  },
  showroomSofa: {
    src: unsplash("photo-1567016432779-094069958ea5"),
    alt: { vi: "Sofa cam trong showroom nội thất", de: "Orangefarbenes Sofa im Möbel-Showroom" },
  },
  showroomChairs: {
    src: unsplash("photo-1524758631624-e2822e304c36"),
    alt: { vi: "Showroom nội thất nhiều ghế", de: "Möbel-Showroom mit Sitzmöbeln" },
  },
  interiorLiving: {
    src: unsplash("photo-1616486338812-3dadae4b4ace"),
    alt: { vi: "Phòng khách hoàn thiện", de: "Fertiges Wohnzimmer" },
  },
  interiorModern: {
    src: unsplash("photo-1600607687939-ce8a6c25118c"),
    alt: { vi: "Nội thất hiện đại tông sáng", de: "Modernes Interieur in hellen Tönen" },
  },
  interiorAccent: {
    src: unsplash("photo-1586023492125-27b2c045efd7"),
    alt: { vi: "Góc nội thất với ghế vàng", de: "Interieur-Ecke mit gelbem Sessel" },
  },

  /* ── Con người & vận hành ─────────────────────────────── */
  teamWorking: {
    src: unsplash("photo-1521737604893-d14cc237f11d"),
    alt: { vi: "Đội ngũ làm việc cùng nhau", de: "Team bei der Arbeit" },
  },
  teamMeeting: {
    src: unsplash("photo-1600880292203-757bb62b4baf"),
    alt: { vi: "Buổi họp lên kế hoạch", de: "Planungsmeeting" },
  },
  teamDesk: {
    src: unsplash("photo-1552581234-26160f608093"),
    alt: { vi: "Nhóm marketing họp bàn", de: "Marketing-Team im Gespräch" },
  },
  portraitWoman: {
    src: unsplash("photo-1573497019940-1c28c88b4f3e"),
    alt: { vi: "Chủ doanh nghiệp nữ", de: "Unternehmerin" },
  },
  portraitMan: {
    src: unsplash("photo-1556157382-97eda2d62296"),
    alt: { vi: "Chủ nhà hàng", de: "Restaurantinhaber" },
  },

  /* ── Số hoá ───────────────────────────────────────────── */
  phoneSocial: {
    src: unsplash("photo-1512941937669-90a1b58e7e9c"),
    alt: { vi: "Màn hình điện thoại với ứng dụng mạng xã hội", de: "Smartphone mit Social-Media-Apps" },
  },
  laptopPhone: {
    src: unsplash("photo-1563986768609-322da13575f3"),
    alt: { vi: "Làm việc với laptop và điện thoại", de: "Arbeiten mit Laptop und Smartphone" },
  },

  /* ── Berlin ───────────────────────────────────────────── */
  berlinGate: {
    src: unsplash("photo-1560969184-10fe8719e047"),
    alt: { vi: "Cổng Brandenburg, Berlin", de: "Brandenburger Tor, Berlin" },
  },
  berlinNight: {
    src: unsplash("photo-1528728329032-2972f65dfb3f"),
    alt: { vi: "Berlin về đêm", de: "Berlin bei Nacht" },
  },
} as const satisfies Record<string, Photo>;

export type PhotoKey = keyof typeof PHOTOS;

/** Tham số tối ưu Unsplash. Ảnh nội bộ trả về nguyên đường dẫn. */
export function photoUrl(key: PhotoKey, width: number, quality = 76): string {
  const { src } = PHOTOS[key];
  if (!src.startsWith("http")) return src;
  return `${src}?auto=format&fit=crop&w=${width}&q=${quality}`;
}
