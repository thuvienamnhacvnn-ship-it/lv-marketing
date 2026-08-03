"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/server/tenant";
import { generateContent } from "@/services/ai/tasks";
import {
  AiNotConfiguredError,
  AiOutputInvalidError,
  AiRequestError,
  isAiConfigured,
} from "@/services/ai/client";
import { AiRateLimitError } from "@/services/ai/runner";
import { briefSchema, type StudioResult } from "@/features/studio/schema";
import type { ContentType } from "@/generated/prisma/enums";

/**
 * Sinh nội dung bằng Claude từ bản khai của người dùng.
 *
 * Mỗi loại lỗi trả về một `reason` riêng thay vì gộp thành "có lỗi": người dùng
 * cần biết nên bấm thử lại (quá tải), sửa bản khai (dữ liệu sai), hay đi báo
 * quản trị (chưa cấu hình khoá API). Gộp một chỗ là để họ mò mẫm.
 */
export async function generateContentAction(
  slug: string,
  raw: unknown,
): Promise<StudioResult> {
  const ctx = await requirePermission(slug, "ai:generate");

  const parsed = briefSchema.safeParse(raw);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fields[key]) fields[key] = issue.message;
    }
    return { ok: false, reason: "validation", message: "Bản khai chưa hợp lệ.", fields };
  }

  // Kiểm trước khi gọi để không tốn một vòng đi–về chỉ để nhận lỗi cấu hình.
  if (!isAiConfigured()) {
    return {
      ok: false,
      reason: "not_configured",
      message:
        "Chưa cấu hình ANTHROPIC_API_KEY nên không gọi được Claude. Đây là thiếu sót cấu hình máy chủ, không phải lỗi của bản khai.",
    };
  }

  try {
    const result = await generateContent(
      { organizationId: ctx.organization.id, userId: ctx.user.id },
      parsed.data,
    );

    return {
      ok: true,
      variants: result.data.variants,
      complianceNotes: result.data.complianceNotes,
      imagePrompt: result.data.imagePrompt,
      generationId: result.generationId,
      costMicroCents: result.usage.costMicroCents,
      latencyMs: result.usage.latencyMs,
    };
  } catch (error) {
    if (error instanceof AiRateLimitError) {
      return {
        ok: false,
        reason: "rate_limited",
        message: `Đã chạm giới hạn số lần gọi. Thử lại sau ${error.retryAfterSeconds} giây.`,
        retryAfterSeconds: error.retryAfterSeconds,
      };
    }
    if (error instanceof AiNotConfiguredError) {
      return { ok: false, reason: "not_configured", message: error.message };
    }
    if (error instanceof AiOutputInvalidError) {
      return {
        ok: false,
        reason: "invalid_output",
        message:
          "Claude trả về nội dung không đúng khuôn. Bản ghi đã được lưu lại để xem sau — bấm tạo lại thường là xong.",
      };
    }
    if (error instanceof AiRequestError) {
      return { ok: false, reason: "failed", message: error.message };
    }
    return { ok: false, reason: "failed", message: "Không gọi được Claude. Thử lại sau ít phút." };
  }
}

/** Lưu một phương án đã chọn thành nội dung nháp trong Content Calendar. */
export async function saveVariantAction(
  slug: string,
  input: {
    title: string;
    body: string;
    hashtags: string[];
    callToAction: string;
    contentType: string;
    language: "vi" | "de" | "both";
  },
): Promise<{ ok: true; id: string } | { ok: false; message: string }> {
  const ctx = await requirePermission(slug, "content:create");

  try {
    const item = await prisma.contentItem.create({
      data: {
        organizationId: ctx.organization.id,
        authorId: ctx.user.id,
        title: input.title.slice(0, 200),
        type: input.contentType as ContentType,
        status: "DRAFT",
        // Từ điển dùng "both", còn enum của Prisma là BOTH/VI/DE.
        language: input.language === "both" ? "BOTH" : input.language === "de" ? "DE" : "VI",
        body: input.body,
        hashtags: input.hashtags.slice(0, 15),
        callToAction: input.callToAction || null,
      },
      select: { id: true },
    });

    revalidatePath(`/app/${slug}/studio`);
    return { ok: true, id: item.id };
  } catch {
    return { ok: false, message: "Không lưu được nội dung. Thử lại sau." };
  }
}
