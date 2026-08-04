import "server-only";
import { prisma } from "@/lib/prisma";
import type { WorkspaceSnapshot } from "@/services/ai/tasks";

/**
 * Số liệu tổng quan của một workspace.
 *
 * Trả về đúng shape `WorkspaceSnapshot` mà `buildDailyBrief` trong
 * `src/services/ai/tasks.ts` yêu cầu — cùng một phép đếm phục vụ cả màn hình
 * Tổng quan lẫn bản tóm tắt hằng ngày do AI viết, nên hai nơi không bao giờ lệch số.
 *
 * Gom vào một `$transaction`: 11 lượt đếm chạy tuần tự sẽ tốn 11 vòng đi–về tới
 * database, mỗi lần dựng lại trang là một lần trả giá.
 */
export async function loadWorkspaceSnapshot(organizationId: string): Promise<WorkspaceSnapshot> {
  const now = new Date();
  const days = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000);
  const last7 = days(7);
  const last30 = days(30);
  const weekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [
    publishedLast7Days,
    waitingApproval,
    scheduledThisWeek,
    unreadConversations,
    newCustomers30Days,
    newReviews7Days,
    ratingAggregate,
    negativeReviewsOpen,
    runningCampaigns,
    newLeads,
    overdueFollowUps,
  ] = await Promise.all([
    prisma.publishedPost.count({
      where: { organizationId, publishedAt: { gte: last7 } },
    }),
    prisma.contentItem.count({ where: { organizationId, status: "WAITING_APPROVAL" } }),
    prisma.contentSchedule.count({
      where: { organizationId, status: "PENDING", scheduledFor: { gte: now, lte: weekAhead } },
    }),
    prisma.conversation.count({
      where: { organizationId, unreadCount: { gt: 0 }, status: { in: ["OPEN", "PENDING"] } },
    }),
    prisma.customer.count({ where: { organizationId, createdAt: { gte: last30 } } }),
    prisma.review.count({ where: { organizationId, postedAt: { gte: last7 } } }),
    prisma.review.aggregate({ where: { organizationId }, _avg: { rating: true } }),
    prisma.review.count({
      where: { organizationId, sentiment: "NEGATIVE", replies: { none: {} } },
    }),
    prisma.campaign.count({ where: { organizationId, status: "RUNNING" } }),
    prisma.lead.count({ where: { organizationId, status: "NEW" } }),
    prisma.lead.count({
      where: {
        organizationId,
        closedAt: null,
        nextFollowUpAt: { lt: now },
      },
    }),
  ]);

  const average = ratingAggregate._avg.rating;

  return {
    date: now.toISOString().slice(0, 10),
    publishedLast7Days,
    waitingApproval,
    scheduledThisWeek,
    unreadConversations,
    newCustomers30Days,
    newReviews7Days,
    // Làm tròn một chữ số: điểm đánh giá hiển thị dạng "4,8" chứ không phải "4,7666…".
    averageRating: average === null ? null : Math.round(average * 10) / 10,
    negativeReviewsOpen,
    runningCampaigns,
    newLeads,
    overdueFollowUps,
  };
}

/** Vài việc gần đây để màn hình Tổng quan không chỉ toàn con số. */
export async function loadRecentActivity(organizationId: string) {
  const [content, conversations, reviews] = await Promise.all([
    prisma.contentItem.findMany({
      where: { organizationId },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, title: true, status: true, type: true, targetDate: true },
    }),
    prisma.conversation.findMany({
      where: { organizationId },
      orderBy: { lastMessageAt: "desc" },
      take: 5,
      select: {
        id: true,
        contactName: true,
        channel: true,
        status: true,
        unreadCount: true,
        lastMessageAt: true,
        messages: { orderBy: { sentAt: "desc" }, take: 1, select: { body: true } },
      },
    }),
    prisma.review.findMany({
      where: { organizationId },
      orderBy: { postedAt: "desc" },
      take: 4,
      select: { id: true, authorName: true, rating: true, body: true, sentiment: true, postedAt: true },
    }),
  ]);

  return { content, conversations, reviews };
}
