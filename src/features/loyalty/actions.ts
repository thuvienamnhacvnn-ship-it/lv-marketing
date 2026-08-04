"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/server/tenant";

type ActionResult = { ok: true; message: string } | { ok: false; message: string };

/**
 * Cộng điểm từ một hoá đơn.
 *
 * Toàn bộ nằm trong một `$transaction`. Đọc số dư rồi ghi ở hai lệnh rời nhau sẽ
 * sai khi hai máy tính tiền cùng quét một khách: cả hai đọc ra số dư cũ, cả hai
 * cộng lên từ đó, mất một giao dịch.
 *
 * `receiptRef` có ràng buộc duy nhất theo tổ chức — mỗi hoá đơn chỉ tích điểm
 * được một lần, kể cả khi nhân viên bấm hai lần.
 */
export async function earnPointsAction(
  slug: string,
  input: { customerId: string; amountEuro: number; receiptRef?: string; note?: string },
): Promise<ActionResult> {
  const ctx = await requirePermission(slug, "loyalty:manage");

  const amountCents = Math.round(input.amountEuro * 100);
  if (!Number.isFinite(amountCents) || amountCents <= 0) {
    return { ok: false, message: "Số tiền hoá đơn phải lớn hơn 0." };
  }
  if (amountCents > 10_000_00) {
    return { ok: false, message: "Hoá đơn trên 10.000 € — nhập tay không được, cần duyệt riêng." };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const account = await tx.loyaltyAccount.findFirst({
        where: { organizationId: ctx.organization.id, customerId: input.customerId },
      });
      if (!account) throw new Error("NO_ACCOUNT");
      if (account.isBlocked) throw new Error("BLOCKED");

      // Hệ số nhân của hạng: khách hạng cao tích nhanh hơn.
      const membership = await tx.customerMembership.findUnique({
        where: { customerId: input.customerId },
        include: { tier: true },
      });
      const multiplier = membership?.tier.pointsMultiplier ?? 1;
      const points = Math.floor((amountCents / 100) * multiplier);
      if (points <= 0) throw new Error("TOO_SMALL");

      const balanceAfter = account.points + points;

      await tx.pointTransaction.create({
        data: {
          organizationId: ctx.organization.id,
          customerId: input.customerId,
          staffId: ctx.user.id,
          type: "EARN",
          amountCents,
          points,
          balanceBefore: account.points,
          balanceAfter,
          receiptRef: input.receiptRef?.trim() || `MAN-${randomUUID().slice(0, 12)}`,
          note: input.note?.trim() || null,
        },
      });

      await tx.loyaltyAccount.update({
        where: { id: account.id },
        data: { points: balanceAfter, totalEarned: account.totalEarned + points },
      });

      // Xét lên hạng theo điểm tích luỹ trọn đời, không theo số dư.
      const lifetime = account.totalEarned + points;
      const tier = await tx.membershipTier.findFirst({
        where: { organizationId: ctx.organization.id, minPoints: { lte: lifetime } },
        orderBy: { minPoints: "desc" },
      });
      if (tier && tier.id !== membership?.tierId) {
        await tx.customerMembership.upsert({
          where: { customerId: input.customerId },
          create: {
            organizationId: ctx.organization.id,
            customerId: input.customerId,
            tierId: tier.id,
          },
          update: { tierId: tier.id, since: new Date() },
        });
      }

      return { points, balanceAfter, tierName: tier?.name };
    });

    revalidatePath(`/app/${slug}/loyalty`);
    return {
      ok: true,
      message: `Đã cộng ${result.points} điểm. Số dư mới: ${result.balanceAfter}.`,
    };
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "NO_ACCOUNT") return { ok: false, message: "Khách chưa có thẻ thành viên." };
    if (code === "BLOCKED") return { ok: false, message: "Thẻ đang bị khoá." };
    if (code === "TOO_SMALL") return { ok: false, message: "Hoá đơn quá nhỏ để ra điểm." };
    // Vi phạm ràng buộc duy nhất của receiptRef.
    if (code.includes("Unique") || code.includes("P2002")) {
      return { ok: false, message: "Hoá đơn này đã được tích điểm rồi." };
    }
    return { ok: false, message: "Không cộng được điểm. Thử lại sau." };
  }
}

/** Đổi quà: trừ điểm và ghi phiếu đổi. Không đủ điểm thì không trừ gì cả. */
export async function redeemRewardAction(
  slug: string,
  input: { customerId: string; rewardId: string },
): Promise<ActionResult> {
  const ctx = await requirePermission(slug, "loyalty:manage");

  try {
    const result = await prisma.$transaction(async (tx) => {
      const [account, reward] = await Promise.all([
        tx.loyaltyAccount.findFirst({
          where: { organizationId: ctx.organization.id, customerId: input.customerId },
        }),
        tx.reward.findFirst({
          where: { id: input.rewardId, organizationId: ctx.organization.id, status: "ACTIVE" },
        }),
      ]);
      if (!account) throw new Error("NO_ACCOUNT");
      if (!reward) throw new Error("NO_REWARD");
      if (account.isBlocked) throw new Error("BLOCKED");
      if (account.points < reward.pointsCost) throw new Error("NOT_ENOUGH");
      if (reward.stock !== null && reward.stock <= 0) throw new Error("OUT_OF_STOCK");

      const balanceAfter = account.points - reward.pointsCost;

      await tx.pointTransaction.create({
        data: {
          organizationId: ctx.organization.id,
          customerId: input.customerId,
          staffId: ctx.user.id,
          type: "REDEEM",
          points: -reward.pointsCost,
          balanceBefore: account.points,
          balanceAfter,
          note: `Đổi quà: ${reward.name}`,
        },
      });

      await tx.loyaltyAccount.update({
        where: { id: account.id },
        data: { points: balanceAfter, totalRedeemed: account.totalRedeemed + reward.pointsCost },
      });

      await tx.rewardRedemption.create({
        data: {
          organizationId: ctx.organization.id,
          rewardId: reward.id,
          customerId: input.customerId,
          pointsSpent: reward.pointsCost,
          status: "FULFILLED",
        },
      });

      if (reward.stock !== null) {
        await tx.reward.update({
          where: { id: reward.id },
          data: {
            stock: reward.stock - 1,
            status: reward.stock - 1 <= 0 ? "OUT_OF_STOCK" : "ACTIVE",
          },
        });
      }

      return { name: reward.name, balanceAfter };
    });

    revalidatePath(`/app/${slug}/loyalty`);
    return { ok: true, message: `Đã đổi "${result.name}". Số dư còn ${result.balanceAfter}.` };
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "NO_ACCOUNT") return { ok: false, message: "Khách chưa có thẻ thành viên." };
    if (code === "NO_REWARD") return { ok: false, message: "Quà không còn hiệu lực." };
    if (code === "BLOCKED") return { ok: false, message: "Thẻ đang bị khoá." };
    if (code === "NOT_ENOUGH") return { ok: false, message: "Khách không đủ điểm." };
    if (code === "OUT_OF_STOCK") return { ok: false, message: "Quà đã hết." };
    return { ok: false, message: "Không đổi được quà. Thử lại sau." };
  }
}

/**
 * Đổi `qrSecret` — vô hiệu hoá mọi thẻ QR đã phát cho khách này.
 * Dùng khi khách báo mất điện thoại hoặc bị chụp trộm mã.
 */
export async function rotateCardSecretAction(
  slug: string,
  customerId: string,
): Promise<ActionResult> {
  const ctx = await requirePermission(slug, "loyalty:manage");

  const result = await prisma.loyaltyAccount.updateMany({
    where: { organizationId: ctx.organization.id, customerId },
    data: { qrSecret: randomUUID() },
  });
  if (result.count === 0) return { ok: false, message: "Không tìm thấy thẻ." };

  revalidatePath(`/app/${slug}/loyalty`);
  return { ok: true, message: "Đã cấp mã QR mới. Thẻ cũ không dùng được nữa." };
}
