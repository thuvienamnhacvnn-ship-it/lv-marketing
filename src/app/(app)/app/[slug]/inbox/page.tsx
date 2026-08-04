import Link from "next/link";
import { Inbox, MessageSquare } from "lucide-react";
import { InboxThread } from "@/components/app/inbox-thread";
import { requirePermission } from "@/server/tenant";
import { loadConversations, loadInboxCounts, loadThread } from "@/features/inbox/queries";
import { getAppDictionary } from "@/i18n/get-dictionary";
import { cn } from "@/lib/utils";
import type { ConversationStatus } from "@/generated/prisma/enums";

export const metadata = { title: "Customer Inbox" };

const CHANNEL_LABELS: Record<string, string> = {
  FACEBOOK: "Facebook",
  INSTAGRAM: "Instagram",
  WHATSAPP: "WhatsApp",
  WEBSITE_CHAT: "Chat web",
  CONTACT_FORM: "Form liên hệ",
  BOOKING_REQUEST: "Đặt bàn",
  GOOGLE: "Google",
  EMAIL: "Email",
  PHONE: "Điện thoại",
};

const FILTERS = [
  { key: "ALL", label: "Tất cả" },
  { key: "OPEN", label: "Đang mở" },
  { key: "PENDING", label: "Chờ khách" },
  { key: "RESOLVED", label: "Đã xong" },
] as const;

export default async function InboxPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ c?: string; f?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const ctx = await requirePermission(slug, "inbox:read");
  const { locale, t } = await getAppDictionary();

  const filter = (FILTERS.find((f) => f.key === query.f)?.key ?? "ALL") as
    | ConversationStatus
    | "ALL";

  const [conversations, counts] = await Promise.all([
    loadConversations(ctx.organization.id, filter),
    loadInboxCounts(ctx.organization.id),
  ]);

  // Không chọn gì thì mở sẵn hội thoại đầu tiên — hộp thư trống trơn khi vào
  // là một bước thừa, ai vào cũng để đọc tin.
  const activeId = query.c ?? conversations[0]?.id;
  const thread = activeId ? await loadThread(ctx.organization.id, activeId) : null;

  const dtf = new Intl.DateTimeFormat(locale === "de" ? "de-DE" : "vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });

  return (
    <div className="mx-auto w-full max-w-[110rem]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-ink text-2xl font-extrabold sm:text-3xl">{t.appNav.inbox}</h1>
          <p className="text-ink-2 mt-1.5 text-sm">
            Instagram, WhatsApp, Facebook và form liên hệ gom về một chỗ.
          </p>
        </div>
        <div className="flex gap-4 text-xs">
          <span className="text-ink-3">
            <span className="text-ink block text-lg font-extrabold tabular-nums">{counts.unread}</span>
            chưa đọc
          </span>
          <span className="text-ink-3">
            <span className="text-ink block text-lg font-extrabold tabular-nums">{counts.open}</span>
            đang mở
          </span>
          <span className="text-ink-3">
            <span className="text-ink block text-lg font-extrabold tabular-nums">{counts.resolved}</span>
            đã xong
          </span>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
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

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,20rem)_1fr]">
        {/* ── Danh sách ──────────────────────────────────── */}
        <section className="lv-card max-h-[38rem] overflow-y-auto rounded-2xl p-2">
          {conversations.length === 0 ? (
            <p className="text-ink-3 py-10 text-center text-sm">{t.common.empty}</p>
          ) : (
            <ul className="space-y-1">
              {conversations.map((conversation) => {
                const active = conversation.id === activeId;
                return (
                  <li key={conversation.id}>
                    <Link
                      href={`?f=${filter}&c=${conversation.id}`}
                      className={cn(
                        "flex items-start gap-2.5 rounded-xl p-2.5 transition-colors",
                        active ? "bg-brand-tint" : "hover:bg-paper-3",
                      )}
                    >
                      <span className="bg-sky-tint text-sky-ink grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold">
                        {conversation.contactName.slice(0, 1).toUpperCase()}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5">
                          <span className="text-ink truncate text-sm font-bold">
                            {conversation.contactName}
                          </span>
                          <span className="text-ink-3 shrink-0 text-[0.6rem]">
                            {CHANNEL_LABELS[conversation.channel] ?? conversation.channel}
                          </span>
                        </span>
                        <span className="text-ink-2 mt-0.5 line-clamp-1 block text-xs">
                          {conversation.messages[0]?.body ?? "—"}
                        </span>
                      </span>
                      <span className="flex shrink-0 flex-col items-end gap-1">
                        <span className="text-ink-3 text-[0.6rem] tabular-nums">
                          {dtf.format(conversation.lastMessageAt)}
                        </span>
                        {conversation.unreadCount > 0 ? (
                          <span className="bg-brand rounded-full px-1.5 text-[0.6rem] font-bold text-white tabular-nums">
                            {conversation.unreadCount}
                          </span>
                        ) : null}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* ── Hội thoại đang mở ──────────────────────────── */}
        <section className="lv-card flex h-[38rem] flex-col rounded-2xl p-5">
          {thread ? (
            <>
              <div className="border-line mb-3 flex flex-wrap items-center justify-between gap-3 border-b pb-3">
                <div className="min-w-0">
                  <p className="text-ink truncate text-sm font-bold">{thread.contactName}</p>
                  <p className="text-ink-3 text-xs">
                    {CHANNEL_LABELS[thread.channel] ?? thread.channel}
                    {thread.customer ? ` · ${thread.customer.email ?? thread.customer.phone ?? ""}` : ""}
                  </p>
                </div>
                {thread.customer ? (
                  <Link
                    href={`/app/${slug}/loyalty/${thread.customer.id}`}
                    className="border-line text-ink-2 hover:bg-paper-3 shrink-0 rounded-full border px-3 py-1 text-xs font-semibold"
                  >
                    Xem thẻ thành viên
                  </Link>
                ) : null}
              </div>

              <InboxThread
                slug={slug}
                conversationId={thread.id}
                status={thread.status}
                messages={thread.messages}
                locale={locale}
              />
            </>
          ) : (
            <div className="text-ink-3 flex flex-1 flex-col items-center justify-center gap-2">
              <Inbox className="size-8 opacity-40" aria-hidden />
              <p className="text-sm">Chọn một hội thoại bên trái.</p>
            </div>
          )}
        </section>
      </div>

      <p className="text-ink-3 mt-4 flex items-center gap-1.5 text-xs">
        <MessageSquare className="size-3" aria-hidden />
        Đây là hộp thư nội bộ. Tin gửi đi chưa nối với API thật của Instagram hay WhatsApp —
        phần kết nối kênh nằm ở màn hình Social Channels, chưa dựng.
      </p>
    </div>
  );
}
