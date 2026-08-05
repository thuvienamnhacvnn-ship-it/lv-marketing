import { z } from "zod";

/**
 * Bảy cột của phễu, đúng thứ tự khách đi qua.
 *
 * `PipelineStage` trong CSDL giữ tên hiển thị và vị trí để sau này chủ quán tự
 * đổi tên cột; còn đây là danh sách khoá cố định, dùng khi tổ chức chưa kịp có
 * bản ghi cột nào.
 */
export const LEAD_STATUSES = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "APPOINTMENT",
  "PROPOSAL",
  "WON",
  "LOST",
] as const;

export type LeadStatusKey = (typeof LEAD_STATUSES)[number];

/** Hai cột kết thúc. Lead nằm ở đây coi như đã đóng, không tính vào phễu nữa. */
export const CLOSED_STATUSES = ["WON", "LOST"] as const;

export const OPEN_STATUSES = LEAD_STATUSES.filter(
  (status) => !CLOSED_STATUSES.includes(status as (typeof CLOSED_STATUSES)[number]),
);

export const STATUS_LABELS: Record<LeadStatusKey, string> = {
  NEW: "Khách mới",
  CONTACTED: "Đã liên hệ",
  QUALIFIED: "Đủ điều kiện",
  APPOINTMENT: "Đã hẹn",
  PROPOSAL: "Đã báo giá",
  WON: "Chốt đơn",
  LOST: "Không thành",
};

/** Loại hoạt động ghi vào nhật ký của một lead. */
export const ACTIVITY_TYPES = ["NOTE", "CALL", "EMAIL", "MEETING", "STAGE"] as const;

export const ACTIVITY_LABELS: Record<string, string> = {
  NOTE: "Ghi chú",
  CALL: "Gọi điện",
  EMAIL: "Gửi email",
  MEETING: "Gặp mặt",
  STAGE: "Đổi giai đoạn",
};

/**
 * Tiền nhập bằng euro (số thập phân) nhưng lưu bằng cent (số nguyên).
 *
 * Lưu tiền bằng số thực là cách chắc chắn nhất để mất vài cent mỗi lần cộng dồn.
 * Chuỗi rỗng nghĩa là "chưa ước tính", khác với 0 (ước tính bằng không).
 */
const euroAmount = z
  .string()
  .trim()
  .max(20)
  .optional()
  .transform((value) => (value ? value.replace(",", ".") : ""))
  .refine((value) => value === "" || /^\d+(\.\d{1,2})?$/.test(value), "Số tiền không hợp lệ")
  .transform((value) => (value === "" ? null : Math.round(Number(value) * 100)))
  .refine((cents) => cents === null || cents <= 100_000_000, "Số tiền quá lớn");

const dayKey = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày không hợp lệ")
  .or(z.literal(""))
  .optional()
  .transform((value) => value || null);

export const leadFormSchema = z.object({
  fullName: z.string().trim().min(2, "Tên quá ngắn").max(160),
  phone: z.string().trim().max(40).optional().transform((v) => v || null),
  email: z
    .union([z.string().trim().email("Email không hợp lệ"), z.literal("")])
    .optional()
    .transform((v) => v || null),
  source: z.string().trim().max(80).optional().transform((v) => v || null),
  need: z.string().trim().max(600).optional().transform((v) => v || null),
  note: z.string().trim().max(4000).optional().transform((v) => v || null),
  status: z.enum(LEAD_STATUSES),
  expectedValueEuro: euroAmount,
  nextFollowUpAt: dayKey,
  /*
    Đồng ý nhận liên hệ tiếp thị. Ở Đức đây không phải ô đánh dấu cho vui —
    gửi quảng cáo cho người chưa đồng ý là vi phạm, nên phải lưu rõ ràng và
    hiện được trên thẻ.
  */
  consent: z.boolean().default(false),
});

export type LeadFormInput = z.input<typeof leadFormSchema>;

export type LeadFormResult =
  | { ok: true; id: string; message: string }
  | { ok: false; message: string; fields?: Record<string, string> };

export const activityFormSchema = z.object({
  type: z.enum(ACTIVITY_TYPES),
  content: z.string().trim().min(1, "Chưa có nội dung").max(2000),
});
