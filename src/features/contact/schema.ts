import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "min").max(120),
  business: z.string().trim().min(2, "min").max(160),
  industry: z.string().trim().min(1, "required").max(80),
  email: z.email("email"),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  message: z.string().trim().min(10, "min").max(2000),
  consent: z.literal(true, "consent"),
});

export type ContactInput = z.infer<typeof contactSchema>;

export type ContactResult =
  | { ok: true }
  | { ok: false; reason: "validation" | "storage"; fields?: Record<string, string> };
