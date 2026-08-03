import { z } from "zod";
import type { ContentVariant } from "@/services/ai/schemas";

/** Kênh đăng — nhãn hiển thị nằm ở component, đây chỉ là giá trị hợp lệ. */
export const CHANNELS = [
  "INSTAGRAM",
  "FACEBOOK",
  "TIKTOK",
  "GOOGLE_BUSINESS",
  "WHATSAPP",
  "EMAIL",
] as const;

export const CONTENT_TYPES = [
  "INSTAGRAM_CAPTION",
  "FACEBOOK_POST",
  "TIKTOK_SCRIPT",
  "GOOGLE_BUSINESS_POST",
  "PROMOTION",
  "EVENT_ANNOUNCEMENT",
  "MENU_DESCRIPTION",
] as const;

export const briefSchema = z.object({
  goal: z.string().trim().min(3, "Hãy nói rõ bạn muốn đạt điều gì").max(200),
  channel: z.enum(CHANNELS),
  contentType: z.enum(CONTENT_TYPES),
  language: z.enum(["vi", "de", "both"]),
  tone: z.string().trim().min(2).max(120),
  length: z.enum(["short", "medium", "long"]),
  product: z.string().trim().max(200).optional(),
  promotion: z.string().trim().max(300).optional(),
  callToAction: z.string().trim().max(160).optional(),
  extraNotes: z.string().trim().max(500).optional(),
  variantCount: z.coerce.number().int().min(1).max(4),
});

export type BriefInput = z.infer<typeof briefSchema>;

/**
 * Kết quả trả về cho giao diện.
 *
 * Mọi nhánh hỏng đều có `reason` riêng để màn hình nói đúng chuyện gì đã xảy ra.
 * Gộp hết thành một câu "có lỗi" thì người dùng không biết nên thử lại, sửa nội
 * dung, hay đi báo quản trị.
 */
export type StudioResult =
  | {
      ok: true;
      variants: ContentVariant[];
      complianceNotes: string[];
      imagePrompt: string;
      generationId: string;
      costMicroCents: number;
      latencyMs: number;
    }
  | {
      ok: false;
      reason: "validation" | "not_configured" | "rate_limited" | "invalid_output" | "failed";
      message: string;
      /** Chỉ có ở `rate_limited` — số giây phải chờ. */
      retryAfterSeconds?: number;
      fields?: Record<string, string>;
    };
