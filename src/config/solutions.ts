import type { Locale } from "@/i18n/config";
import type { PhotoKey } from "@/data/media";

type Localized = Record<Locale, string>;
type LocalizedList = Record<Locale, string[]>;

export type SolutionSlide = {
  slug: string;
  photo: PhotoKey;
  /** Key icon lucide-react, resolve ở component để giữ file này là dữ liệu thuần. */
  icon:
    | "sparkles"
    | "share2"
    | "utensils"
    | "hand"
    | "messagesSquare"
    | "star"
    | "ticket"
    | "globe"
    | "lineChart";
  name: Localized;
  summary: Localized;
  /** Loại mockup dashboard hiển thị trong hero. */
  preview: "calendar" | "studio" | "inbox" | "reviews" | "analytics" | "campaign" | "website" | "loyalty";
  example: Localized;
  metrics: { label: Localized; value: string }[];
};

export const SOLUTIONS: SolutionSlide[] = [
  {
    slug: "ai-social-content",
    photo: "laptopPhone",
    icon: "sparkles",
    preview: "studio",
    name: { vi: "AI Social Content", de: "AI Social Content" },
    summary: {
      vi: "Claude viết caption, script và bài blog theo đúng giọng thương hiệu, hai ngôn ngữ Việt – Đức.",
      de: "Claude schreibt Captions, Skripte und Blogtexte in Ihrer Markenstimme — auf Deutsch und Vietnamesisch.",
    },
    example: {
      vi: "Nhà hàng ở Berlin Mitte cần 12 bài cho tháng tới: nhập món ăn, chọn kênh, duyệt trong 15 phút.",
      de: "Ein Restaurant in Berlin-Mitte braucht 12 Beiträge für den nächsten Monat: Gerichte eingeben, Kanal wählen, in 15 Minuten freigeben.",
    },
    metrics: [
      { label: { vi: "Phương án mỗi lần tạo", de: "Varianten pro Durchlauf" }, value: "4" },
      { label: { vi: "Ngôn ngữ", de: "Sprachen" }, value: "VI · DE" },
    ],
  },
  {
    slug: "social-media-management",
    photo: "teamDesk",
    icon: "share2",
    preview: "calendar",
    name: { vi: "Social Media Management", de: "Social Media Management" },
    summary: {
      vi: "Một lịch nội dung cho mọi kênh, có trạng thái duyệt, kéo thả và nhật ký đăng bài.",
      de: "Ein Redaktionsplan für alle Kanäle — mit Freigabestatus, Drag-and-drop und Veröffentlichungsprotokoll.",
    },
    example: {
      vi: "Chuỗi hai chi nhánh chia ca đăng bài: người tạo, người duyệt, hệ thống lên lịch theo giờ Berlin.",
      de: "Zwei Filialen teilen sich die Redaktion: eine Person erstellt, eine gibt frei, das System plant nach Berliner Zeit.",
    },
    metrics: [
      { label: { vi: "Kênh hỗ trợ", de: "Unterstützte Kanäle" }, value: "7" },
      { label: { vi: "Múi giờ", de: "Zeitzone" }, value: "Europe/Berlin" },
    ],
  },
  {
    slug: "restaurant-marketing",
    photo: "restaurantInteriorWarm",
    icon: "utensils",
    preview: "campaign",
    name: { vi: "Restaurant Marketing", de: "Restaurant Marketing" },
    summary: {
      vi: "Menu digital, chiến dịch món mới, nhắc đặt bàn và chương trình khách quen cho nhà hàng.",
      de: "Digitale Speisekarte, Kampagnen für neue Gerichte, Reservierungserinnerungen und Stammgastprogramm.",
    },
    example: {
      vi: "Chiến dịch Mittagsangebot chạy từ thứ Hai đến thứ Sáu, tự nhắc khách cũ qua WhatsApp.",
      de: "Mittagsangebot von Montag bis Freitag, mit automatischer WhatsApp-Erinnerung an Stammgäste.",
    },
    metrics: [
      { label: { vi: "Mẫu chiến dịch", de: "Kampagnenvorlagen" }, value: "14" },
      { label: { vi: "Kênh nhắc khách", de: "Erinnerungskanäle" }, value: "3" },
    ],
  },
  {
    slug: "nail-salon-marketing",
    photo: "nailsPink",
    icon: "hand",
    preview: "loyalty",
    name: { vi: "Nail Salon Marketing", de: "Nagelstudio Marketing" },
    summary: {
      vi: "Gallery mẫu nail, ảnh before/after, nhắc lịch theo chu kỳ và ưu đãi theo mùa.",
      de: "Design-Galerie, Vorher-Nachher-Bilder, zyklische Terminerinnerung und saisonale Angebote.",
    },
    example: {
      vi: "Khách làm móng ngày 3/6 sẽ nhận nhắc lịch vào ngày 8/7, kèm ưu đãi nếu chưa quay lại.",
      de: "Wer am 3. Juni da war, bekommt am 8. Juli eine Erinnerung — mit Angebot, falls noch kein neuer Termin steht.",
    },
    metrics: [
      { label: { vi: "Chu kỳ nhắc mặc định", de: "Standard-Erinnerung" }, value: "5 " },
      { label: { vi: "Loại ưu đãi", de: "Angebotstypen" }, value: "6" },
    ],
  },
  {
    slug: "customer-care",
    photo: "phoneSocial",
    icon: "messagesSquare",
    preview: "inbox",
    name: { vi: "Customer Care", de: "Kundenbetreuung" },
    summary: {
      vi: "Tin nhắn Facebook, Instagram, WhatsApp và form website gom về một hộp thư duy nhất.",
      de: "Nachrichten aus Facebook, Instagram, WhatsApp und Website-Formularen in einem Postfach.",
    },
    example: {
      vi: "Claude tóm tắt hội thoại tiếng Đức, gợi ý câu trả lời, nhân viên chỉ cần đọc và duyệt.",
      de: "Claude fasst den deutschen Chatverlauf zusammen und schlägt eine Antwort vor — das Team liest und gibt frei.",
    },
    metrics: [
      { label: { vi: "Nguồn tin nhắn", de: "Nachrichtenquellen" }, value: "7" },
      { label: { vi: "Gửi tự động", de: "Autoversand" }, value: "Tắt / Aus" },
    ],
  },
  {
    slug: "review-management",
    photo: "portraitMan",
    icon: "star",
    preview: "reviews",
    name: { vi: "Review Management", de: "Bewertungsmanagement" },
    summary: {
      vi: "Tổng hợp đánh giá, phân tích cảm xúc, cảnh báo review tiêu cực và gợi ý phản hồi.",
      de: "Bewertungen bündeln, Stimmung analysieren, bei negativen Bewertungen warnen und Antworten vorschlagen.",
    },
    example: {
      vi: "Một đánh giá 2 sao xuất hiện lúc 21:30 — hệ thống cảnh báo ngay và soạn sẵn bản nháp phản hồi.",
      de: "Eine 2-Sterne-Bewertung um 21:30 Uhr — das System warnt sofort und legt einen Antwortentwurf bereit.",
    },
    metrics: [
      { label: { vi: "Nguồn đánh giá", de: "Bewertungsquellen" }, value: "4" },
      { label: { vi: "Cảnh báo", de: "Warnung" }, value: "≤ 3 ★" },
    ],
  },
  {
    slug: "loyalty-promotion",
    photo: "retailCounter",
    icon: "ticket",
    preview: "loyalty",
    name: { vi: "Loyalty & Promotion", de: "Treue & Aktionen" },
    summary: {
      vi: "Điểm thưởng, QR thành viên, voucher, quà sinh nhật và chương trình giới thiệu bạn bè.",
      de: "Punkte, Mitglieds-QR, Gutscheine, Geburtstagsgeschenke und Empfehlungsprogramm.",
    },
    example: {
      vi: "Khách quét QR tại quầy, tích điểm mỗi lần ghé, nhận voucher khi đủ mốc.",
      de: "Gäste scannen den QR-Code an der Kasse, sammeln bei jedem Besuch Punkte und erhalten ab einer Schwelle einen Gutschein.",
    },
    metrics: [
      { label: { vi: "Hạng thành viên", de: "Mitgliedsstufen" }, value: "4" },
      { label: { vi: "Loại voucher", de: "Gutscheinarten" }, value: "5" },
    ],
  },
  {
    slug: "website-booking",
    photo: "cafeInterior",
    icon: "globe",
    preview: "website",
    name: { vi: "Website & Booking", de: "Website & Buchung" },
    summary: {
      vi: "Landing page theo mẫu ngành, form đặt bàn và đặt lịch nối thẳng vào CRM.",
      de: "Branchenvorlagen für Landingpages, Reservierungs- und Terminformulare direkt im CRM.",
    },
    example: {
      vi: "Landing page khai trương chi nhánh mới, form đặt bàn tạo lead ngay trong pipeline.",
      de: "Eröffnungs-Landingpage für die neue Filiale — jedes Reservierungsformular erzeugt einen Lead in der Pipeline.",
    },
    metrics: [
      { label: { vi: "Mẫu landing page", de: "Landingpage-Vorlagen" }, value: "8" },
      { label: { vi: "SEO metadata", de: "SEO-Metadaten" }, value: "AI" },
    ],
  },
  {
    slug: "marketing-analytics",
    photo: "teamMeeting",
    icon: "lineChart",
    preview: "analytics",
    name: { vi: "Marketing Analytics", de: "Marketing Analytics" },
    summary: {
      vi: "Reach, tương tác, lead, booking và doanh thu quy đổi, kèm báo cáo bằng ngôn ngữ tự nhiên.",
      de: "Reichweite, Interaktion, Leads, Buchungen und Umsatzbeitrag — mit Bericht in natürlicher Sprache.",
    },
    example: {
      vi: "Cuối tháng, hệ thống trả lời: điều gì đã thay đổi, nội dung nào tốt nhất, nên làm gì tiếp theo.",
      de: "Zum Monatsende beantwortet das System: Was hat sich verändert, welcher Beitrag lief am besten, was ist als Nächstes zu tun.",
    },
    metrics: [
      { label: { vi: "Chỉ số theo dõi", de: "Kennzahlen" }, value: "12" },
      { label: { vi: "Báo cáo AI", de: "KI-Bericht" }, value: "Tự động" },
    ],
  },
];

export type IndustrySolution = {
  slug: string;
  photo: PhotoKey;
  icon: "utensils" | "hand" | "flower" | "store";
  name: Localized;
  lead: Localized;
  features: LocalizedList;
};

export const INDUSTRIES: IndustrySolution[] = [
  {
    slug: "nha-hang",
    photo: "restaurantInterior",
    icon: "utensils",
    name: { vi: "Nhà hàng", de: "Restaurant" },
    lead: {
      vi: "Từ nội dung món ăn tới lượt đặt bàn cuối tuần.",
      de: "Von der Gerichtebeschreibung bis zur Wochenendreservierung.",
    },
    features: {
      vi: [
        "Quản lý nội dung món ăn",
        "Lịch đăng bài",
        "Quảng cáo sự kiện",
        "Menu Digital",
        "Booking",
        "Google Review",
        "WhatsApp Marketing",
        "Chương trình khách hàng thân thiết",
      ],
      de: [
        "Inhalte für Gerichte verwalten",
        "Redaktionsplan",
        "Event-Werbung",
        "Digitale Speisekarte",
        "Reservierung",
        "Google-Bewertungen",
        "WhatsApp-Marketing",
        "Stammgastprogramm",
      ],
    },
  },
  {
    slug: "tiem-nail",
    photo: "manicureWork",
    icon: "hand",
    name: { vi: "Tiệm nail", de: "Nagelstudio" },
    lead: {
      vi: "Giữ khách cũ quay lại đúng chu kỳ, không phụ thuộc trí nhớ.",
      de: "Bestandskunden kommen im richtigen Rhythmus wieder — ohne dass jemand daran denken muss.",
    },
    features: {
      vi: [
        "Nội dung mẫu nail",
        "Before/After",
        "Booking campaign",
        "Nhắc lịch",
        "Chăm sóc khách cũ",
        "Khuyến mại theo mùa",
        "Quản lý review",
        "Social media gallery",
      ],
      de: [
        "Design-Inhalte",
        "Vorher/Nachher",
        "Buchungskampagne",
        "Terminerinnerung",
        "Bestandskundenpflege",
        "Saisonale Aktionen",
        "Bewertungsmanagement",
        "Social-Media-Galerie",
      ],
    },
  },
  {
    slug: "spa-tham-my",
    photo: "spaFacial",
    icon: "flower",
    name: { vi: "Spa và thẩm mỹ", de: "Spa & Kosmetik" },
    lead: {
      vi: "Gói dịch vụ, lịch hẹn và niềm tin của khách hàng.",
      de: "Behandlungspakete, Termine und das Vertrauen Ihrer Kundinnen.",
    },
    features: {
      vi: [
        "Gói dịch vụ",
        "Appointment",
        "Reminder",
        "Testimonial",
        "Treatment content",
        "Voucher",
        "Lead follow-up",
      ],
      de: [
        "Behandlungspakete",
        "Termine",
        "Erinnerungen",
        "Kundenstimmen",
        "Behandlungsinhalte",
        "Gutscheine",
        "Lead-Nachfassung",
      ],
    },
  },
  {
    slug: "doanh-nghiep",
    photo: "retailStore",
    icon: "store",
    name: { vi: "Doanh nghiệp và tiểu thương", de: "Betriebe & Kleingewerbe" },
    lead: {
      vi: "Nền tảng đủ dùng cho cửa hàng, showroom và doanh nghiệp nhỏ.",
      de: "Alles, was Laden, Showroom und Kleinbetrieb wirklich brauchen.",
    },
    features: {
      vi: [
        "Website",
        "Google Business",
        "Nội dung đa kênh",
        "CRM đơn giản",
        "Quảng cáo địa phương",
        "Báo cáo hiệu quả",
        "Tự động chăm sóc khách hàng",
      ],
      de: [
        "Website",
        "Google Business",
        "Multi-Channel-Inhalte",
        "Einfaches CRM",
        "Lokale Werbung",
        "Erfolgsberichte",
        "Automatisierte Kundenpflege",
      ],
    },
  },
];

export type LvService = {
  slug: string;
  category: "BRANDING" | "WEB" | "PHOTO_VIDEO" | "PRINT" | "SIGNAGE" | "MATERIAL" | "CONSTRUCTION" | "CONSULTING" | "MARKETING";
  name: Localized;
  summary: Localized;
  leadTime: Localized;
  process: LocalizedList;
};

/** Danh mục dịch vụ LV GROUP — nguồn seed cho bảng Service. */
export const LV_SERVICES: LvService[] = [
  {
    slug: "thiet-ke-logo",
    category: "BRANDING",
    name: { vi: "Thiết kế logo", de: "Logo-Design" },
    summary: {
      vi: "Logo mới hoặc tinh chỉnh logo hiện có, kèm file gốc và hướng dẫn sử dụng.",
      de: "Neues Logo oder Überarbeitung des bestehenden — inklusive Quelldateien und Anwendungsleitfaden.",
    },
    leadTime: { vi: "7–10 ngày làm việc", de: "7–10 Werktage" },
    process: {
      vi: ["Nhận brief", "Nghiên cứu ngành", "3 phương án", "Chỉnh sửa 2 vòng", "Bàn giao file gốc"],
      de: ["Brief aufnehmen", "Branchenrecherche", "3 Entwürfe", "2 Korrekturrunden", "Übergabe der Quelldateien"],
    },
  },
  {
    slug: "bo-nhan-dien-thuong-hieu",
    category: "BRANDING",
    name: { vi: "Bộ nhận diện thương hiệu", de: "Corporate Design" },
    summary: {
      vi: "Màu sắc, typography, ứng dụng lên menu, bảng hiệu, ấn phẩm và mạng xã hội.",
      de: "Farben, Typografie und Anwendung auf Speisekarte, Beschilderung, Drucksachen und Social Media.",
    },
    leadTime: { vi: "3–4 tuần", de: "3–4 Wochen" },
    process: {
      vi: ["Khảo sát thương hiệu", "Định hướng thiết kế", "Xây dựng bộ nhận diện", "Guideline", "Bàn giao"],
      de: ["Markenanalyse", "Designrichtung", "Corporate Design aufbauen", "Guideline", "Übergabe"],
    },
  },
  {
    slug: "thiet-ke-website",
    category: "WEB",
    name: { vi: "Thiết kế website", de: "Webdesign" },
    summary: {
      vi: "Website giới thiệu hoặc đặt lịch, chuẩn di động, tối ưu Google và có Impressum.",
      de: "Präsentations- oder Buchungswebsite: mobiloptimiert, Google-tauglich, mit Impressum.",
    },
    leadTime: { vi: "3–6 tuần", de: "3–6 Wochen" },
    process: {
      vi: ["Brief và sitemap", "Thiết kế giao diện", "Lập trình", "Nội dung", "Kiểm thử và bàn giao"],
      de: ["Brief und Sitemap", "Interface-Design", "Umsetzung", "Inhalte", "Test und Übergabe"],
    },
  },
  {
    slug: "thiet-ke-menu",
    category: "PRINT",
    name: { vi: "Thiết kế menu", de: "Speisekarten-Design" },
    summary: {
      vi: "Menu in và menu digital, song ngữ Đức – Việt, chuẩn khai báo dị ứng nguyên liệu.",
      de: "Druck- und Digitalkarte, zweisprachig, mit korrekter Allergenkennzeichnung.",
    },
    leadTime: { vi: "5–7 ngày làm việc", de: "5–7 Werktage" },
    process: {
      vi: ["Nhận danh sách món", "Dàn trang", "Chỉnh sửa", "File in và file digital"],
      de: ["Gerichteliste aufnehmen", "Layout", "Korrektur", "Druck- und Digitaldatei"],
    },
  },
  {
    slug: "chup-anh-san-pham",
    category: "PHOTO_VIDEO",
    name: { vi: "Chụp ảnh sản phẩm", de: "Produktfotografie" },
    summary: {
      vi: "Bộ ảnh món ăn, mẫu nail, sản phẩm hoặc không gian, dùng được cho cả in ấn và social.",
      de: "Bildstrecke für Gerichte, Nageldesigns, Produkte oder Räume — für Druck und Social Media.",
    },
    leadTime: { vi: "1 buổi chụp + 5 ngày hậu kỳ", de: "1 Shooting-Tag + 5 Tage Nachbearbeitung" },
    process: {
      vi: ["Lên danh sách chụp", "Buổi chụp tại cơ sở", "Chọn ảnh", "Hậu kỳ", "Bàn giao"],
      de: ["Shotlist erstellen", "Shooting vor Ort", "Auswahl", "Retusche", "Übergabe"],
    },
  },
  {
    slug: "quay-video-quang-cao",
    category: "PHOTO_VIDEO",
    name: { vi: "Quay video quảng cáo", de: "Werbevideo" },
    summary: {
      vi: "Video ngắn cho Facebook, Instagram và TikTok, có phụ đề tiếng Đức.",
      de: "Kurzvideos für Facebook, Instagram und TikTok, mit deutschen Untertiteln.",
    },
    leadTime: { vi: "2–3 tuần", de: "2–3 Wochen" },
    process: {
      vi: ["Kịch bản", "Quay", "Dựng", "Phụ đề", "Xuất bản đa kênh"],
      de: ["Drehbuch", "Dreh", "Schnitt", "Untertitel", "Ausspielung je Kanal"],
    },
  },
  {
    slug: "bien-quang-cao",
    category: "SIGNAGE",
    name: { vi: "Biển quảng cáo", de: "Werbeschilder" },
    summary: {
      vi: "Thiết kế và thi công biển hiệu mặt tiền, chữ nổi, hộp đèn và decal cửa kính.",
      de: "Gestaltung und Montage von Fassadenschildern, Profilbuchstaben, Leuchtkästen und Glasfolien.",
    },
    leadTime: { vi: "2–4 tuần", de: "2–4 Wochen" },
    process: {
      vi: ["Khảo sát mặt tiền", "Phối cảnh", "Sản xuất", "Lắp đặt", "Nghiệm thu"],
      de: ["Fassade aufmessen", "Visualisierung", "Fertigung", "Montage", "Abnahme"],
    },
  },
  {
    slug: "vat-lieu-noi-that",
    category: "MATERIAL",
    name: { vi: "Vật liệu trang trí nội thất", de: "Dekomaterial für den Innenausbau" },
    summary: {
      vi: "Tổng kho vật liệu trang trí tại Berlin: tấm ốp, đá, gỗ, kim loại, đèn trang trí.",
      de: "Zentrallager in Berlin: Wandpaneele, Stein, Holz, Metall und Dekorleuchten.",
    },
    leadTime: { vi: "Có sẵn kho hoặc 1–3 tuần đặt hàng", de: "Lagerware oder 1–3 Wochen Lieferzeit" },
    process: {
      vi: ["Xem mẫu tại kho", "Báo giá", "Đặt hàng", "Giao hàng"],
      de: ["Muster im Lager ansehen", "Angebot", "Bestellung", "Lieferung"],
    },
  },
  {
    slug: "thi-cong-noi-that",
    category: "CONSTRUCTION",
    name: { vi: "Thi công nội thất", de: "Innenausbau" },
    summary: {
      vi: "Thi công trọn gói nhà hàng, tiệm nail, spa và showroom, có hồ sơ nghiệm thu.",
      de: "Schlüsselfertiger Ausbau für Restaurant, Nagelstudio, Spa und Showroom — inklusive Abnahmedokumentation.",
    },
    leadTime: { vi: "Theo quy mô dự án", de: "Je nach Projektumfang" },
    process: {
      vi: ["Khảo sát mặt bằng", "Thiết kế và dự toán", "Thi công", "Nghiệm thu", "Bảo hành"],
      de: ["Objektaufnahme", "Planung und Kalkulation", "Ausführung", "Abnahme", "Gewährleistung"],
    },
  },
  {
    slug: "phoi-canh-3d",
    category: "CONSULTING",
    name: { vi: "Phối cảnh 3D", de: "3D-Visualisierung" },
    summary: {
      vi: "Hình ảnh 3D không gian trước khi thi công, giúp chốt phương án nhanh hơn.",
      de: "3D-Bilder des Raums vor Baubeginn — damit Entscheidungen schneller fallen.",
    },
    leadTime: { vi: "7–14 ngày", de: "7–14 Tage" },
    process: {
      vi: ["Nhận mặt bằng", "Dựng 3D", "Chỉnh sửa", "Xuất ảnh chất lượng cao"],
      de: ["Grundriss aufnehmen", "3D-Aufbau", "Korrektur", "Hochauflösende Ausgabe"],
    },
  },
  {
    slug: "social-media-management-service",
    category: "MARKETING",
    name: { vi: "Quản trị social media", de: "Social-Media-Betreuung" },
    summary: {
      vi: "Đội ngũ LV GROUP vận hành kênh thay bạn: lên nội dung, đăng bài, trả lời tin nhắn.",
      de: "Das LV-GROUP-Team übernimmt Ihre Kanäle: Inhalte planen, veröffentlichen, Nachrichten beantworten.",
    },
    leadTime: { vi: "Theo tháng", de: "Monatlich" },
    process: {
      vi: ["Khai báo thương hiệu", "Kế hoạch tháng", "Sản xuất nội dung", "Đăng bài", "Báo cáo"],
      de: ["Marke hinterlegen", "Monatsplan", "Content-Produktion", "Veröffentlichung", "Reporting"],
    },
  },
  {
    slug: "quang-cao-tra-phi",
    category: "MARKETING",
    name: { vi: "Quảng cáo trả phí", de: "Bezahlte Werbung" },
    summary: {
      vi: "Thiết lập và tối ưu quảng cáo Meta và Google theo khu vực quanh cơ sở kinh doanh.",
      de: "Meta- und Google-Werbung im Umkreis Ihres Standorts einrichten und optimieren.",
    },
    leadTime: { vi: "Khởi chạy trong 5 ngày", de: "Start innerhalb von 5 Tagen" },
    process: {
      vi: ["Xác định mục tiêu", "Thiết lập tài khoản", "Tạo quảng cáo", "Chạy thử", "Tối ưu hàng tuần"],
      de: ["Ziele festlegen", "Konten einrichten", "Anzeigen erstellen", "Testlauf", "Wöchentliche Optimierung"],
    },
  },
];
