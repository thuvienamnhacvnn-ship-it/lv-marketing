import { Check, Clock, Copy, Hash, MessageCircle, RefreshCw, Send, Sparkles, Star } from "lucide-react";
import type { TourKey } from "@/data/platform-tour";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

/**
 * Ruột của từng màn hình trong khu "Bên trong nền tảng".
 *
 * Nguyên tắc: mọi thứ trong đây phải ĐỌC ĐƯỢC. Bản trước dùng thanh xám giả để
 * gợi ý chữ — nhìn thì gọn nhưng người xem không biết sản phẩm làm được gì, nên
 * cả khu chỉ còn là hình trang trí. Caption, tên khách, số tiền, ngày tháng đều
 * là nội dung thật như khi dùng.
 *
 * Component thuần server, không state — phần bấm chọn nằm ở `platform-tour.tsx`.
 */
export function TourScreen({ variant, locale }: { variant: TourKey; locale: Locale }) {
  switch (variant) {
    case "studio":
      return <StudioScreen locale={locale} />;
    case "calendar":
      return <CalendarScreen locale={locale} />;
    case "inbox":
      return <InboxScreen locale={locale} />;
    case "reviews":
      return <ReviewsScreen locale={locale} />;
    case "campaign":
      return <CampaignScreen locale={locale} />;
    case "leads":
      return <LeadsScreen locale={locale} />;
  }
}

const vd = <T,>(locale: Locale, vi: T, de: T) => (locale === "de" ? de : vi);

/* ══ AI CONTENT STUDIO ══════════════════════════════════════ */

function StudioScreen({ locale }: { locale: Locale }) {
  const brief = [
    { k: vd(locale, "Kênh", "Kanal"), v: "Instagram" },
    { k: vd(locale, "Mục tiêu", "Ziel"), v: vd(locale, "Tăng đặt bàn tối", "Mehr Abendreservierungen") },
    { k: vd(locale, "Món", "Gericht"), v: "Bún bò Huế" },
    { k: vd(locale, "Giọng văn", "Tonfall"), v: vd(locale, "Ấm áp, tự hào", "Warm, stolz") },
  ];

  const variants = [
    {
      selected: true,
      body: vd(
        locale,
        "Nước dùng ninh 12 tiếng từ 4 giờ sáng. Sả, ớt và mắm ruốc — đúng công thức bà ngoại mang từ Huế sang Berlin năm 1994. Tối nay còn vài bàn.",
        "12 Stunden Brühe, angesetzt um 4 Uhr morgens. Zitronengras, Chili und Garnelenpaste — das Rezept, das unsere Großmutter 1994 aus Huế nach Berlin brachte. Heute Abend noch wenige Tische frei.",
      ),
      tags: ["#bunbohue", "#berlinvietnamese", "#kantstrasse"],
    },
    {
      selected: false,
      body: vd(
        locale,
        "Cay vừa đủ để ấm bụng ngày Berlin trở gió. Bún bò Huế nhà Sen — sợi bún to, thịt bò mềm, chả cua tự làm.",
        "Genau scharf genug für einen zugigen Berliner Tag. Bún bò Huế bei Sen — dicke Reisnudeln, zartes Rind, hausgemachte Krebsküchlein.",
      ),
      tags: ["#soulfood", "#vietnamesischessen"],
    },
    {
      selected: false,
      body: vd(
        locale,
        "Ở Huế người ta ăn bún bò vào bữa sáng. Ở Kantstraße, chúng tôi phục vụ cả ngày — vì Berlin lạnh hơn Huế nhiều.",
        "In Huế isst man Bún bò zum Frühstück. In der Kantstraße servieren wir es den ganzen Tag — Berlin ist deutlich kälter.",
      ),
      tags: ["#hue", "#berlinfood"],
    },
  ];

  return (
    <Screen>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        {/* Bản khai yêu cầu */}
        <div className="bg-paper-3 rounded-xl p-3.5">
          <p className="text-ink-3 text-[0.6rem] font-bold tracking-[0.14em] uppercase">
            {vd(locale, "Bản khai", "Briefing")}
          </p>
          <dl className="mt-3 space-y-2.5">
            {brief.map((row) => (
              <div key={row.k} className="flex items-baseline justify-between gap-3">
                <dt className="text-ink-3 shrink-0 text-[0.68rem]">{row.k}</dt>
                <dd className="text-ink truncate text-[0.72rem] font-semibold">{row.v}</dd>
              </div>
            ))}
          </dl>
          <div className="bg-brand mt-4 flex items-center justify-center gap-1.5 rounded-lg py-2 text-[0.7rem] font-bold text-white">
            <Sparkles className="size-3" aria-hidden />
            {vd(locale, "Tạo nội dung", "Inhalte erzeugen")}
          </div>
          <p className="text-ink-3 mt-2.5 text-[0.6rem] leading-relaxed">
            {vd(
              locale,
              "AI đọc hồ sơ thương hiệu: món, giá, giọng văn, từ cấm.",
              "Die KI liest Ihr Markenprofil: Gerichte, Preise, Tonfall, Sperrwörter.",
            )}
          </p>
        </div>

        {/* Ba phương án */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <p className="text-ink text-[0.72rem] font-bold">
              {vd(locale, "3 phương án", "3 Varianten")}
            </p>
            <span className="text-ink-3 flex items-center gap-1 text-[0.62rem]">
              <RefreshCw className="size-2.5" aria-hidden />
              {vd(locale, "Tạo lại", "Neu erzeugen")}
            </span>
          </div>

          {variants.map((v, i) => (
            <div
              key={i}
              className={cn(
                "rounded-xl p-3",
                v.selected ? "bg-brand-tint ring-brand/30 ring-1" : "bg-paper-3",
              )}
            >
              <p className="text-ink text-[0.72rem] leading-relaxed">{v.body}</p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {v.tags.map((tag) => (
                  <span key={tag} className="text-violet-ink bg-violet-tint rounded px-1.5 py-0.5 text-[0.58rem] font-semibold">
                    {tag}
                  </span>
                ))}
                {v.selected ? (
                  <span className="text-brand-ink ml-auto flex items-center gap-1 text-[0.6rem] font-bold">
                    <Check className="size-2.5" aria-hidden />
                    {vd(locale, "Đã chọn", "Gewählt")}
                  </span>
                ) : (
                  <span className="text-ink-3 ml-auto flex items-center gap-1 text-[0.6rem]">
                    <Copy className="size-2.5" aria-hidden />
                    {vd(locale, "Dùng bản này", "Diese nehmen")}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Screen>
  );
}

/* ══ CONTENT CALENDAR ═══════════════════════════════════════ */

const CAL_POSTS: Record<number, { vi: string; de: string; tone: string }> = {
  4: { vi: "Phở bò đặc biệt", de: "Phở bò spezial", tone: "bg-brand-tint text-brand-ink" },
  6: { vi: "Combo trưa 9,90 €", de: "Mittagsmenü 9,90 €", tone: "bg-violet-tint text-violet-ink" },
  9: { vi: "Bún bò Huế", de: "Bún bò Huế", tone: "bg-brand-tint text-brand-ink" },
  12: { vi: "Story: bếp 5h sáng", de: "Story: Küche 5 Uhr", tone: "bg-sky-tint text-sky-ink" },
  14: { vi: "Gỏi cuốn — món mới", de: "Sommerrollen — neu", tone: "bg-amber-tint text-amber-ink" },
  17: { vi: "Nhắc đặt bàn cuối tuần", de: "Wochenende reservieren", tone: "bg-violet-tint text-violet-ink" },
  20: { vi: "Cà phê sữa đá", de: "Eiskaffee vietnamesisch", tone: "bg-brand-tint text-brand-ink" },
  23: { vi: "Google: giờ mở cửa lễ", de: "Google: Feiertags-Zeiten", tone: "bg-sky-tint text-sky-ink" },
  25: { vi: "Đánh giá 5 sao của khách", de: "5-Sterne-Bewertung", tone: "bg-mint-tint text-mint-ink" },
};

function CalendarScreen({ locale }: { locale: Locale }) {
  const dayNames = vd(
    locale,
    ["H", "B", "T", "N", "S", "B", "C"],
    ["M", "D", "M", "D", "F", "S", "S"],
  );

  return (
    <Screen>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-ink text-[0.78rem] font-bold">
          {vd(locale, "Tháng 8 · 2026", "August 2026")}
        </p>
        <div className="flex flex-wrap gap-1.5">
          <Chip tone="bg-mint-tint text-mint-ink">{vd(locale, "Đã duyệt 12", "Freigegeben 12")}</Chip>
          <Chip tone="bg-amber-tint text-amber-ink">{vd(locale, "Chờ duyệt 3", "Wartet 3")}</Chip>
          <Chip tone="bg-sky-tint text-sky-ink">{vd(locale, "Đã lên lịch 3", "Geplant 3")}</Chip>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {dayNames.map((d, i) => (
          <p key={i} className="text-ink-3 pb-1 text-center text-[0.55rem] font-bold">
            {d}
          </p>
        ))}
        {Array.from({ length: 28 }).map((_, i) => {
          const day = i + 1;
          const post = CAL_POSTS[day];
          return (
            <div
              key={day}
              className={cn(
                "min-h-[3.1rem] rounded-md p-1",
                post ? "bg-paper-3" : "border-line border border-dashed",
              )}
            >
              <p className="text-ink-3 text-[0.5rem] font-bold tabular-nums">{day}</p>
              {post ? (
                <p
                  className={cn(
                    "mt-0.5 line-clamp-2 rounded px-1 py-0.5 text-[0.5rem] leading-tight font-semibold",
                    post.tone,
                  )}
                >
                  {vd(locale, post.vi, post.de)}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      <p className="text-ink-3 mt-3 text-[0.62rem]">
        {vd(
          locale,
          "Kéo một ô sang ngày khác — lịch đăng trên Instagram, Facebook và Google tự cập nhật theo.",
          "Kachel auf einen anderen Tag ziehen — Instagram, Facebook und Google aktualisieren sich automatisch.",
        )}
      </p>
    </Screen>
  );
}

/* ══ CUSTOMER INBOX ═════════════════════════════════════════ */

function InboxScreen({ locale }: { locale: Locale }) {
  const threads = [
    { name: "Anna Weber", ch: "Instagram", unread: 2, on: true, last: vd(locale, "Tối thứ Bảy còn bàn cho 4 người không ạ?", "Sind Samstagabend noch 4 Plätze frei?") },
    { name: "Trần Minh", ch: "WhatsApp", unread: 1, on: false, last: vd(locale, "Cho mình hỏi giá đặt tiệc 20 người", "Preis für eine Feier mit 20 Personen?") },
    { name: "M. Schneider", ch: "Facebook", unread: 0, on: false, last: vd(locale, "Danke für das leckere Essen!", "Danke für das leckere Essen!") },
  ];

  return (
    <Screen>
      <div className="grid gap-3 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        {/* Danh sách hội thoại */}
        <div className="space-y-1.5">
          <p className="text-ink mb-2 text-[0.72rem] font-bold">
            {vd(locale, "Hộp thư chung", "Gemeinsames Postfach")}
          </p>
          {threads.map((th) => (
            <div
              key={th.name}
              className={cn("flex items-start gap-2 rounded-lg p-2", th.on ? "bg-brand-tint" : "bg-paper-3")}
            >
              <span className="bg-sky-tint text-sky-ink grid size-6 shrink-0 place-items-center rounded-full text-[0.55rem] font-bold">
                {th.name.slice(0, 1)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="text-ink truncate text-[0.66rem] font-bold">{th.name}</span>
                  <span className="text-ink-3 shrink-0 text-[0.55rem]">{th.ch}</span>
                </span>
                <span className="text-ink-2 mt-0.5 line-clamp-1 block text-[0.6rem]">{th.last}</span>
              </span>
              {th.unread > 0 ? (
                <span className="bg-brand shrink-0 rounded-full px-1 text-[0.52rem] font-bold text-white tabular-nums">
                  {th.unread}
                </span>
              ) : null}
            </div>
          ))}
        </div>

        {/* Hội thoại đang mở + bản nháp AI */}
        <div className="bg-paper-3 flex flex-col rounded-xl p-3">
          <div className="mb-2 flex items-center gap-1.5">
            <MessageCircle className="text-magenta size-3" aria-hidden />
            <p className="text-ink text-[0.68rem] font-bold">Anna Weber</p>
            <span className="text-ink-3 ml-auto flex items-center gap-1 text-[0.55rem]">
              <Clock className="size-2.5" aria-hidden />
              22:14
            </span>
          </div>

          <div className="bg-paper-2 self-start rounded-lg rounded-bl-sm px-2.5 py-1.5 text-[0.66rem]">
            {vd(locale, "Tối thứ Bảy còn bàn cho 4 người không ạ?", "Sind Samstagabend noch 4 Plätze frei?")}
          </div>

          {/* Bản nháp AI — điểm khác biệt so với một hộp thư thường */}
          <div className="border-brand/40 bg-brand-tint mt-2.5 rounded-lg border border-dashed p-2.5">
            <p className="text-brand-ink flex items-center gap-1 text-[0.55rem] font-bold tracking-wide uppercase">
              <Sparkles className="size-2.5" aria-hidden />
              {vd(locale, "AI soạn sẵn · tiếng Đức", "KI-Entwurf · Deutsch")}
            </p>
            <p className="text-ink mt-1.5 text-[0.66rem] leading-relaxed">
              {vd(
                locale,
                "Hallo Anna, ja — Samstag 19:30 Uhr haben wir noch einen Tisch für 4 Personen. Soll ich ihn für Sie reservieren?",
                "Hallo Anna, ja — Samstag 19:30 Uhr haben wir noch einen Tisch für 4 Personen. Soll ich ihn für Sie reservieren?",
              )}
            </p>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="bg-brand flex items-center gap-1 rounded px-2 py-1 text-[0.58rem] font-bold text-white">
                <Send className="size-2.5" aria-hidden />
                {vd(locale, "Gửi", "Senden")}
              </span>
              <span className="text-ink-3 text-[0.58rem]">{vd(locale, "Sửa lại", "Bearbeiten")}</span>
            </div>
          </div>
        </div>
      </div>
    </Screen>
  );
}

/* ══ REVIEW CENTER ══════════════════════════════════════════ */

function ReviewsScreen({ locale }: { locale: Locale }) {
  const dist = [
    { star: 5, pct: 78 },
    { star: 4, pct: 14 },
    { star: 3, pct: 4 },
    { star: 2, pct: 3 },
    { star: 1, pct: 1 },
  ];

  return (
    <Screen>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
        <div>
          <div className="bg-paper-3 rounded-xl p-3 text-center">
            <p className="text-ink text-3xl font-extrabold">4,8</p>
            <div className="mt-1 flex justify-center gap-0.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="fill-amber text-amber size-2.5" aria-hidden />
              ))}
            </div>
            <p className="text-ink-3 mt-1 text-[0.58rem]">
              {vd(locale, "218 đánh giá Google", "218 Google-Bewertungen")}
            </p>
          </div>

          <div className="mt-3 space-y-1">
            {dist.map((row) => (
              <div key={row.star} className="flex items-center gap-1.5">
                <span className="text-ink-3 w-2 text-[0.55rem] tabular-nums">{row.star}</span>
                <span className="bg-line h-1.5 flex-1 overflow-hidden rounded-full">
                  <span className="bg-amber block h-full rounded-full" style={{ width: `${row.pct}%` }} />
                </span>
                <span className="text-ink-3 w-6 text-right text-[0.52rem] tabular-nums">{row.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {/* Bài tiêu cực đẩy lên đầu — đúng thứ tự cần xử lý */}
          <div className="border-magenta/30 bg-magenta-tint/40 rounded-xl border p-2.5">
            <div className="flex items-center gap-1.5">
              {[0, 1].map((i) => (
                <Star key={i} className="fill-amber text-amber size-2.5" aria-hidden />
              ))}
              {[0, 1, 2].map((i) => (
                <Star key={`o${i}`} className="text-line-strong size-2.5" aria-hidden />
              ))}
              <span className="text-magenta-ink bg-magenta-tint ml-1 rounded px-1.5 py-0.5 text-[0.52rem] font-bold">
                {vd(locale, "Tiêu cực · chưa trả lời", "Negativ · unbeantwortet")}
              </span>
              <span className="text-ink-3 ml-auto text-[0.52rem]">Kevin B.</span>
            </div>
            <p className="text-ink-2 mt-1.5 text-[0.64rem] leading-relaxed">
              „Zu laut und der Service war überfordert.“
            </p>
            <div className="border-magenta/25 mt-2 rounded-lg border border-dashed bg-white/40 p-2">
              <p className="text-magenta-ink flex items-center gap-1 text-[0.52rem] font-bold uppercase">
                <Sparkles className="size-2.5" aria-hidden />
                {vd(locale, "Câu trả lời soạn sẵn", "Antwortentwurf")}
              </p>
              <p className="text-ink mt-1 text-[0.62rem] leading-relaxed">
                „Lieber Kevin, danke für das ehrliche Feedback. Freitagabend war es zu voll — wir haben
                seitdem eine zusätzliche Servicekraft eingeplant. Wir würden uns freuen, Sie erneut zu
                begrüßen.“
              </p>
            </div>
          </div>

          <div className="bg-paper-3 rounded-xl p-2.5">
            <div className="flex items-center gap-1.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="fill-amber text-amber size-2.5" aria-hidden />
              ))}
              <span className="text-mint-ink bg-mint-tint ml-1 rounded px-1.5 py-0.5 text-[0.52rem] font-bold">
                {vd(locale, "Đã trả lời", "Beantwortet")}
              </span>
              <span className="text-ink-3 ml-auto text-[0.52rem]">Anna Weber</span>
            </div>
            <p className="text-ink-2 mt-1.5 text-[0.64rem] leading-relaxed">
              {vd(
                locale,
                "„Phở ngon nhất Berlin, phục vụ nhanh và thân thiện.“",
                "„Bester Phở in Berlin, schneller und freundlicher Service.“",
              )}
            </p>
          </div>
        </div>
      </div>
    </Screen>
  );
}

/* ══ CAMPAIGN PERFORMANCE ═══════════════════════════════════ */

function CampaignScreen({ locale }: { locale: Locale }) {
  const rows = [
    { name: vd(locale, "Combo trưa mùa hè", "Sommer-Mittagsmenü"), reach: "18.400", leads: "63", book: "119", cost: "2,40 €", pct: 92, tone: "bg-brand" },
    { name: vd(locale, "Khai trương sân vườn", "Eröffnung Gartenterrasse"), reach: "11.200", leads: "38", book: "64", cost: "3,10 €", pct: 67, tone: "bg-violet" },
    { name: vd(locale, "Nhắc khách cũ quay lại", "Stammgäste zurückholen"), reach: "4.850", leads: "21", book: "44", cost: "1,20 €", pct: 44, tone: "bg-mint" },
  ];

  return (
    <Screen>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-ink text-[0.78rem] font-bold">
          {vd(locale, "Chiến dịch đang chạy", "Aktive Kampagnen")}
        </p>
        <Chip tone="bg-mint-tint text-mint-ink">{vd(locale, "30 ngày qua", "Letzte 30 Tage")}</Chip>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[30rem] border-collapse text-[0.64rem]">
          <thead>
            <tr className="text-ink-3 text-left text-[0.55rem] uppercase">
              <th className="pb-2 font-bold">{vd(locale, "Chiến dịch", "Kampagne")}</th>
              <th className="pb-2 text-right font-bold">{vd(locale, "Tiếp cận", "Reichweite")}</th>
              <th className="pb-2 text-right font-bold">Lead</th>
              <th className="pb-2 text-right font-bold">{vd(locale, "Đặt bàn", "Reservierung")}</th>
              <th className="pb-2 text-right font-bold">{vd(locale, "Chi phí/bàn", "Kosten/Res.")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name} className="border-line border-t">
                <td className="py-2 pr-3">
                  <span className="text-ink block font-semibold">{row.name}</span>
                  <span className="bg-line mt-1 block h-1 overflow-hidden rounded-full">
                    <span className={cn("block h-full rounded-full", row.tone)} style={{ width: `${row.pct}%` }} />
                  </span>
                </td>
                <td className="text-ink-2 py-2 text-right tabular-nums">{row.reach}</td>
                <td className="text-ink-2 py-2 text-right tabular-nums">{row.leads}</td>
                <td className="text-ink py-2 text-right font-bold tabular-nums">{row.book}</td>
                <td className="text-mint-ink py-2 text-right font-bold tabular-nums">{row.cost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-ink-3 mt-3 text-[0.62rem]">
        {vd(
          locale,
          "Cột cuối là số quan trọng nhất: mỗi lượt đặt bàn tốn bao nhiêu tiền quảng cáo.",
          "Die letzte Spalte zählt: was jede Reservierung an Werbebudget kostet.",
        )}
      </p>
    </Screen>
  );
}

/* ══ LEAD PIPELINE ══════════════════════════════════════════ */

function LeadsScreen({ locale }: { locale: Locale }) {
  const columns = [
    {
      title: vd(locale, "Khách mới", "Neu"),
      tone: "bg-sky",
      cards: [
        { name: "Sabine Krüger", need: vd(locale, "Sinh nhật 20 khách", "Geburtstag, 20 Gäste"), val: "680 €", due: vd(locale, "Gọi hôm nay", "Heute anrufen"), urgent: true },
      ],
    },
    {
      title: vd(locale, "Đã liên hệ", "Kontaktiert"),
      tone: "bg-violet",
      cards: [
        { name: "Vinaco GmbH", need: vd(locale, "Cơm trưa văn phòng", "Büro-Mittagessen"), val: "1.450 €", due: vd(locale, "Còn 3 ngày", "In 3 Tagen"), urgent: false },
      ],
    },
    {
      title: vd(locale, "Đã hẹn", "Termin"),
      tone: "bg-amber",
      cards: [
        { name: "Thomas Bauer", need: vd(locale, "Tiệc công ty 45 khách", "Firmenfeier, 45 Gäste"), val: "2.200 €", due: "12.08 · 15:00", urgent: false },
      ],
    },
    {
      title: vd(locale, "Chốt đơn", "Gewonnen"),
      tone: "bg-mint",
      cards: [
        { name: "Familie Nguyễn", need: vd(locale, "Tiệc cưới 80 khách", "Hochzeit, 80 Gäste"), val: "4.900 €", due: vd(locale, "Đã cọc", "Angezahlt"), urgent: false },
      ],
    },
  ];

  return (
    <Screen>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-ink text-[0.78rem] font-bold">
          {vd(locale, "Đơn đặt tiệc", "Event-Anfragen")}
        </p>
        <Chip tone="bg-brand-tint text-brand-ink">
          {vd(locale, "Tổng dự kiến 12.400 €", "Erwartet 12.400 €")}
        </Chip>
      </div>

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {columns.map((col) => (
          <div key={col.title} className="bg-paper-3 rounded-lg p-2">
            <div className="mb-2 flex items-center gap-1.5">
              <span className={cn("size-1.5 rounded-full", col.tone)} aria-hidden />
              <p className="text-ink text-[0.6rem] font-bold">{col.title}</p>
            </div>
            {col.cards.map((card) => (
              <div key={card.name} className="bg-paper-2 border-line rounded-md border p-2">
                <p className="text-ink truncate text-[0.62rem] font-bold">{card.name}</p>
                <p className="text-ink-2 mt-0.5 line-clamp-2 text-[0.56rem] leading-tight">{card.need}</p>
                <div className="mt-1.5 flex items-center justify-between gap-1">
                  <span className="text-ink text-[0.6rem] font-extrabold tabular-nums">{card.val}</span>
                  <span
                    className={cn(
                      "rounded px-1 py-0.5 text-[0.5rem] font-bold",
                      card.urgent ? "bg-magenta-tint text-magenta-ink" : "text-ink-3 bg-paper-3",
                    )}
                  >
                    {card.due}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <p className="text-ink-3 mt-3 flex items-center gap-1.5 text-[0.62rem]">
        <Hash className="size-2.5" aria-hidden />
        {vd(
          locale,
          "Quá ngày phải liên hệ lại là thẻ chuyển đỏ và hệ thống nhắc người phụ trách.",
          "Nach der Wiedervorlage wird die Karte rot und das System erinnert die zuständige Person.",
        )}
      </p>
    </Screen>
  );
}

/* ── khung chung ─────────────────────────────────────────── */

function Screen({ children }: { children: React.ReactNode }) {
  return <div className="bg-paper-2 rounded-2xl p-4 sm:p-5">{children}</div>;
}

function Chip({ children, tone }: { children: React.ReactNode; tone: string }) {
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[0.58rem] font-bold", tone)}>{children}</span>
  );
}
