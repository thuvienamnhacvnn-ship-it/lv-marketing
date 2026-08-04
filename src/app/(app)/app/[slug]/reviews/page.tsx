import Link from "next/link";
import { AlertTriangle, MessageSquareReply, Star, TrendingUp } from "lucide-react";
import { ReviewCard } from "@/components/app/review-card";
import { requirePermission } from "@/server/tenant";
import { loadReviewStats, loadReviews, type ReviewFilter } from "@/features/reviews/queries";
import { getAppDictionary } from "@/i18n/get-dictionary";
import { isAiConfigured } from "@/services/ai/client";
import { cn } from "@/lib/utils";

export const metadata = { title: "Review Center" };

const FILTERS = [
  { key: "ALL", label: "Tất cả" },
  { key: "UNANSWERED", label: "Chưa trả lời" },
  { key: "NEGATIVE", label: "Tiêu cực" },
  { key: "NEUTRAL", label: "Trung tính" },
  { key: "POSITIVE", label: "Tích cực" },
] as const;

export default async function ReviewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ f?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const ctx = await requirePermission(slug, "review:read");
  const { locale, t } = await getAppDictionary();

  const filter = (FILTERS.find((f) => f.key === query.f)?.key ?? "ALL") as ReviewFilter;

  const [reviews, stats] = await Promise.all([
    loadReviews(ctx.organization.id, filter),
    loadReviewStats(ctx.organization.id),
  ]);

  const nf = new Intl.NumberFormat(locale === "de" ? "de-DE" : "vi-VN");

  return (
    <div className="mx-auto w-full max-w-[110rem]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-ink text-2xl font-extrabold sm:text-3xl">{t.appNav.reviews}</h1>
          <p className="text-ink-2 mt-1.5 text-sm">
            Đánh giá chưa trả lời được đưa lên đầu, tiêu cực trước tiên.
          </p>
        </div>
      </div>

      {/*
        Cảnh báo đặt ngay đầu trang khi còn đánh giá xấu chưa trả lời. Một bài
        1 sao im lặng cả tháng là thứ ai tìm quán cũng đọc thấy đầu tiên.
      */}
      {stats.negativeOpen > 0 ? (
        <div className="border-magenta/40 bg-magenta-tint/30 mt-5 flex items-start gap-3 rounded-2xl border p-4">
          <AlertTriangle className="text-magenta-ink mt-0.5 size-4 shrink-0" aria-hidden />
          <div>
            <p className="text-ink text-sm font-semibold">
              {stats.negativeOpen} đánh giá tiêu cực chưa được trả lời
            </p>
            <p className="text-ink-2 mt-1 text-sm leading-relaxed">
              Trả lời trong 24 giờ là cách rẻ nhất để giữ điểm trung bình. Bài không ai đụng tới sẽ
              nằm nguyên trên Google.
            </p>
          </div>
        </div>
      ) : null}

      {!isAiConfigured() ? (
        <p className="border-amber/40 bg-amber-tint/40 text-ink-2 mt-4 rounded-xl border px-4 py-2.5 text-xs leading-relaxed">
          Nút <span className="font-semibold">AI soạn nháp</span> chưa dùng được — máy chủ chưa khai{" "}
          <code className="font-mono">ANTHROPIC_API_KEY</code>. Viết tay vẫn bình thường.
        </p>
      ) : null}

      {/* ── Số liệu ────────────────────────────────────────── */}
      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,22rem)_1fr]">
        <section className="lv-card rounded-2xl p-5">
          <div className="flex items-end gap-4">
            <div>
              <p className="text-ink text-4xl font-extrabold tabular-nums">
                {stats.average ?? "—"}
              </p>
              <div className="mt-1 flex gap-0.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star
                    key={i}
                    className={cn(
                      "size-3",
                      stats.average !== null && i < Math.round(stats.average)
                        ? "fill-amber text-amber"
                        : "text-line-strong",
                    )}
                    aria-hidden
                  />
                ))}
              </div>
            </div>
            <p className="text-ink-3 pb-1 text-xs">
              {nf.format(stats.total)} đánh giá
              <br />
              {nf.format(stats.last30)} trong 30 ngày
            </p>
          </div>

          <ul className="mt-4 space-y-1.5">
            {stats.distribution.map((row) => (
              <li key={row.star} className="flex items-center gap-2">
                <span className="text-ink-3 w-2 text-xs tabular-nums">{row.star}</span>
                <span className="bg-line h-1.5 flex-1 overflow-hidden rounded-full">
                  <span
                    className="bg-amber block h-full rounded-full"
                    style={{ width: `${row.percent}%` }}
                  />
                </span>
                <span className="text-ink-3 w-8 text-right text-[0.65rem] tabular-nums">
                  {row.count}
                </span>
              </li>
            ))}
          </ul>

          <div className="border-line mt-4 grid grid-cols-2 gap-3 border-t pt-4">
            <div>
              <p className="text-ink flex items-center gap-1.5 text-lg font-extrabold tabular-nums">
                <MessageSquareReply className="text-sky size-4" aria-hidden />
                {stats.unanswered}
              </p>
              <p className="text-ink-3 mt-0.5 text-xs">Chưa trả lời</p>
            </div>
            <div>
              <p className="text-ink flex items-center gap-1.5 text-lg font-extrabold tabular-nums">
                <TrendingUp className="text-mint size-4" aria-hidden />
                {stats.total > 0
                  ? Math.round(((stats.total - stats.unanswered) / stats.total) * 100)
                  : 0}
                %
              </p>
              <p className="text-ink-3 mt-0.5 text-xs">Tỉ lệ đã phản hồi</p>
            </div>
          </div>
        </section>

        {/* ── Danh sách ─────────────────────────────────────── */}
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <Link
                key={f.key}
                href={`?f=${f.key}`}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                  filter === f.key
                    ? "bg-brand-tint text-brand-ink"
                    : "text-ink-3 hover:bg-paper-3 hover:text-ink",
                )}
              >
                {f.label}
              </Link>
            ))}
          </div>

          {reviews.length === 0 ? (
            <p className="lv-card text-ink-3 rounded-2xl py-12 text-center text-sm">
              {t.common.empty}
            </p>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => (
                <ReviewCard key={review.id} slug={slug} review={review} locale={locale} />
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="text-ink-3 mt-4 text-xs leading-relaxed">
        Phản hồi lưu ở đây chưa tự đăng lên Google Business — hiện phải tự dán sang. Phần kết nối
        nằm ở màn hình Social Channels, chưa dựng.
      </p>
    </div>
  );
}
