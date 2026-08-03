import type { Locale } from "@/i18n/config";

type Localized = Record<Locale, string>;

/**
 * Nội dung cho khu "Bên trong nền tảng".
 *
 * Đặt ở đây thay vì trong từ điển i18n vì đây là dữ liệu MẪU của sản phẩm — caption
 * thật, tên khách thật, con số thật — chứ không phải nhãn giao diện. Từ điển giữ
 * cho phần khung (tiêu đề, nút bấm), còn ruột màn hình nằm ở file này.
 *
 * Mọi con số đều là số minh hoạ. Trang có ghi rõ điều đó, không được bỏ dòng cảnh báo.
 */
export type TourKey = "studio" | "calendar" | "inbox" | "reviews" | "campaign" | "leads";

export type TourModule = {
  key: TourKey;
  icon: string;
  name: Localized;
  /** Một câu lợi ích, hiện ngay trên nút chọn module. */
  tagline: Localized;
  /** Ba câu khung: chủ quán đang khổ vì gì → bấm gì → đo được gì. */
  problem: Localized;
  action: Localized;
  outcome: Localized;
  /** Ba số liệu nhỏ dưới màn hình. `value` không dịch — số và ký hiệu dùng chung. */
  facts: { label: Localized; value: string }[];
};

export const TOUR_MODULES: TourModule[] = [
  {
    key: "studio",
    icon: "sparkles",
    name: { vi: "AI Content Studio", de: "AI Content Studio" },
    tagline: {
      vi: "Mô tả món ăn một lần, nhận ba phương án đăng bài",
      de: "Gericht einmal beschreiben, drei Post-Varianten erhalten",
    },
    problem: {
      vi: "Tối nào cũng loay hoay nghĩ caption, viết xong đọc lại thấy giống hệt tuần trước.",
      de: "Jeden Abend Captions grübeln — und am Ende klingt alles wie letzte Woche.",
    },
    action: {
      vi: "Chọn kênh, mục tiêu và giọng văn. AI đọc hồ sơ thương hiệu của bạn rồi viết ba phương án khác nhau, kèm hashtag và gợi ý ảnh.",
      de: "Kanal, Ziel und Tonfall wählen. Die KI liest Ihr Markenprofil und schreibt drei Varianten samt Hashtags und Bildvorschlag.",
    },
    outcome: {
      vi: "Thời gian soạn một bài giảm từ 25 phút xuống dưới 2 phút.",
      de: "Von 25 Minuten pro Beitrag auf unter 2 Minuten.",
    },
    facts: [
      { label: { vi: "Phương án mỗi lần", de: "Varianten pro Lauf" }, value: "3" },
      { label: { vi: "Ngôn ngữ", de: "Sprachen" }, value: "VI · DE" },
      { label: { vi: "Thời gian soạn", de: "Zeit pro Beitrag" }, value: "< 2 phút" },
    ],
  },
  {
    key: "calendar",
    icon: "calendar",
    name: { vi: "Content Calendar", de: "Content Calendar" },
    tagline: {
      vi: "Nhìn cả tháng trong một màn hình, kéo thả để đổi lịch",
      de: "Ganzer Monat auf einen Blick, per Drag & Drop verschieben",
    },
    problem: {
      vi: "Bài đăng nằm rải rác trong ghi chú điện thoại và tin nhắn nhóm, không ai biết tuần sau đăng gì.",
      de: "Beiträge liegen verstreut in Notizen und Gruppenchats — niemand weiß, was nächste Woche läuft.",
    },
    action: {
      vi: "Mỗi ô là một bài đã có nội dung, kênh và trạng thái duyệt. Kéo sang ngày khác là lịch tự cập nhật trên mọi kênh.",
      de: "Jede Kachel ist ein fertiger Beitrag mit Kanal und Freigabestatus. Auf einen anderen Tag ziehen — alle Kanäle aktualisieren sich.",
    },
    outcome: {
      vi: "Không còn tuần nào bỏ trống, và biết trước hai tuần sẽ đăng gì.",
      de: "Keine leeren Wochen mehr — und zwei Wochen Vorlauf im Blick.",
    },
    facts: [
      { label: { vi: "Bài trong tháng", de: "Beiträge im Monat" }, value: "18" },
      { label: { vi: "Đã duyệt", de: "Freigegeben" }, value: "12" },
      { label: { vi: "Chờ duyệt", de: "Wartet" }, value: "3" },
    ],
  },
  {
    key: "inbox",
    icon: "inbox",
    name: { vi: "Customer Inbox", de: "Customer Inbox" },
    tagline: {
      vi: "Instagram, WhatsApp, Facebook gom về một hộp thư",
      de: "Instagram, WhatsApp, Facebook in einem Postfach",
    },
    problem: {
      vi: "Khách nhắn đặt bàn qua Instagram lúc 22h, sáng hôm sau mới thấy thì họ đã đặt chỗ khác.",
      de: "Tischanfrage um 22 Uhr auf Instagram — morgens gesehen, da ist der Gast längst woanders.",
    },
    action: {
      vi: "Mọi kênh đổ về một nơi. AI đọc ngữ cảnh rồi soạn sẵn câu trả lời đúng ngôn ngữ khách dùng; bạn đọc lại và bấm gửi.",
      de: "Alle Kanäle an einem Ort. Die KI liest den Kontext und entwirft die Antwort in der Sprache des Gastes — Sie prüfen und senden.",
    },
    outcome: {
      vi: "Thời gian phản hồi trung bình rút từ vài tiếng xuống vài phút.",
      de: "Antwortzeit von Stunden auf Minuten.",
    },
    facts: [
      { label: { vi: "Kênh gộp chung", de: "Kanäle gebündelt" }, value: "5" },
      { label: { vi: "Phản hồi trung bình", de: "Ø Antwortzeit" }, value: "4 phút" },
      { label: { vi: "Trả lời tự soạn", de: "Antworten vorbereitet" }, value: "AI" },
    ],
  },
  {
    key: "reviews",
    icon: "star",
    name: { vi: "Review Center", de: "Review Center" },
    tagline: {
      vi: "Đánh giá Google về một chỗ, kèm câu trả lời soạn sẵn",
      de: "Google-Bewertungen an einem Ort, Antwort schon entworfen",
    },
    problem: {
      vi: "Một đánh giá 2 sao không được trả lời nằm đó cả tháng, ai tìm quán cũng đọc thấy đầu tiên.",
      de: "Eine unbeantwortete 2-Sterne-Bewertung steht wochenlang ganz oben — jeder Suchende liest sie zuerst.",
    },
    action: {
      vi: "Hệ thống chấm cảm xúc từng đánh giá, đẩy bài tiêu cực lên đầu và soạn sẵn câu trả lời đúng giọng thương hiệu bằng tiếng Đức.",
      de: "Jede Bewertung wird nach Stimmung bewertet, negative zuerst gezeigt und eine Antwort im Markenton auf Deutsch entworfen.",
    },
    outcome: {
      vi: "Đánh giá xấu được trả lời trong 24 giờ thay vì bị bỏ quên.",
      de: "Negative Bewertungen binnen 24 Stunden beantwortet statt vergessen.",
    },
    facts: [
      { label: { vi: "Điểm trung bình", de: "Ø Bewertung" }, value: "4,8" },
      { label: { vi: "Tổng đánh giá", de: "Bewertungen" }, value: "218" },
      { label: { vi: "Chưa phản hồi", de: "Offen" }, value: "1" },
    ],
  },
  {
    key: "campaign",
    icon: "megaphone",
    name: { vi: "Campaign Performance", de: "Campaign Performance" },
    tagline: {
      vi: "Biết chiến dịch nào ra khách, chiến dịch nào chỉ tốn tiền",
      de: "Sehen, welche Kampagne Gäste bringt — und welche nur Geld kostet",
    },
    problem: {
      vi: "Chạy quảng cáo nhưng không biết tiền đi đâu, chỉ thấy hết ngân sách rồi thôi.",
      de: "Werbung läuft, aber wohin das Geld fließt bleibt unklar — am Ende ist nur das Budget weg.",
    },
    action: {
      vi: "Từng chiến dịch hiện rõ chi phí, lượt tiếp cận, số lead và số bàn đặt được. So sánh cạnh nhau, tắt cái không hiệu quả.",
      de: "Jede Kampagne zeigt Kosten, Reichweite, Leads und Reservierungen. Nebeneinander vergleichen, Schwaches abschalten.",
    },
    outcome: {
      vi: "Biết chính xác một lượt đặt bàn tốn bao nhiêu tiền quảng cáo.",
      de: "Sie wissen genau, was eine Reservierung an Werbebudget kostet.",
    },
    facts: [
      { label: { vi: "Chiến dịch đang chạy", de: "Aktive Kampagnen" }, value: "3" },
      { label: { vi: "Chi phí mỗi đặt bàn", de: "Kosten pro Reservierung" }, value: "2,40 €" },
      { label: { vi: "Doanh thu quy đổi", de: "Zugerechneter Umsatz" }, value: "4.180 €" },
    ],
  },
  {
    key: "leads",
    icon: "users",
    name: { vi: "Lead Pipeline", de: "Lead Pipeline" },
    tagline: {
      vi: "Khách hỏi đặt tiệc không còn rơi rụng giữa chừng",
      de: "Event-Anfragen gehen nicht mehr unterwegs verloren",
    },
    problem: {
      vi: "Khách hỏi đặt tiệc 40 người, hứa gọi lại rồi quên mất, hai tuần sau mới nhớ ra.",
      de: "Anfrage für 40 Personen, Rückruf versprochen, vergessen — zwei Wochen später fällt es wieder ein.",
    },
    action: {
      vi: "Mỗi yêu cầu là một thẻ đi qua bảy bước, có người phụ trách, giá trị dự kiến và ngày phải liên hệ lại. Quá hạn là hệ thống nhắc.",
      de: "Jede Anfrage ist eine Karte durch sieben Stufen — mit Verantwortlichem, erwartetem Wert und Wiedervorlage. Überfällig? Das System erinnert.",
    },
    outcome: {
      vi: "Không còn đơn tiệc nào rơi vì quên gọi lại.",
      de: "Keine Event-Buchung geht mehr durch vergessene Rückrufe verloren.",
    },
    facts: [
      { label: { vi: "Đơn đang theo", de: "Offene Anfragen" }, value: "9" },
      { label: { vi: "Giá trị dự kiến", de: "Erwarteter Wert" }, value: "12.400 €" },
      { label: { vi: "Nhắc quá hạn", de: "Überfällig" }, value: "0" },
    ],
  },
];
