import { z } from "zod";

export const CONTENT_TYPES = [
  "FACEBOOK_POST",
  "INSTAGRAM_CAPTION",
  "TIKTOK_SCRIPT",
  "GOOGLE_BUSINESS_POST",
  "BLOG_ARTICLE",
  "NEWSLETTER",
  "WHATSAPP_MESSAGE",
  "PROMOTION",
  "EVENT_ANNOUNCEMENT",
  "MENU_DESCRIPTION",
] as const;

export const CONTENT_STATUSES = [
  "IDEA",
  "DRAFT",
  "WAITING_APPROVAL",
  "APPROVED",
  "SCHEDULED",
  "PUBLISHED",
  "ARCHIVED",
] as const;

export const LANGUAGES = ["VI", "DE", "BOTH"] as const;

/** `dayKey` là chuỗi YYYY-MM-DD, không phải Date — xem chú thích ở actions.ts. */
const dayKey = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày không hợp lệ")
  .nullable()
  .optional();

export const contentFormSchema = z.object({
  title: z.string().trim().min(2, "Tiêu đề quá ngắn").max(200),
  body: z.string().trim().min(1, "Chưa có nội dung").max(20000),
  type: z.enum(CONTENT_TYPES),
  status: z.enum(CONTENT_STATUSES),
  language: z.enum(LANGUAGES),
  callToAction: z.string().trim().max(160).optional(),
  hashtags: z.string().trim().max(500).optional(),
  targetDate: dayKey,
});

export type ContentFormInput = z.infer<typeof contentFormSchema>;

export type ContentFormResult =
  | { ok: true; id: string; message: string }
  | { ok: false; message: string; fields?: Record<string, string> };

/**
 * Những chuyển trạng thái được phép.
 *
 * Không cho nhảy thẳng từ nháp sang "đã đăng": trạng thái đó chỉ được đặt bởi
 * tiến trình đăng bài thật, đặt tay sẽ khiến số liệu báo cáo sai mà không ai
 * biết vì sao. Từ "đã đăng" cũng không quay lui được — bài đã ra ngoài rồi.
 */
export const ALLOWED_TRANSITIONS: Record<string, readonly string[]> = {
  IDEA: ["DRAFT", "ARCHIVED"],
  DRAFT: ["IDEA", "WAITING_APPROVAL", "ARCHIVED"],
  WAITING_APPROVAL: ["DRAFT", "APPROVED", "ARCHIVED"],
  APPROVED: ["WAITING_APPROVAL", "SCHEDULED", "ARCHIVED"],
  SCHEDULED: ["APPROVED", "ARCHIVED"],
  PUBLISHED: ["ARCHIVED"],
  ARCHIVED: ["DRAFT"],
};
