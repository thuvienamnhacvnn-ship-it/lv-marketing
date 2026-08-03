import { z } from "zod";
import { Industry } from "@/generated/prisma/enums";

export const loginSchema = z.object({
  email: z.email("email"),
  password: z.string().min(8, "min"),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, "min").max(120),
  email: z.email("email"),
  password: z.string().min(8, "min").max(200),
  orgName: z.string().trim().min(2, "min").max(160),
  industry: z.enum(Industry),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export type AuthResult =
  | { ok: true; redirectTo: string }
  | { ok: false; reason: "validation" | "invalid" | "emailTaken" | "storage"; fields?: Record<string, string> };

/** Nhãn ngành nghề hiển thị trong form đăng ký. */
export const INDUSTRY_LABELS: Record<Industry, { vi: string; de: string }> = {
  RESTAURANT: { vi: "Nhà hàng", de: "Restaurant" },
  NAIL_SALON: { vi: "Tiệm nail", de: "Nagelstudio" },
  SPA_BEAUTY: { vi: "Spa và thẩm mỹ", de: "Spa & Kosmetik" },
  CAFE: { vi: "Café", de: "Café" },
  RETAIL: { vi: "Cửa hàng bán lẻ", de: "Einzelhandel" },
  SHOWROOM: { vi: "Showroom", de: "Showroom" },
  SMALL_BUSINESS: { vi: "Doanh nghiệp nhỏ", de: "Kleinbetrieb" },
  OTHER: { vi: "Khác", de: "Sonstiges" },
};
