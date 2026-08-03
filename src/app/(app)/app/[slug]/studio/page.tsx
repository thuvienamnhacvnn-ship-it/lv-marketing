import { AlertTriangle, FileText } from "lucide-react";
import Link from "next/link";
import { StudioForm } from "@/components/app/studio-form";
import { requirePermission } from "@/server/tenant";
import { prisma } from "@/lib/prisma";
import { getAppDictionary } from "@/i18n/get-dictionary";
import { isAiConfigured } from "@/services/ai/client";
import { cn } from "@/lib/utils";

export const metadata = { title: "AI Content Studio" };

const STATUS_TONE: Record<string, string> = {
  IDEA: "bg-paper-3 text-ink-3",
  DRAFT: "bg-paper-3 text-ink-2",
  WAITING_APPROVAL: "bg-amber-tint text-amber-ink",
  APPROVED: "bg-mint-tint text-mint-ink",
  SCHEDULED: "bg-sky-tint text-sky-ink",
  PUBLISHED: "bg-brand-tint text-brand-ink",
};

export default async function StudioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ctx = await requirePermission(slug, "ai:generate");
  const { locale, t } = await getAppDictionary();

  const [recent, generations] = await Promise.all([
    prisma.contentItem.findMany({
      where: { organizationId: ctx.organization.id },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, title: true, status: true, type: true, createdAt: true },
    }),
    prisma.aiGeneration.count({
      where: { organizationId: ctx.organization.id, status: "SUCCEEDED" },
    }),
  ]);

  const df = new Intl.DateTimeFormat(locale === "de" ? "de-DE" : "vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });

  return (
    <div className="mx-auto w-full max-w-[110rem]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-ink text-2xl font-extrabold sm:text-3xl">{t.appNav.studio}</h1>
          <p className="text-ink-2 mt-1.5 text-sm">
            Mô tả một lần, nhận nhiều phương án đăng bài — kèm hashtag và gợi ý ảnh.
          </p>
        </div>
        <p className="text-ink-3 text-xs">
          Đã tạo {generations} lần thành công
        </p>
      </div>

      {/*
        Nói rõ ngay đầu trang khi chưa có khoá API, thay vì để người dùng khai
        xong bản khai rồi mới nhận lỗi. Đây là thiếu sót cấu hình máy chủ nên chủ
        quán không tự sửa được — phải chỉ đúng người cần liên hệ.
      */}
      {!isAiConfigured() ? (
        <div className="border-amber/40 bg-amber-tint/40 mt-6 flex items-start gap-3 rounded-2xl border p-4">
          <AlertTriangle className="text-amber-ink mt-0.5 size-4 shrink-0" aria-hidden />
          <div>
            <p className="text-ink text-sm font-semibold">Tính năng AI chưa được bật</p>
            <p className="text-ink-2 mt-1 text-sm leading-relaxed">
              Máy chủ chưa khai <code className="font-mono text-xs">ANTHROPIC_API_KEY</code>. Bản
              khai vẫn điền được nhưng bấm tạo sẽ báo lỗi. Liên hệ quản trị hệ thống để bật.
            </p>
          </div>
        </div>
      ) : null}

      <div className="mt-6">
        <StudioForm slug={slug} />
      </div>

      {/* ── Nội dung vừa lưu ─────────────────────────────── */}
      {recent.length > 0 ? (
        <section className="lv-card mt-6 rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-ink flex items-center gap-2 text-sm font-bold">
              <FileText className="text-violet size-4" aria-hidden />
              Nội dung gần đây
            </h2>
            <span className="text-ink-3 text-xs">{t.appNav.calendar} · sắp ra mắt</span>
          </div>
          <ul className="divide-line divide-y">
            {recent.map((item) => (
              <li key={item.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <span className="min-w-0 flex-1">
                  <span className="text-ink block truncate text-sm font-semibold">
                    {item.title}
                  </span>
                  <span className="text-ink-3 block truncate text-xs">
                    {item.type.replaceAll("_", " ").toLowerCase()}
                  </span>
                </span>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[0.6rem] font-bold",
                    STATUS_TONE[item.status] ?? "bg-paper-3 text-ink-2",
                  )}
                >
                  {item.status.replaceAll("_", " ").toLowerCase()}
                </span>
                <span className="text-ink-3 shrink-0 text-[0.65rem] tabular-nums">
                  {df.format(item.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="text-ink-3 mt-5 text-xs leading-relaxed">
        Nội dung do AI viết là bản nháp. Đọc lại trước khi đăng — đặc biệt là giá, giờ mở cửa và
        các cam kết về nguyên liệu.{" "}
        <Link href={`/app/${slug}`} className="text-brand-ink hover:underline">
          Về Tổng quan
        </Link>
      </p>
    </div>
  );
}
