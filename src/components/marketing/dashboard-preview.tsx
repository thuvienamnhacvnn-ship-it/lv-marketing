import { cn } from "@/lib/utils";

export type PreviewVariant =
  | "calendar"
  | "studio"
  | "inbox"
  | "reviews"
  | "analytics"
  | "campaign"
  | "website"
  | "loyalty";

/**
 * Mockup giao diện dashboard dựng bằng HTML/CSS thuần — không dùng ảnh chụp màn hình,
 * nên luôn sắc nét ở mọi kích thước. Mọi con số là dữ liệu minh hoạ.
 */
export function DashboardPreview({
  variant,
  className,
  /** Bỏ thanh tiêu đề cửa sổ khi phần tử cha đã là một thẻ. */
  bare = false,
  /** Nổi trên ảnh: nền trắng đục, bóng đậm hơn. */
  floating = false,
}: {
  variant: PreviewVariant;
  className?: string;
  bare?: boolean;
  floating?: boolean;
}) {
  if (bare) {
    return (
      <div className={cn("bg-paper-3 overflow-hidden rounded-2xl p-4", className)} aria-hidden>
        {renderBody(variant)}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl",
        floating
          ? "border-paper-2/70 bg-paper-2/95 border shadow-[var(--shadow-xl)] backdrop-blur-md"
          : "lv-card",
        className,
      )}
      aria-hidden
    >
      <div className="border-line flex items-center gap-1.5 border-b px-3.5 py-2.5">
        <span className="bg-bad/60 size-2 rounded-full" />
        <span className="bg-amber/70 size-2 rounded-full" />
        <span className="bg-line-strong size-2 rounded-full" />
        <span className="text-ink-3 ml-2.5 font-mono text-[0.58rem]">app.lv-groups.com</span>
      </div>
      <div className="p-3.5">{renderBody(variant)}</div>
    </div>
  );
}

function renderBody(variant: PreviewVariant) {
  switch (variant) {
    case "calendar":
      return <CalendarBody />;
    case "studio":
      return <StudioBody />;
    case "inbox":
      return <InboxBody />;
    case "reviews":
      return <ReviewsBody />;
    case "analytics":
      return <AnalyticsBody />;
    case "campaign":
      return <CampaignBody />;
    case "website":
      return <WebsiteBody />;
    case "loyalty":
      return <LoyaltyBody />;
  }
}

/* ── mảnh dùng lại ───────────────────────────────────────── */

function Tag({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "brand" | "sky" | "violet" | "amber";
}) {
  const tones = {
    neutral: "bg-paper-3 text-ink-3",
    brand: "bg-brand-tint text-brand-ink",
    sky: "bg-sky-tint text-sky-ink",
    violet: "bg-violet-tint text-violet-ink",
    amber: "bg-amber-tint text-amber-ink",
  };
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[0.55rem] font-semibold", tones[tone])}>
      {children}
    </span>
  );
}

function Bar({ w = "100%", tone = "soft" }: { w?: string; tone?: "soft" | "mid" }) {
  return (
    <span
      className={cn("block h-1.5 rounded-full", tone === "mid" ? "bg-line-strong" : "bg-line")}
      style={{ width: w }}
    />
  );
}

/* ── nội dung ────────────────────────────────────────────── */

function CalendarBody() {
  const marks = [1, 3, 4, 7, 9, 10, 13, 16, 18, 21, 23, 26];
  const brandDays = new Set([3, 10, 18, 26]);
  return (
    <div>
      <div className="mb-2.5 flex items-center justify-between">
        <p className="text-ink text-[0.7rem] font-semibold">Tháng 8 · 2026</p>
        <div className="flex gap-1">
          <Tag tone="sky">Đã duyệt 9</Tag>
          <Tag tone="amber">Chờ 3</Tag>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 28 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "flex h-7 flex-col justify-end rounded-md p-1",
              marks.includes(i) ? "bg-paper-3" : "bg-transparent",
            )}
          >
            {marks.includes(i) ? (
              <span
                className={cn(
                  "h-1 rounded-full",
                  brandDays.has(i) ? "bg-brand" : "bg-violet/50",
                )}
              />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function StudioBody() {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-ink text-[0.7rem] font-semibold">AI Content Studio</p>
        <Tag tone="brand">3 phương án</Tag>
      </div>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            "rounded-xl p-2.5",
            i === 0 ? "bg-brand-tint ring-brand/25 ring-1" : "bg-paper-3",
          )}
        >
          <div className="space-y-1.5">
            <Bar w="86%" tone={i === 0 ? "mid" : "soft"} />
            <Bar w="94%" />
            <Bar w="58%" />
          </div>
        </div>
      ))}
    </div>
  );
}

function InboxBody() {
  const rows = [
    { name: "Anna Weber", ch: "Instagram", tag: "Đặt bàn", tone: "brand" as const },
    { name: "Trần Minh", ch: "WhatsApp", tag: "Hỏi giá", tone: "violet" as const },
    { name: "M. Schneider", ch: "Facebook", tag: "Đã xử lý", tone: "sky" as const },
  ];
  return (
    <div className="space-y-1.5">
      <div className="mb-1 flex items-center justify-between">
        <p className="text-ink text-[0.7rem] font-semibold">Hộp thư chung</p>
        <Tag tone="amber">4 chưa xử lý</Tag>
      </div>
      {rows.map((row) => (
        <div key={row.name} className="bg-paper-3 flex items-center gap-2.5 rounded-xl px-2.5 py-2">
          <span className="bg-paper-2 text-ink grid size-6 shrink-0 place-items-center rounded-full text-[0.55rem] font-bold">
            {row.name.charAt(0)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-ink truncate text-[0.64rem] font-medium">{row.name}</p>
            <p className="text-ink-3 text-[0.55rem]">{row.ch}</p>
          </div>
          <Tag tone={row.tone}>{row.tag}</Tag>
        </div>
      ))}
    </div>
  );
}

function ReviewsBody() {
  const bars = [
    { star: 5, pct: 72 },
    { star: 4, pct: 18 },
    { star: 3, pct: 6 },
    { star: 2, pct: 3 },
    { star: 1, pct: 1 },
  ];
  return (
    <div className="grid grid-cols-[auto_1fr] gap-3">
      <div className="bg-amber-tint grid place-items-center rounded-xl px-3 py-2">
        <span className="text-amber-ink text-2xl font-extrabold">4.8</span>
        <span className="text-amber-ink/70 text-[0.55rem]">218 đánh giá</span>
      </div>
      <div className="space-y-1 self-center">
        {bars.map((bar) => (
          <div key={bar.star} className="flex items-center gap-1.5">
            <span className="text-ink-3 w-2 text-[0.55rem]">{bar.star}</span>
            <span className="bg-paper-3 h-1.5 flex-1 overflow-hidden rounded-full">
              <span
                className={cn("block h-full rounded-full", bar.star >= 4 ? "bg-amber" : "bg-line-strong")}
                style={{ width: `${bar.pct}%` }}
              />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsBody() {
  const points = [22, 30, 26, 38, 34, 48, 45, 60, 56, 72, 78, 88];
  const max = Math.max(...points);
  return (
    <div>
      <div className="mb-2.5 grid grid-cols-3 gap-1.5">
        {[
          { k: "Reach", v: "24.8k", tone: "bg-violet-tint text-violet-ink" },
          { k: "Lead", v: "63", tone: "bg-sky-tint text-sky-ink" },
          { k: "Booking", v: "119", tone: "bg-brand-tint text-brand-ink" },
        ].map((stat) => (
          <div key={stat.k} className={cn("rounded-xl px-2 py-1.5", stat.tone)}>
            <p className="text-[0.5rem] font-semibold tracking-wide uppercase opacity-75">{stat.k}</p>
            <p className="mt-0.5 text-sm font-extrabold">{stat.v}</p>
          </div>
        ))}
      </div>
      <div className="flex h-16 items-end gap-1">
        {points.map((p, i) => (
          <span
            key={i}
            className={cn("flex-1 rounded-t-sm", i >= points.length - 3 ? "bg-brand" : "bg-violet/35")}
            style={{ height: `${(p / max) * 100}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function CampaignBody() {
  const rows = [
    { name: "Mittagsangebot", pct: 82, bar: "bg-brand" },
    { name: "Sommer Special", pct: 61, bar: "bg-violet" },
    { name: "Neue Karte", pct: 44, bar: "bg-sky" },
  ];
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-ink text-[0.7rem] font-semibold">Chiến dịch đang chạy</p>
        <Tag tone="sky">3 active</Tag>
      </div>
      {rows.map((row) => (
        <div key={row.name} className="bg-paper-3 rounded-xl px-2.5 py-2">
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-ink text-[0.64rem] font-medium">{row.name}</p>
            <span className="text-ink-3 text-[0.55rem] font-semibold">{row.pct}%</span>
          </div>
          <span className="bg-paper-2 block h-1 overflow-hidden rounded-full">
            <span className={cn("block h-full rounded-full", row.bar)} style={{ width: `${row.pct}%` }} />
          </span>
        </div>
      ))}
    </div>
  );
}

function WebsiteBody() {
  return (
    <div className="space-y-2">
      <div className="bg-paper-3 rounded-xl p-2.5">
        <span className="bg-brand mb-1.5 block h-2 w-1/2 rounded-full" />
        <div className="space-y-1">
          <Bar w="76%" />
          <Bar w="62%" />
        </div>
        <div className="mt-2.5 flex gap-1.5">
          <span className="bg-brand h-4 w-14 rounded-full" />
          <span className="border-line-strong h-4 w-12 rounded-full border" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {["bg-violet-tint", "bg-magenta-tint", "bg-amber-tint"].map((tone, i) => (
          <div key={i} className={cn("space-y-1 rounded-xl p-2", tone)}>
            <span className="bg-paper-2/70 block size-3 rounded-md" />
            <Bar w="88%" />
          </div>
        ))}
      </div>
    </div>
  );
}

function LoyaltyBody() {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-3">
      <div className="bg-paper-3 grid place-items-center rounded-xl px-3 py-2.5">
        <div className="grid grid-cols-5 gap-[2px]">
          {Array.from({ length: 25 }).map((_, i) => (
            <span
              key={i}
              className={cn("size-1.5 rounded-[1px]", i % 3 === 0 || i % 7 === 0 ? "bg-ink" : "bg-line-strong")}
            />
          ))}
        </div>
        <span className="text-ink-3 mt-1.5 font-mono text-[0.5rem]">LV-8842</span>
      </div>
      <div className="space-y-1.5 self-center">
        {[
          { k: "Điểm tích luỹ", v: "1.240" },
          { k: "Hạng thành viên", v: "Gold" },
          { k: "Voucher", v: "2" },
        ].map((row) => (
          <div key={row.k} className="border-line flex items-center justify-between border-b pb-1">
            <span className="text-ink-3 text-[0.58rem]">{row.k}</span>
            <span className="text-ink text-[0.64rem] font-bold">{row.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
