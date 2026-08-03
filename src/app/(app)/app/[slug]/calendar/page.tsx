import { CalendarClock, CheckCircle2, ClipboardCheck, Inbox, Send } from "lucide-react";
import { ContentCalendar } from "@/components/app/content-calendar";
import { requirePermission } from "@/server/tenant";
import { loadMonthContent, loadMonthSummary, loadUnscheduled } from "@/features/calendar/queries";
import { getAppDictionary } from "@/i18n/get-dictionary";
import { cn } from "@/lib/utils";

export const metadata = { title: "Content Calendar" };

export default async function CalendarPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ y?: string; m?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const ctx = await requirePermission(slug, "calendar:manage");
  const { locale, t } = await getAppDictionary();

  // Tháng hiện tại nếu không có tham số, và chặn giá trị vô lý từ URL.
  const now = new Date();
  const year = clamp(Number(query.y), 2020, 2100) ?? now.getUTCFullYear();
  const month = clamp(Number(query.m), 0, 11) ?? now.getUTCMonth();

  const [{ items }, unscheduled, summary] = await Promise.all([
    loadMonthContent(ctx.organization.id, year, month),
    loadUnscheduled(ctx.organization.id),
    loadMonthSummary(ctx.organization.id, year, month),
  ]);

  const tiles = [
    { icon: CalendarClock, label: "Bài trong tháng", value: summary.total, tone: "bg-violet-tint text-violet-ink" },
    { icon: ClipboardCheck, label: "Chờ duyệt", value: summary.waiting, tone: "bg-amber-tint text-amber-ink" },
    { icon: CheckCircle2, label: "Đã duyệt", value: summary.approved, tone: "bg-mint-tint text-mint-ink" },
    { icon: Send, label: "Đã đăng", value: summary.published, tone: "bg-brand-tint text-brand-ink" },
    { icon: Inbox, label: "Chưa xếp lịch", value: summary.unscheduled, tone: "bg-paper-3 text-ink-2" },
  ];

  return (
    <div className="mx-auto w-full max-w-[110rem]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-ink text-2xl font-extrabold sm:text-3xl">{t.appNav.calendar}</h1>
          <p className="text-ink-2 mt-1.5 text-sm">
            Kéo thả để đổi ngày đăng. Thay đổi lưu ngay, không cần bấm nút nào.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {tiles.map((tile) => (
          <div key={tile.label} className="lv-card rounded-2xl p-4">
            <span className={cn("grid size-8 place-items-center rounded-lg", tile.tone)}>
              <tile.icon className="size-4" aria-hidden />
            </span>
            <p className="text-ink mt-3 text-xl font-extrabold tabular-nums">{tile.value}</p>
            <p className="text-ink-3 mt-0.5 text-xs">{tile.label}</p>
          </div>
        ))}
      </div>

      <div className="lv-card mt-5 rounded-2xl p-4 sm:p-5">
        <ContentCalendar
          slug={slug}
          locale={locale}
          year={year}
          month={month}
          items={[...items, ...unscheduled]}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs">
        {[
          { label: "Ý tưởng", tone: "bg-paper-3" },
          { label: "Nháp", tone: "bg-paper-3" },
          { label: "Chờ duyệt", tone: "bg-amber-tint" },
          { label: "Đã duyệt", tone: "bg-mint-tint" },
          { label: "Đã lên lịch", tone: "bg-sky-tint" },
          { label: "Đã đăng", tone: "bg-brand-tint" },
        ].map((legend) => (
          <span key={legend.label} className="text-ink-3 flex items-center gap-1.5">
            <span className={cn("border-line size-2.5 rounded border", legend.tone)} aria-hidden />
            {legend.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Chặn tham số URL vô lý. Trả `null` khi không dùng được để bên gọi lấy mặc định. */
function clamp(value: number, min: number, max: number): number | null {
  if (!Number.isInteger(value) || value < min || value > max) return null;
  return value;
}
