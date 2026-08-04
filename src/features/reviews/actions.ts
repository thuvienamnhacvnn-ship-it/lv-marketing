"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/server/tenant";
import { draftReviewReply } from "@/services/ai/tasks";
import {
  AiNotConfiguredError,
  AiOutputInvalidError,
  AiRequestError,
  isAiConfigured,
} from "@/services/ai/client";
import { AiRateLimitError } from "@/services/ai/runner";

type Result = { ok: true; message: string } | { ok: false; message: string };

/**
 * Lưu phản hồi cho một đánh giá.
 *
 * `publishedAt` đặt luôn vì hiện chưa nối API Google — nhân viên tự dán câu này
 * lên Google Business. Khi nào có kết nối thật thì để `null` cho tới lúc đăng
 * xong, và cột đó sẽ phân biệt được "đã soạn" với "đã lên Google".
 */
export async function saveReviewReplyAction(
  slug: string,
  reviewId: string,
  body: string,
  isAiDraft = false,
): Promise<Result> {
  const ctx = await requirePermission(slug, "review:reply");

  const text = body.trim();
  if (!text) return { ok: false, message: "Chưa có nội dung phản hồi." };
  if (text.length > 4000) return { ok: false, message: "Phản hồi quá dài." };

  const review = await prisma.review.findFirst({
    where: { id: reviewId, organizationId: ctx.organization.id },
    select: { id: true },
  });
  if (!review) return { ok: false, message: "Không tìm thấy đánh giá." };

  await prisma.reviewReply.create({
    data: {
      reviewId,
      authorId: ctx.user.id,
      body: text,
      isAiDraft,
      publishedAt: new Date(),
    },
  });

  revalidatePath(`/app/${slug}/reviews`);
  return { ok: true, message: "Đã lưu phản hồi." };
}

export async function deleteReviewReplyAction(
  slug: string,
  replyId: string,
): Promise<Result> {
  const ctx = await requirePermission(slug, "review:reply");

  // Lọc qua quan hệ review để chặn xoá phản hồi của tenant khác.
  const result = await prisma.reviewReply.deleteMany({
    where: { id: replyId, review: { organizationId: ctx.organization.id } },
  });
  if (result.count === 0) return { ok: false, message: "Không tìm thấy phản hồi." };

  revalidatePath(`/app/${slug}/reviews`);
  return { ok: true, message: "Đã xoá phản hồi." };
}

export type ReviewDraftResult =
  | { ok: true; reply: string; escalate: boolean; escalationReason?: string }
  | { ok: false; message: string };

/** Nhờ Claude soạn phản hồi. Trả về bản nháp, người thật đọc lại rồi mới lưu. */
export async function draftReviewReplyAction(
  slug: string,
  reviewId: string,
): Promise<ReviewDraftResult> {
  const ctx = await requirePermission(slug, "ai:generate");

  if (!isAiConfigured()) {
    return {
      ok: false,
      message: "Chưa cấu hình ANTHROPIC_API_KEY. Liên hệ quản trị hệ thống để bật.",
    };
  }

  const review = await prisma.review.findFirst({
    where: { id: reviewId, organizationId: ctx.organization.id },
  });
  if (!review) return { ok: false, message: "Không tìm thấy đánh giá." };

  try {
    const result = await draftReviewReply(
      { organizationId: ctx.organization.id, userId: ctx.user.id },
      {
        authorName: review.authorName,
        rating: review.rating,
        body: review.body,
        language: review.language,
        source: review.source,
      },
    );
    return {
      ok: true,
      reply: result.data.reply,
      escalate: result.data.escalate,
      escalationReason: result.data.escalationReason || undefined,
    };
  } catch (error) {
    if (error instanceof AiRateLimitError) {
      return { ok: false, message: `Đang quá tải. Thử lại sau ${error.retryAfterSeconds} giây.` };
    }
    if (error instanceof AiNotConfiguredError) return { ok: false, message: error.message };
    if (error instanceof AiOutputInvalidError) {
      return { ok: false, message: "Claude trả về nội dung không đúng khuôn. Bấm soạn lại." };
    }
    if (error instanceof AiRequestError) return { ok: false, message: error.message };
    return { ok: false, message: "Không gọi được Claude. Thử lại sau." };
  }
}
