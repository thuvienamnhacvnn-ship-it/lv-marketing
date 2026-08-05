import "server-only";
import { prisma } from "@/lib/prisma";
import {
  CLOSED_STATUSES,
  LEAD_STATUSES,
  OPEN_STATUSES,
  STATUS_LABELS,
  type LeadStatusKey,
} from "@/features/crm/schema";

/**
 * Các cột của bảng phễu.
 *
 * Tên cột lấy từ `PipelineStage` nếu tổ chức đã có, không thì dùng nhãn mặc
 * định. Cột nào cũng phải hiện dù chưa có lead nào — bảng phễu thiếu cột thì
 * không kéo thả vào đó được.
 */
export async function loadPipeline(organizationId: string) {
  const [stages, leads] = await Promise.all([
    prisma.pipelineStage.findMany({
      where: { organizationId },
      orderBy: { position: "asc" },
      select: { id: true, key: true, name: true },
    }),
    prisma.lead.findMany({
      where: { organizationId },
      orderBy: [{ nextFollowUpAt: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }],
      take: 300,
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        source: true,
        need: true,
        note: true,
        status: true,
        consent: true,
        expectedValueCents: true,
        nextFollowUpAt: true,
        closedAt: true,
        createdAt: true,
        owner: { select: { name: true } },
        _count: { select: { activities: true } },
      },
    }),
  ]);

  const named = new Map(stages.map((stage) => [stage.key, stage.name]));

  /*
    "Quá hạn" tính ở đây chứ không ở trình duyệt. Gọi `Date.now()` trong lúc
    render thành phần client thì máy chủ và trình duyệt ra hai mốc khác nhau,
    React báo lệch khi hydrate và thẻ có thể mất viền cảnh báo. Một mốc duy
    nhất cho cả bảng cũng đúng hơn về mặt ý nghĩa.
  */
  const now = Date.now();
  const marked = leads.map((lead) => ({
    ...lead,
    overdue:
      !(CLOSED_STATUSES as readonly string[]).includes(lead.status) &&
      lead.nextFollowUpAt !== null &&
      lead.nextFollowUpAt.getTime() < now,
  }));

  /*
    Gom theo `status` chứ không theo `stageId`. Hai cột này có thể lệch nhau —
    dữ liệu mẫu ban đầu gán mọi lead vào cột "Khách mới" trong khi `status` vẫn
    ghi đúng giai đoạn thật. `status` là enum, luôn có giá trị, nên lấy nó làm
    chuẩn; `stageId` được đồng bộ lại mỗi lần kéo thả.
  */
  const columns = LEAD_STATUSES.map((key) => ({
    key,
    name: named.get(key) ?? STATUS_LABELS[key],
    leads: marked.filter((lead) => lead.status === key),
  }));

  return { columns, total: marked.length };
}

export async function loadCrmStats(organizationId: string) {
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  const [openAggregate, wonThisMonth, lostThisMonth, overdue, dueSoon, customers, consented] =
    await Promise.all([
      prisma.lead.aggregate({
        where: { organizationId, status: { in: OPEN_STATUSES as LeadStatusKey[] } },
        _sum: { expectedValueCents: true },
        _count: true,
      }),
      prisma.lead.aggregate({
        where: { organizationId, status: "WON", closedAt: { gte: monthStart } },
        _sum: { expectedValueCents: true },
        _count: true,
      }),
      prisma.lead.count({
        where: { organizationId, status: "LOST", closedAt: { gte: monthStart } },
      }),
      // Quá hạn theo dõi: đã hẹn ngày liên hệ lại mà ngày đó trôi qua rồi.
      prisma.lead.count({
        where: {
          organizationId,
          status: { notIn: CLOSED_STATUSES as unknown as LeadStatusKey[] },
          nextFollowUpAt: { lt: now },
        },
      }),
      prisma.lead.count({
        where: {
          organizationId,
          status: { notIn: CLOSED_STATUSES as unknown as LeadStatusKey[] },
          nextFollowUpAt: {
            gte: now,
            lt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.customer.count({ where: { organizationId } }),
      prisma.customer.count({ where: { organizationId, marketingConsent: true, optedOutAt: null } }),
    ]);

  const closedThisMonth = wonThisMonth._count + lostThisMonth;

  return {
    openCount: openAggregate._count,
    // Chỉ cộng giá trị của lead còn mở. Gộp cả WON/LOST vào đây thì con số
    // "đang theo đuổi" phình lên theo lịch sử và mất hết ý nghĩa.
    openValueCents: openAggregate._sum.expectedValueCents ?? 0,
    wonCount: wonThisMonth._count,
    wonValueCents: wonThisMonth._sum.expectedValueCents ?? 0,
    winRate: closedThisMonth > 0 ? Math.round((wonThisMonth._count / closedThisMonth) * 100) : null,
    overdue,
    dueSoon,
    customers,
    consented,
  };
}

/** Nhật ký của một lead, mới nhất lên trước. */
export async function loadLeadActivities(organizationId: string, leadId: string) {
  return prisma.leadActivity.findMany({
    where: { leadId, lead: { organizationId } },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      type: true,
      content: true,
      createdAt: true,
      user: { select: { name: true } },
    },
  });
}

export async function loadCustomers(organizationId: string, search = "") {
  const query = search.trim();

  return prisma.customer.findMany({
    where: {
      organizationId,
      ...(query
        ? {
            OR: [
              { fullName: { contains: query, mode: "insensitive" as const } },
              { email: { contains: query, mode: "insensitive" as const } },
              { phone: { contains: query } },
            ],
          }
        : {}),
    },
    orderBy: [{ lastVisitAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
    take: 100,
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      language: true,
      marketingConsent: true,
      optedOutAt: true,
      lastVisitAt: true,
      totalVisits: true,
      totalSpentCents: true,
      tags: { select: { tag: { select: { name: true, color: true } } } },
      loyalty: { select: { points: true } },
    },
  });
}
