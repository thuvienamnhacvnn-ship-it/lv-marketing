import "server-only";
import { prisma } from "@/lib/prisma";
import type { Sentiment } from "@/generated/prisma/enums";

export type ReviewFilter = "ALL" | "UNANSWERED" | Sentiment;

/**
 * Danh sách đánh giá.
 *
 * Mặc định đưa bài CHƯA TRẢ LỜI lên trước, trong đó bài tiêu cực lên đầu. Xếp
 * thuần theo ngày thì một đánh giá 1 sao chưa ai đụng tới sẽ trôi mất sau vài
 * tuần, mà đó lại đúng là thứ cần xử lý sớm nhất.
 */
export async function loadReviews(organizationId: string, filter: ReviewFilter = "ALL") {
  const where = {
    organizationId,
    ...(filter === "UNANSWERED"
      ? { replies: { none: {} } }
      : filter === "ALL"
        ? {}
        : { sentiment: filter }),
  };

  const reviews = await prisma.review.findMany({
    where,
    orderBy: [{ postedAt: "desc" }],
    take: 60,
    include: {
      replies: { orderBy: { createdAt: "desc" } },
    },
  });

  // Sắp xếp lần hai trong bộ nhớ: Prisma không xếp được theo "có trả lời chưa"
  // kết hợp với mức độ tiêu cực trong một truy vấn.
  const weight = (r: (typeof reviews)[number]) => {
    const answered = r.replies.length > 0 ? 1 : 0;
    const severity = r.sentiment === "NEGATIVE" ? 0 : r.sentiment === "NEUTRAL" ? 1 : 2;
    return answered * 10 + severity;
  };
  return reviews.sort((a, b) => weight(a) - weight(b) || +b.postedAt - +a.postedAt);
}

export async function loadReviewStats(organizationId: string) {
  const [aggregate, total, unanswered, negativeOpen, distribution, last30] = await Promise.all([
    prisma.review.aggregate({ where: { organizationId }, _avg: { rating: true } }),
    prisma.review.count({ where: { organizationId } }),
    prisma.review.count({ where: { organizationId, replies: { none: {} } } }),
    prisma.review.count({
      where: { organizationId, sentiment: "NEGATIVE", replies: { none: {} } },
    }),
    prisma.review.groupBy({
      by: ["rating"],
      where: { organizationId },
      _count: { rating: true },
    }),
    prisma.review.count({
      where: {
        organizationId,
        postedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  const byRating = new Map(distribution.map((row) => [row.rating, row._count.rating]));
  const average = aggregate._avg.rating;

  return {
    average: average === null ? null : Math.round(average * 10) / 10,
    total,
    unanswered,
    negativeOpen,
    last30,
    distribution: [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: byRating.get(star) ?? 0,
      percent: total > 0 ? Math.round(((byRating.get(star) ?? 0) / total) * 100) : 0,
    })),
  };
}
