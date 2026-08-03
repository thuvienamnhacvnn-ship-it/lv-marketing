import { Photo } from "@/components/brand/photo";
import { SHAPE_RATIO, type MarketingTemplate } from "@/data/templates";
import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n/config";

/**
 * Template marketing dựng bằng ảnh thật + lớp chữ thương hiệu.
 *
 * Mọi kích thước chữ dùng đơn vị `cqw` (phần trăm bề rộng container) nên template
 * sắc nét và cân đối ở cả ô thumbnail lẫn khung xem lớn — không cần ảnh nhiều cỡ.
 */
export function TemplateCard({
  template,
  locale,
  className,
}: {
  template: MarketingTemplate;
  locale: Locale;
  className?: string;
}) {
  const ratio = SHAPE_RATIO[template.shape];

  return (
    <div
      className={cn("bg-paper-2 relative overflow-hidden", className)}
      style={{ containerType: "inline-size", aspectRatio: String(ratio) }}
      aria-hidden
    >
      {renderLayout(template, locale)}
    </div>
  );
}

/* ── mảnh dùng lại ───────────────────────────────────────── */

const TONE_BG: Record<MarketingTemplate["tone"], string> = {
  brand: "var(--brand)",
  violet: "var(--violet)",
  magenta: "var(--magenta)",
  amber: "var(--amber)",
  sky: "var(--sky)",
  ink: "var(--ink)",
};

const TONE_INK: Record<MarketingTemplate["tone"], string> = {
  brand: "var(--brand-ink)",
  violet: "var(--violet-ink)",
  magenta: "var(--magenta-ink)",
  amber: "var(--amber-ink)",
  sky: "var(--sky-ink)",
  ink: "var(--ink)",
};

function Wordmark({ light = false, size = 3.2 }: { light?: boolean; size?: number }) {
  return (
    <div style={{ lineHeight: 1 }}>
      <p
        style={{
          fontSize: `${size}cqw`,
          fontWeight: 800,
          letterSpacing: "0.02em",
          color: light ? "rgba(255,255,255,0.95)" : "var(--ink)",
        }}
      >
        LV GROUP
      </p>
      <p
        style={{
          fontSize: `${size * 0.44}cqw`,
          fontWeight: 700,
          letterSpacing: "0.28em",
          marginTop: `${size * 0.28}cqw`,
          color: light ? "rgba(255,255,255,0.6)" : "var(--brand-ink)",
        }}
      >
        MARKETING HUB
      </p>
    </div>
  );
}

function Pill({
  children,
  bg,
  fg = "#fff",
  size = 3,
}: {
  children: React.ReactNode;
  bg: string;
  fg?: string;
  size?: number;
}) {
  return (
    <span
      style={{
        display: "inline-block",
        background: bg,
        color: fg,
        borderRadius: "99em",
        padding: `${size * 0.42}cqw ${size * 1.05}cqw`,
        fontSize: `${size}cqw`,
        fontWeight: 700,
        lineHeight: 1.1,
      }}
    >
      {children}
    </span>
  );
}

/** Ô vuông giả QR — mẫu cố định nên lần render nào cũng giống nhau. */
function FakeQr({ size = 18, dark = "var(--ink)" }: { size?: number; dark?: string }) {
  const cells = 13;
  return (
    <span
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cells}, 1fr)`,
        width: `${size}cqw`,
        aspectRatio: "1",
        background: "#fff",
        padding: `${size * 0.06}cqw`,
        borderRadius: `${size * 0.08}cqw`,
        gap: 0,
      }}
    >
      {Array.from({ length: cells * cells }).map((_, i) => {
        const r = Math.floor(i / cells);
        const c = i % cells;
        const finder =
          (r < 4 && c < 4) || (r < 4 && c > cells - 5) || (r > cells - 5 && c < 4);
        const on = finder
          ? r === 0 || r === 3 || c === 0 || c === 3 || (r === 1 && c === 1)
          : (r * 31 + c * 17 + ((r * c) % 5)) % 3 === 0;
        return <span key={i} style={{ background: on ? dark : "transparent" }} />;
      })}
    </span>
  );
}

function Stars({ color = "var(--amber)", size = 5 }: { color?: string; size?: number }) {
  return (
    <span style={{ display: "flex", gap: `${size * 0.22}cqw`, fontSize: `${size}cqw`, color }}>
      {"★★★★★"}
    </span>
  );
}

/* ── bố cục ──────────────────────────────────────────────── */

function renderLayout(t: MarketingTemplate, locale: Locale) {
  const c = {
    eyebrow: t.copy.eyebrow[locale],
    headline: t.copy.headline[locale],
    sub: t.copy.sub[locale],
    badge: t.copy.badge[locale],
  };
  const tone = TONE_BG[t.tone];
  const toneInk = TONE_INK[t.tone];

  const photo = (extra?: string) => (
    <Photo
      name={t.photo}
      locale={locale}
      width={900}
      height={900}
      sourceWidth={900}
      className={cn("h-full w-full", extra)}
    />
  );

  switch (t.layout) {
    /* Bài đăng vuông: ảnh full, khối chữ đáy */
    case "post":
      return (
        <>
          <div className="absolute inset-0">{photo()}</div>
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(20,23,26,0.32) 0%, transparent 34%, rgba(20,23,26,0.86) 100%)",
            }}
          />
          <div className="absolute inset-0 flex flex-col justify-between" style={{ padding: "6cqw" }}>
            <Wordmark light />
            <div>
              <p style={{ fontSize: "2.6cqw", fontWeight: 800, letterSpacing: "0.22em", color: tone === "var(--ink)" ? "#fff" : tone }}>
                {c.eyebrow}
              </p>
              <p style={{ fontSize: "8.6cqw", fontWeight: 800, color: "#fff", lineHeight: 1.05, marginTop: "2cqw" }}>
                {c.headline}
              </p>
              <p style={{ fontSize: "3.2cqw", color: "rgba(255,255,255,0.78)", marginTop: "1.8cqw" }}>
                {c.sub}
              </p>
              <div style={{ marginTop: "4cqw" }}>
                <Pill bg={tone} size={2.9}>
                  {c.badge}
                </Pill>
              </div>
            </div>
          </div>
        </>
      );

    /* Story dọc: ảnh trên, khối màu dưới */
    case "story":
      return (
        <>
          <div className="absolute inset-x-0 top-0" style={{ height: "58%" }}>
            {photo()}
            <span
              className="absolute inset-0"
              style={{ background: "linear-gradient(180deg, rgba(20,23,26,0.3) 0%, transparent 55%)" }}
            />
            <div className="absolute" style={{ top: "6cqw", left: "6cqw" }}>
              <Wordmark light size={4} />
            </div>
          </div>
          <div
            className="absolute inset-x-0 bottom-0 flex flex-col justify-center"
            style={{ height: "44%", background: tone, padding: "7cqw" }}
          >
            <p style={{ fontSize: "3.4cqw", fontWeight: 800, letterSpacing: "0.22em", color: "rgba(255,255,255,0.85)" }}>
              {c.eyebrow}
            </p>
            <p style={{ fontSize: "20cqw", fontWeight: 800, color: "#fff", lineHeight: 1 }}>{c.headline}</p>
            <p style={{ fontSize: "3.6cqw", color: "rgba(255,255,255,0.9)", marginTop: "2cqw" }}>{c.sub}</p>
            <div style={{ marginTop: "4cqw" }}>
              <Pill bg="#fff" fg={toneInk} size={3.2}>
                {c.badge}
              </Pill>
            </div>
          </div>
        </>
      );

    /* Trước / sau: hai ảnh chia đôi theo chiều dọc */
    case "beforeAfter":
      return (
        <>
          <div className="absolute inset-x-0 top-0 grid grid-cols-2" style={{ height: "62%" }}>
            <div className="relative h-full">
              {photo()}
              <span className="absolute" style={{ top: "4cqw", left: "4cqw" }}>
                <Pill bg="rgba(20,23,26,0.6)" size={2.6}>
                  VORHER
                </Pill>
              </span>
            </div>
            <div className="relative h-full">
              <Photo
                name={t.photoAlt ?? t.photo}
                locale={locale}
                width={700}
                height={900}
                sourceWidth={700}
                className="h-full w-full"
              />
              <span className="absolute" style={{ top: "4cqw", right: "4cqw" }}>
                <Pill bg={tone} size={2.6}>
                  NACHHER
                </Pill>
              </span>
            </div>
          </div>
          <div
            className="absolute inset-x-0 bottom-0 flex flex-col justify-center"
            style={{ height: "40%", padding: "7cqw", background: "var(--paper-2)" }}
          >
            <Wordmark size={3.6} />
            <p style={{ fontSize: "7cqw", fontWeight: 800, color: "var(--ink)", lineHeight: 1.08, marginTop: "3cqw" }}>
              {c.headline}
            </p>
            <p style={{ fontSize: "3.2cqw", color: "var(--ink-3)", marginTop: "2cqw" }}>{c.sub}</p>
            <div style={{ marginTop: "3.5cqw" }}>
              <Pill bg={tone} size={3}>
                {c.badge}
              </Pill>
            </div>
          </div>
        </>
      );

    /* Menu / bảng giá: ảnh dải trên, danh sách dòng bên dưới */
    case "menu":
    case "priceList": {
      const rows =
        t.layout === "menu"
          ? [
              ["Sommerrollen", "6,90"],
              ["Phở bò", "13,50"],
              ["Bún chả Hà Nội", "14,90"],
              ["Cà ri gà", "14,50"],
              ["Gebratener Tofu", "12,90"],
              ["Chè ba màu", "5,50"],
            ]
          : [
              ["Maniküre klassisch", "29,00"],
              ["Gel-Modellage Neuset", "59,00"],
              ["Auffüllen Gel", "45,00"],
              ["Pediküre Spa", "39,00"],
              ["Nail Art je Nagel", "3,50"],
              ["Handmassage", "15,00"],
            ];
      return (
        <div className="absolute inset-0 flex flex-col" style={{ background: "var(--paper-2)" }}>
          <div className="relative" style={{ height: "26%" }}>
            {photo()}
            <span className="absolute inset-0" style={{ background: "rgba(20,23,26,0.35)" }} />
            <div className="absolute inset-0 flex flex-col justify-center" style={{ padding: "6cqw" }}>
              <Wordmark light size={3.6} />
            </div>
          </div>
          <div className="flex-1" style={{ padding: "6cqw" }}>
            <p style={{ fontSize: "2.4cqw", fontWeight: 800, letterSpacing: "0.2em", color: toneInk }}>
              {c.eyebrow}
            </p>
            <p style={{ fontSize: "9cqw", fontWeight: 800, color: "var(--ink)", lineHeight: 1, marginTop: "1.5cqw" }}>
              {c.headline}
            </p>
            <span
              style={{
                display: "block",
                height: "0.6cqw",
                width: "16cqw",
                background: tone,
                borderRadius: "99em",
                margin: "3cqw 0 4cqw",
              }}
            />
            <ul style={{ display: "flex", flexDirection: "column", gap: "2.6cqw" }}>
              {rows.map(([name, price]) => (
                <li key={name} style={{ display: "flex", alignItems: "baseline", gap: "2cqw" }}>
                  <span style={{ fontSize: "3.4cqw", fontWeight: 600, color: "var(--ink)" }}>{name}</span>
                  <span style={{ flex: 1, borderBottom: "0.18cqw dotted var(--line-strong)" }} />
                  <span style={{ fontSize: "3.4cqw", fontWeight: 800, color: toneInk }}>{price} €</span>
                </li>
              ))}
            </ul>
            <p style={{ fontSize: "2.2cqw", color: "var(--ink-3)", marginTop: "4cqw" }}>{c.sub}</p>
            <p style={{ fontSize: "2.6cqw", fontWeight: 700, color: "var(--ink)", marginTop: "1cqw" }}>
              {c.badge}
            </p>
          </div>
        </div>
      );
    }

    /* Voucher: ảnh trái, thông tin phải, có QR */
    case "voucher":
      return (
        <div className="absolute inset-0 grid" style={{ gridTemplateColumns: "38% 62%" }}>
          <div className="relative h-full">{photo()}</div>
          <div className="flex flex-col justify-center" style={{ padding: "5cqw", background: "var(--paper-2)" }}>
            <Wordmark size={2.8} />
            <p style={{ fontSize: "2.2cqw", fontWeight: 800, letterSpacing: "0.24em", color: toneInk, marginTop: "3cqw" }}>
              {c.eyebrow}
            </p>
            <p style={{ fontSize: "13cqw", fontWeight: 800, color: tone, lineHeight: 1 }}>{c.headline}</p>
            <p style={{ fontSize: "2.6cqw", color: "var(--ink-2)", marginTop: "1.5cqw" }}>{c.sub}</p>
            <div style={{ display: "flex", alignItems: "center", gap: "3cqw", marginTop: "3.5cqw" }}>
              <FakeQr size={13} />
              <span style={{ fontSize: "2.4cqw", fontWeight: 700, color: "var(--ink-3)", letterSpacing: "0.1em" }}>
                {c.badge}
              </span>
            </div>
          </div>
        </div>
      );

    /* Thẻ thành viên: ảnh nền tối + số điểm */
    case "loyaltyCard":
      return (
        <>
          <div className="absolute inset-0">{photo()}</div>
          <span className="absolute inset-0" style={{ background: "rgba(20,23,26,0.82)" }} />
          <div className="absolute inset-0 flex flex-col justify-between" style={{ padding: "5.5cqw" }}>
            <div className="flex items-start justify-between">
              <Wordmark light size={3} />
              <Pill bg="var(--brand)" size={2.2}>
                {c.eyebrow}
              </Pill>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p style={{ fontSize: "11cqw", fontWeight: 800, color: "#fff", lineHeight: 1 }}>{c.headline}</p>
                <p style={{ fontSize: "2.4cqw", color: "rgba(255,255,255,0.6)", marginTop: "1.2cqw" }}>{c.sub}</p>
                <p style={{ fontSize: "3cqw", fontWeight: 700, color: "rgba(255,255,255,0.9)", letterSpacing: "0.16em", marginTop: "2.5cqw" }}>
                  {c.badge}
                </p>
              </div>
              <FakeQr size={16} />
            </div>
          </div>
        </>
      );

    /* Thẻ mời đánh giá: nền sáng, sao + QR + ảnh tròn */
    case "reviewCard":
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center" style={{ padding: "8cqw", background: "var(--paper-2)" }}>
          <div
            className="overflow-hidden rounded-full"
            style={{ width: "22cqw", aspectRatio: "1", boxShadow: "0 6cqw 12cqw -6cqw rgba(20,23,26,0.35)" }}
          >
            {photo()}
          </div>
          <p style={{ fontSize: "2.6cqw", fontWeight: 800, letterSpacing: "0.22em", color: toneInk, marginTop: "4cqw" }}>
            {c.eyebrow}
          </p>
          <p style={{ fontSize: "7cqw", fontWeight: 800, color: "var(--ink)", lineHeight: 1.1, marginTop: "1.5cqw" }}>
            {c.headline}
          </p>
          <div style={{ marginTop: "2.5cqw" }}>
            <Stars size={6} />
          </div>
          <div style={{ marginTop: "3.5cqw" }}>
            <FakeQr size={22} />
          </div>
          <p style={{ fontSize: "2.6cqw", fontWeight: 700, color: "var(--ink-2)", marginTop: "3cqw" }}>{c.sub}</p>
        </div>
      );

    /* Landing page: khung trình duyệt + hero */
    case "landing":
      return (
        <div className="absolute inset-0 flex flex-col" style={{ background: "var(--paper-2)" }}>
          <div
            className="flex shrink-0 items-center"
            style={{ gap: "1cqw", padding: "1.4cqw 2cqw", background: "var(--paper-3)" }}
          >
            <span style={{ width: "1cqw", height: "1cqw", borderRadius: "99em", background: "var(--bad)" }} />
            <span style={{ width: "1cqw", height: "1cqw", borderRadius: "99em", background: "var(--amber)" }} />
            <span style={{ width: "1cqw", height: "1cqw", borderRadius: "99em", background: "var(--line-strong)" }} />
            <span
              style={{
                marginLeft: "1.5cqw",
                fontSize: "1.4cqw",
                color: "var(--ink-3)",
                background: "#fff",
                borderRadius: "99em",
                padding: "0.5cqw 2cqw",
              }}
            >
              {c.eyebrow}
            </span>
          </div>
          <div className="relative grid flex-1" style={{ gridTemplateColumns: "52% 48%" }}>
            <div className="flex flex-col justify-center" style={{ padding: "4.5cqw" }}>
              <Wordmark size={2.4} />
              <p style={{ fontSize: "5.6cqw", fontWeight: 800, color: "var(--ink)", lineHeight: 1.06, marginTop: "3cqw" }}>
                {c.headline}
              </p>
              <p style={{ fontSize: "2cqw", color: "var(--ink-2)", marginTop: "2cqw" }}>{c.sub}</p>
              <div style={{ marginTop: "3cqw" }}>
                <Pill bg={tone} size={1.9}>
                  {c.badge}
                </Pill>
              </div>
            </div>
            <div className="relative h-full">{photo()}</div>
          </div>
        </div>
      );

    /* Biển hiệu: ảnh tối + chữ lớn */
    case "signage":
      return (
        <>
          <div className="absolute inset-0">{photo()}</div>
          <span className="absolute inset-0" style={{ background: "rgba(20,23,26,0.72)" }} />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center" style={{ padding: "4cqw" }}>
            <p style={{ fontSize: "9cqw", fontWeight: 800, letterSpacing: "0.14em", color: "var(--brand)", lineHeight: 1 }}>
              {c.headline}
            </p>
            <p style={{ fontSize: "2.6cqw", fontWeight: 700, letterSpacing: "0.34em", color: "#fff", marginTop: "2cqw" }}>
              {c.sub}
            </p>
            <span
              style={{ display: "block", height: "0.35cqw", width: "26cqw", background: "var(--brand)", margin: "3cqw 0" }}
            />
            <p style={{ fontSize: "1.9cqw", color: "rgba(255,255,255,0.65)", letterSpacing: "0.16em" }}>{c.badge}</p>
          </div>
        </>
      );

    /* Ảnh bìa ngang */
    case "cover":
      return (
        <>
          <div className="absolute inset-0">{photo()}</div>
          <span
            className="absolute inset-0"
            style={{ background: "linear-gradient(90deg, rgba(20,23,26,0.88) 0%, rgba(20,23,26,0.35) 62%, transparent 100%)" }}
          />
          <div className="absolute inset-0 flex flex-col justify-center" style={{ padding: "4.5cqw" }}>
            <Wordmark light size={2.4} />
            <p style={{ fontSize: "2cqw", fontWeight: 800, letterSpacing: "0.2em", color: "var(--brand)", marginTop: "2.5cqw" }}>
              {c.eyebrow}
            </p>
            <p style={{ fontSize: "5.4cqw", fontWeight: 800, color: "#fff", lineHeight: 1.05, marginTop: "1cqw" }}>
              {c.headline}
            </p>
            <p style={{ fontSize: "1.9cqw", color: "rgba(255,255,255,0.72)", marginTop: "1.5cqw" }}>{c.sub}</p>
          </div>
        </>
      );

    /* Danh thiếp */
    case "businessCard":
      return (
        <div className="absolute inset-0 grid" style={{ gridTemplateColumns: "62% 38%", background: "var(--paper-2)" }}>
          <div className="flex flex-col justify-between" style={{ padding: "5.5cqw" }}>
            <Wordmark size={3.2} />
            <div>
              <p style={{ fontSize: "5.6cqw", fontWeight: 800, color: "var(--ink)", lineHeight: 1.1 }}>
                {c.headline}
              </p>
              <p style={{ fontSize: "2.1cqw", fontWeight: 700, letterSpacing: "0.14em", color: "var(--brand-ink)", marginTop: "1.5cqw" }}>
                {c.eyebrow}
              </p>
              <p style={{ fontSize: "2.6cqw", fontWeight: 700, color: "var(--ink)", marginTop: "2.5cqw" }}>
                {c.badge}
              </p>
              <p style={{ fontSize: "2.2cqw", color: "var(--ink-3)", marginTop: "0.6cqw" }}>{c.sub}</p>
            </div>
          </div>
          <div className="relative h-full">
            {photo()}
            <span className="absolute inset-0" style={{ background: "rgba(20,23,26,0.25)" }} />
          </div>
        </div>
      );

    /* Google Business post */
    case "googlePost":
      return (
        <div className="absolute inset-0 grid" style={{ gridTemplateColumns: "54% 46%", background: "var(--paper-2)" }}>
          <div className="flex flex-col justify-center" style={{ padding: "6cqw" }}>
            <p style={{ fontSize: "2.2cqw", fontWeight: 800, letterSpacing: "0.18em", color: toneInk }}>
              {c.eyebrow}
            </p>
            <p style={{ fontSize: "6.4cqw", fontWeight: 800, color: "var(--ink)", lineHeight: 1.08, marginTop: "2cqw" }}>
              {c.headline}
            </p>
            <p style={{ fontSize: "2.4cqw", color: "var(--ink-2)", marginTop: "2cqw" }}>{c.sub}</p>
            <ul style={{ marginTop: "3cqw", display: "flex", flexDirection: "column", gap: "1.4cqw" }}>
              {[
                ["Mo – Fr", "11:00 – 22:00"],
                ["Sa", "12:00 – 23:00"],
                ["So", "12:00 – 21:00"],
              ].map(([d, h]) => (
                <li key={d} style={{ display: "flex", justifyContent: "space-between", fontSize: "2.2cqw" }}>
                  <span style={{ color: "var(--ink-2)" }}>{d}</span>
                  <span style={{ fontWeight: 800, color: "var(--ink)" }}>{h}</span>
                </li>
              ))}
            </ul>
            <div style={{ marginTop: "3.5cqw" }}>
              <Pill bg={tone} size={2.2}>
                {c.badge}
              </Pill>
            </div>
          </div>
          <div className="relative h-full">{photo()}</div>
        </div>
      );

    /* Newsletter */
    case "newsletter":
      return (
        <div className="absolute inset-0 flex flex-col" style={{ background: "var(--paper-2)" }}>
          <div className="flex shrink-0 items-center justify-between" style={{ padding: "5cqw 5cqw 3cqw" }}>
            <Wordmark size={3.2} />
            <Pill bg={tone} size={2.2}>
              {c.eyebrow}
            </Pill>
          </div>
          <div className="relative shrink-0" style={{ height: "26%" }}>
            {photo()}
          </div>
          <div className="flex-1" style={{ padding: "5cqw" }}>
            <p style={{ fontSize: "6.4cqw", fontWeight: 800, color: "var(--ink)", lineHeight: 1.08 }}>
              {c.headline}
            </p>
            <p style={{ fontSize: "2.8cqw", color: "var(--ink-2)", marginTop: "2cqw" }}>{c.sub}</p>
            <ul style={{ marginTop: "4cqw", display: "flex", flexDirection: "column", gap: "2.4cqw" }}>
              {["Treuepunkte verdoppelt", "Tisch für Feiern anfragen", "Neue Öffnungszeiten"].map((row) => (
                <li
                  key={row}
                  style={{
                    background: "var(--paper-3)",
                    borderRadius: "3cqw",
                    padding: "3cqw",
                    fontSize: "2.6cqw",
                    fontWeight: 600,
                    color: "var(--ink)",
                  }}
                >
                  {row}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: "4cqw" }}>
              <Pill bg={tone} size={2.6}>
                {c.badge}
              </Pill>
            </div>
          </div>
        </div>
      );
  }
}
