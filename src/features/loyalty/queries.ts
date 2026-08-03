import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Số liệu cho màn hình Loyalty.
 *
 * Điểm đang lưu hành (`pointsOutstanding`) là tổng số dư của mọi thành viên —
 * đây là một khoản NỢ của quán với khách, không phải doanh thu. Chủ quán cần
 * nhìn thấy con số này để biết mình đang gánh bao nhiêu trước khi tăng tỉ lệ
 * tích điểm.
 */
export async function loadLoyaltyOverview(organizationId: string) {
  const now = new Date();
  const last30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [program, tiers, accountAggregate, memberCount, newMembers30d, earned30d, redeemed30d, rewards, vouchers] =
    await prisma.$transaction([
      prisma.loyaltyProgram.findFirst({
        where: { organizationId, isActive: true },
        include: { rules: { where: { isActive: true }, orderBy: { value: "desc" } } },
      }),
      prisma.membershipTier.findMany({
        where: { organizationId },
        orderBy: { level: "asc" },
        include: { _count: { select: { memberships: true } } },
      }),
      prisma.loyaltyAccount.aggregate({
        where: { organizationId },
        _sum: { points: true, totalEarned: true, totalRedeemed: true },
      }),
      prisma.loyaltyAccount.count({ where: { organizationId } }),
      prisma.loyaltyAccount.count({ where: { organizationId, joinedAt: { gte: last30 } } }),
      prisma.pointTransaction.aggregate({
        where: { organizationId, points: { gt: 0 }, createdAt: { gte: last30 } },
        _sum: { points: true },
      }),
      prisma.pointTransaction.aggregate({
        where: { organizationId, points: { lt: 0 }, createdAt: { gte: last30 } },
        _sum: { points: true },
      }),
      prisma.reward.count({ where: { organizationId, status: "ACTIVE" } }),
      prisma.voucher.count({ where: { organizationId, status: "ACTIVE" } }),
    ]);

  return {
    program,
    tiers,
    memberCount,
    newMembers30d,
    pointsOutstanding: accountAggregate._sum.points ?? 0,
    lifetimeEarned: accountAggregate._sum.totalEarned ?? 0,
    lifetimeRedeemed: accountAggregate._sum.totalRedeemed ?? 0,
    earned30d: earned30d._sum.points ?? 0,
    // Tổng của các giao dịch âm nên đảo dấu để hiển thị.
    redeemed30d: Math.abs(redeemed30d._sum.points ?? 0),
    activeRewards: rewards,
    activeVouchers: vouchers,
  };
}

/** Danh sách thành viên, xếp theo điểm tích luỹ để thấy ngay ai gắn bó nhất. */
export async function loadMembers(organizationId: string, take = 20) {
  const accounts = await prisma.loyaltyAccount.findMany({
    where: { organizationId },
    orderBy: { totalEarned: "desc" },
    take,
    include: {
      customer: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          lastVisitAt: true,
          membership: { include: { tier: { select: { name: true, color: true, level: true } } } },
        },
      },
    },
  });
  return accounts;
}

/** Vài giao dịch điểm gần nhất — để chủ quán liếc qua là biết hôm nay có gì. */
export async function loadRecentPointTransactions(organizationId: string, take = 8) {
  return prisma.pointTransaction.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    take,
    include: { customer: { select: { fullName: true } } },
  });
}

/** Quà và voucher đang mở, kèm số lần đã phát. */
export async function loadRewardsAndVouchers(organizationId: string) {
  const [rewards, vouchers] = await prisma.$transaction([
    prisma.reward.findMany({
      where: { organizationId },
      orderBy: { pointsCost: "asc" },
      include: { _count: { select: { redemptions: true } } },
    }),
    prisma.voucher.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { issued: true } } },
    }),
  ]);
  return { rewards, vouchers };
}
