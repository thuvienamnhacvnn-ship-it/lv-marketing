"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/server/tenant";
import { draftCustomerReply } from "@/services/ai/tasks";
import {
  AiNotConfiguredError,
  AiOutputInvalidError,
  AiRequestError,
  isAiConfigured,
} from "@/services/ai/client";
import { AiRateLimitError } from "@/services/ai/runner";
import type { ConversationStatus, MessageDirection } from "@/generated/prisma/enums";

type Result = { ok: true; message?: string } | { ok: false; message: string };

/**
 * Gửi trả lời cho khách.
 *
 * Ghi tin nhắn và cập nhật hội thoại trong cùng một `$transaction`: nếu tin ghi
 * xong mà `lastMessageAt` không cập nhật thì hội thoại tụt xuống cuối danh sách
 * dù vừa mới có động tĩnh.
 *
 * Gửi xong thì `unreadCount` về 0 — đã trả lời tức là đã đọc.
 */
export async function sendReplyAction(
  slug: string,
  conversationId: string,
  body: string,
  direction: MessageDirection = "OUTBOUND",
): Promise<Result> {
  const ctx = await requirePermission(slug, "inbox:reply");

  const text = body.trim();
  if (!text) return { ok: false, message: "Chưa có nội dung để gửi." };
  if (text.length > 5000) return { ok: false, message: "Tin nhắn quá dài." };

  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, organizationId: ctx.organization.id },
    select: { id: true },
  });
  if (!conversation) return { ok: false, message: "Không tìm thấy hội thoại." };

  const now = new Date();
  await prisma.$transaction([
    prisma.message.create({
      data: {
        conversationId,
        senderId: ctx.user.id,
        direction,
        body: text,
        sentAt: now,
      },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: now,
        // Ghi chú nội bộ không phải là trả lời khách nên không đổi trạng thái.
        ...(direction === "OUTBOUND" ? { unreadCount: 0, status: "PENDING" as const } : {}),
      },
    }),
  ]);

  revalidatePath(`/app/${slug}/inbox`);
  return { ok: true, message: direction === "INTERNAL_NOTE" ? "Đã lưu ghi chú." : "Đã gửi." };
}

export async function changeConversationStatusAction(
  slug: string,
  conversationId: string,
  status: ConversationStatus,
): Promise<Result> {
  const ctx = await requirePermission(slug, "inbox:reply");

  const result = await prisma.conversation.updateMany({
    where: { id: conversationId, organizationId: ctx.organization.id },
    data: { status, ...(status === "RESOLVED" ? { unreadCount: 0 } : {}) },
  });
  if (result.count === 0) return { ok: false, message: "Không tìm thấy hội thoại." };

  revalidatePath(`/app/${slug}/inbox`);
  return { ok: true, message: "Đã cập nhật." };
}

/** Đánh dấu đã đọc. Gọi khi mở hội thoại. */
export async function markReadAction(slug: string, conversationId: string): Promise<Result> {
  const ctx = await requirePermission(slug, "inbox:read");
  await prisma.conversation.updateMany({
    where: { id: conversationId, organizationId: ctx.organization.id, unreadCount: { gt: 0 } },
    data: { unreadCount: 0 },
  });
  revalidatePath(`/app/${slug}/inbox`);
  return { ok: true };
}

export type DraftResult =
  | { ok: true; reply: string; language: string; escalate: boolean; escalationReason?: string }
  | { ok: false; reason: string; message: string };

/**
 * Nhờ Claude soạn sẵn câu trả lời.
 *
 * Trả về BẢN NHÁP, không tự gửi. Người thật phải đọc lại rồi mới bấm gửi — câu
 * trả lời sai về giá hay giờ mở cửa đi thẳng tới khách thì không rút lại được.
 */
export async function draftReplyAction(
  slug: string,
  conversationId: string,
): Promise<DraftResult> {
  const ctx = await requirePermission(slug, "ai:generate");

  if (!isAiConfigured()) {
    return {
      ok: false,
      reason: "not_configured",
      message: "Chưa cấu hình ANTHROPIC_API_KEY. Liên hệ quản trị hệ thống để bật.",
    };
  }

  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, organizationId: ctx.organization.id },
    include: { messages: { orderBy: { sentAt: "asc" }, take: 20 } },
  });
  if (!conversation) return { ok: false, reason: "not_found", message: "Không tìm thấy hội thoại." };
  if (conversation.messages.length === 0) {
    return { ok: false, reason: "empty", message: "Hội thoại chưa có tin nhắn nào để dựa vào." };
  }

  try {
    const result = await draftCustomerReply(
      { organizationId: ctx.organization.id, userId: ctx.user.id },
      {
        channel: conversation.channel,
        contactName: conversation.contactName,
        language: conversation.language,
        messages: conversation.messages.map((m) => ({ direction: m.direction, body: m.body })),
      },
    );

    return {
      ok: true,
      reply: result.data.reply,
      language: result.data.language,
      escalate: result.data.escalate,
      escalationReason: result.data.escalationReason ?? undefined,
    };
  } catch (error) {
    if (error instanceof AiRateLimitError) {
      return {
        ok: false,
        reason: "rate_limited",
        message: `Đang quá tải. Thử lại sau ${error.retryAfterSeconds} giây.`,
      };
    }
    if (error instanceof AiNotConfiguredError) {
      return { ok: false, reason: "not_configured", message: error.message };
    }
    if (error instanceof AiOutputInvalidError) {
      return {
        ok: false,
        reason: "invalid_output",
        message: "Claude trả về nội dung không đúng khuôn. Bấm soạn lại thường là xong.",
      };
    }
    if (error instanceof AiRequestError) {
      return { ok: false, reason: "failed", message: error.message };
    }
    return { ok: false, reason: "failed", message: "Không gọi được Claude. Thử lại sau." };
  }
}
