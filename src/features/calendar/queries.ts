import "server-only";
import { prisma } from "@/lib/prisma";

/** Khoảng thời gian của lưới lịch tháng, tính cả phần tràn sang tháng kề. */
export function monthRange(year: number, month: number) {
  const first = new Date(Date.UTC(year, month, 1));
  // Lưới bắt đầu từ thứ Hai. getUTCDay(): 0 = Chủ nhật.
  const offset = (first.getUTCDay() + 6) % 7;
  const gridStart = new Date(first);
  gridStart.setUTCDate(first.getUTCDate() - offset);
  const gridEnd = new Date(gridStart);
  gridEnd.setUTCDate(gridStart.getUTCDate() + 42);
  return { first, gridStart, gridEnd };
}

/**
 * Nội dung của một tháng, gom theo ngày.
 *
 * Khoá của map là chuỗi `YYYY-MM-DD` chứ không phải đối tượng Date: so sánh Date
 * theo tham chiếu luôn sai, còn so theo timestamp thì lệch múi giờ làm bài nhảy
 * sang ngày khác.
 */
export async function loadMonthContent(organizationId: string, year: number, month: number) {
  const { gridStart, gridEnd } = monthRange(year, month);

  const items = await prisma.contentItem.findMany({
    where: {
      organizationId,
      targetDate: { gte: gridStart, lt: gridEnd },
    },
    orderBy: { targetDate: "asc" },
    select: {
      id: true,
      title: true,
      body: true,
      status: true,
      type: true,
      language: true,
      callToAction: true,
      hashtags: true,
      targetDate: true,
    },
  });

  const byDay = new Map<string, typeof items>();
  for (const item of items) {
    if (!item.targetDate) continue;
    const key = item.targetDate.toISOString().slice(0, 10);
    const bucket = byDay.get(key);
    if (bucket) bucket.push(item);
    else byDay.set(key, [item]);
  }

  return { items, byDay };
}

/** Nội dung chưa xếp lịch — phải thấy được, nếu không nó nằm im mãi mãi. */
export async function loadUnscheduled(organizationId: string, take = 12) {
  return prisma.contentItem.findMany({
    where: { organizationId, targetDate: null },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      title: true,
      body: true,
      status: true,
      type: true,
      language: true,
      callToAction: true,
      hashtags: true,
      targetDate: true,
    },
  });
}

export async function loadMonthSummary(organizationId: string, year: number, month: number) {
  const { gridStart, gridEnd } = monthRange(year, month);
  const where = { organizationId, targetDate: { gte: gridStart, lt: gridEnd } };

  const [total, waiting, approved, scheduled, published, unscheduled] = await prisma.$transaction([
    prisma.contentItem.count({ where }),
    prisma.contentItem.count({ where: { ...where, status: "WAITING_APPROVAL" } }),
    prisma.contentItem.count({ where: { ...where, status: "APPROVED" } }),
    prisma.contentItem.count({ where: { ...where, status: "SCHEDULED" } }),
    prisma.contentItem.count({ where: { ...where, status: "PUBLISHED" } }),
    prisma.contentItem.count({ where: { organizationId, targetDate: null } }),
  ]);

  return { total, waiting, approved, scheduled, published, unscheduled };
}
