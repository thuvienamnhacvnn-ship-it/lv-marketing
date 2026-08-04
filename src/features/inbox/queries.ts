import "server-only";
import { prisma } from "@/lib/prisma";
import type { ConversationStatus } from "@/generated/prisma/enums";

/**
 * Danh sách hội thoại.
 *
 * Sắp theo `lastMessageAt` chứ không phải `createdAt`: hộp thư phải đưa thứ vừa
 * có động tĩnh lên đầu, không phải thứ mở sớm nhất.
 */
export async function loadConversations(
  organizationId: string,
  filter: ConversationStatus | "ALL" = "ALL",
) {
  return prisma.conversation.findMany({
    where: {
      organizationId,
      ...(filter === "ALL" ? { status: { not: "SPAM" } } : { status: filter }),
    },
    orderBy: [{ unreadCount: "desc" }, { lastMessageAt: "desc" }],
    take: 50,
    select: {
      id: true,
      channel: true,
      status: true,
      priority: true,
      contactName: true,
      language: true,
      unreadCount: true,
      lastMessageAt: true,
      customerId: true,
      messages: { orderBy: { sentAt: "desc" }, take: 1, select: { body: true, direction: true } },
    },
  });
}

export async function loadThread(organizationId: string, conversationId: string) {
  return prisma.conversation.findFirst({
    where: { id: conversationId, organizationId },
    include: {
      messages: { orderBy: { sentAt: "asc" } },
      customer: { select: { id: true, fullName: true, email: true, phone: true } },
    },
  });
}

/**
 * Đếm số hội thoại theo trạng thái.
 *
 * Dùng `Promise.all` chứ KHÔNG dùng `$transaction`. Dạng mảng của `$transaction`
 * mở một transaction thật, giữ kết nối và có hạn khởi động 2 giây — Neon vừa ngủ
 * dậy là ném `P2028 Unable to start a transaction in the given time` và cả trang
 * đổ 500. Mấy truy vấn ở đây chỉ đếm để hiển thị, không cần ảnh chụp nhất quán,
 * nên chạy song song là đủ. Quy tắc này áp cho mọi truy vấn CHỈ ĐỌC trong
 * mọi file `queries.ts` trong `src/features`; thao tác GHI vẫn phải dùng transaction.
 */
export async function loadInboxCounts(organizationId: string) {
  const [open, pending, resolved, unread] = await Promise.all([
    prisma.conversation.count({ where: { organizationId, status: "OPEN" } }),
    prisma.conversation.count({ where: { organizationId, status: "PENDING" } }),
    prisma.conversation.count({ where: { organizationId, status: "RESOLVED" } }),
    prisma.conversation.count({ where: { organizationId, unreadCount: { gt: 0 } } }),
  ]);
  return { open, pending, resolved, unread };
}
