import Link from "next/link";
import {
  AlertTriangle,
  CalendarClock,
  ClipboardCheck,
  Inbox,
  Megaphone,
  Send,
  Star,
  UserPlus,
} from "lucide-react";
import { requireTenant } from "@/server/tenant";
import { loadRecentActivity, loadWorkspaceSnapshot } from "@/features/workspace/queries";
import { getAppDictionary } from "@/i18n/get-dictionary";
import { cn } from "@/lib/utils";

export const metadata = { title: "Tổng quan" };

const CONTENT_STATUS_TONE: Record<string, string> = {
  IDEA: "bg-paper-3 text-ink-3",
  DRAFT: "bg-paper-3 text-ink-2",
  WAITING_APPROVAL: "bg-amber-tint text-amber-ink",
  APPROVED: "bg-mint-tint text-mint-ink",
  SCHEDULED: "bg-sky-tint text-sky-ink",
  PUBLISHED: "bg-brand-tint text-brand-ink",
  FAILED: "bg-magenta-tint text-magenta-ink",
  ARCHIVED: "bg-paper-3 text-ink-3",
};

export default async function OverviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ctx = await requireTenant(slug);
  const { locale, t } = await getAppDictionary();

  const [snapshot, activity] = await Promise.all([
    loadWorkspaceSnapshot(ctx.organization.id),
    loadRecentActivity(ctx.organization.id),
  ]);

  const dateFormat = new Intl.DateTimeFormat(locale === "de" ? "de-DE" : "vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });

  const tiles = [
    { icon: Send, label: "Đã đăng 7 ngày", value: snapshot.publishedLast7Days, tone: "bg-brand-tint text-brand-ink" },
    { icon: ClipboardCheck, label: "Chờ duyệt", value: snapshot.waitingApproval, tone: "bg-amber-tint text-amber-ink" },
    { icon: CalendarClock, label: "Lên lịch tuần này", value: snapshot.scheduledThisWeek, tone: "bg-sky-tint text-sky-ink" },
    { icon: Inbox, label: "Tin chưa xử lý", value: snapshot.unreadConversations, tone: "bg-violet-tint text-violet-ink" },
    { icon: UserPlus, label: "Khách mới 30 ngày", value: snapshot.newCustomers30Days, tone: "bg-mint-tint text-mint-ink" },
    { icon: Star, label: "Điểm đánh giá", value: snapshot.averageRating ?? "—", tone: "bg-amber-tint text-amber-ink" },
    { icon: Megaphone, label: "Chiến dịch đang chạy", value: snapshot.runningCampaigns, tone: "bg-magenta-tint text-magenta-ink" },
    { icon: AlertTriangle, label: "Cần theo dõi trễ hạn", value: snapshot.overdueFollowUps, tone: "bg-magenta-tint text-magenta-ink" },
  ];

  return (
    <div className="mx-auto w-full max-w-[110rem]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-ink text-2xl font-extrabold sm:text-3xl">{t.appNav.overview}</h1>
          <p className="text-ink-2 mt-1.5 text-sm">
            {ctx.organization.name}
            {ctx.organization.isDemo ? (
              <span className="bg-amber-tint text-amber-ink ml-2 rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase">
                {t.common.demoBadge}
              </span>
            ) : null}
          </p>
        </div>
        <p className="text-ink-3 text-xs">Số liệu tính đến {snapshot.date}</p>
      </div>

      {/* ── Ô số liệu ─────────────────────────────────────── */}
      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <div key={tile.label} className="lv-card rounded-2xl p-4">
            <span className={cn("grid size-9 place-items-center rounded-xl", tile.tone)}>
              <tile.icon className="size-4" aria-hidden />
            </span>
            <p className="text-ink mt-3.5 text-2xl font-extrabold tabular-nums">{tile.value}</p>
            <p className="text-ink-3 mt-1 text-xs">{tile.label}</p>
          </div>
        ))}
      </div>

      {/* ── Ba cột hoạt động gần đây ──────────────────────── */}
      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <Panel title={t.appNav.calendar} hint={`${activity.content.length} mục gần nhất`}>
          {activity.content.length === 0 ? (
            <Empty text={t.common.empty} />
          ) : (
            <ul className="divide-line divide-y">
              {activity.content.map((item) => (
                <li key={item.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="min-w-0 flex-1">
                    <span className="text-ink block truncate text-sm font-semibold">
                      {item.title}
                    </span>
                    <span className="text-ink-3 mt-0.5 block text-xs">
                      {item.type.replaceAll("_", " ").toLowerCase()}
                      {item.targetDate ? ` · ${dateFormat.format(item.targetDate)}` : ""}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[0.6rem] font-bold",
                      CONTENT_STATUS_TONE[item.status] ?? "bg-paper-3 text-ink-2",
                    )}
                  >
                    {item.status.replaceAll("_", " ").toLowerCase()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title={t.appNav.inbox}
          hint={snapshot.unreadConversations > 0 ? `${snapshot.unreadConversations} chưa xử lý` : undefined}
        >
          {activity.conversations.length === 0 ? (
            <Empty text={t.common.empty} />
          ) : (
            <ul className="divide-line divide-y">
              {activity.conversations.map((conversation) => (
                <li key={conversation.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="bg-sky-tint text-sky-ink grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold">
                    {conversation.contactName.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="text-ink block truncate text-sm font-semibold">
                      {conversation.contactName}
                    </span>
                    <span className="text-ink-3 block truncate text-xs">
                      {conversation.messages[0]?.body ?? conversation.channel.toLowerCase()}
                    </span>
                  </span>
                  {conversation.unreadCount > 0 ? (
                    <span className="bg-brand shrink-0 rounded-full px-1.5 py-0.5 text-[0.6rem] font-bold text-white tabular-nums">
                      {conversation.unreadCount}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title={t.appNav.reviews}
          hint={snapshot.negativeReviewsOpen > 0 ? `${snapshot.negativeReviewsOpen} chưa phản hồi` : undefined}
        >
          {activity.reviews.length === 0 ? (
            <Empty text={t.common.empty} />
          ) : (
            <ul className="divide-line divide-y">
              {activity.reviews.map((review) => (
                <li key={review.id} className="py-3 first:pt-0 last:pb-0">
                  <span className="flex items-center gap-2">
                    <span className="flex items-center gap-0.5">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <Star
                          key={i}
                          className={cn(
                            "size-3",
                            i < review.rating ? "fill-amber text-amber" : "text-line-strong",
                          )}
                          aria-hidden
                        />
                      ))}
                    </span>
                    <span className="text-ink truncate text-xs font-semibold">
                      {review.authorName}
                    </span>
                    <span className="text-ink-3 ml-auto shrink-0 text-[0.65rem]">
                      {dateFormat.format(review.postedAt)}
                    </span>
                  </span>
                  {review.body ? (
                    <p className="text-ink-2 mt-1.5 line-clamp-2 text-xs leading-relaxed">
                      {review.body}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {/* Nói rõ ranh giới: khung đã dựng xong, các màn hình bên trong thì chưa. */}
      <div className="border-line bg-paper-3 mt-6 rounded-2xl border border-dashed px-5 py-4">
        <p className="text-ink text-sm font-semibold">Khung workspace đã sẵn sàng</p>
        <p className="text-ink-2 mt-1.5 text-sm leading-relaxed">
          Số liệu phía trên đọc trực tiếp từ cơ sở dữ liệu. Các màn hình còn lại trong menu đang
          gắn nhãn <span className="font-semibold">{t.common.comingSoon}</span> — nền tảng bên dưới
          (phân quyền, đa tenant, 8 tác vụ AI) đã có sẵn, chỉ còn dựng giao diện.
        </p>
        <Link
          href={`/${locale}/lien-he`}
          className="text-brand-ink mt-3 inline-block text-sm font-semibold hover:underline"
        >
          Góp ý về thứ tự ưu tiên →
        </Link>
      </div>
    </div>
  );
}

function Panel({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="lv-card rounded-2xl p-5">
      <div className="mb-3.5 flex items-center justify-between gap-3">
        <h2 className="text-ink text-sm font-bold">{title}</h2>
        {hint ? <span className="text-ink-3 shrink-0 text-xs">{hint}</span> : null}
      </div>
      {children}
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-ink-3 py-6 text-center text-sm">{text}</p>;
}
