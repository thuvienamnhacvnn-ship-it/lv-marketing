"use server";

import { prisma } from "@/lib/prisma";
import { contactSchema, type ContactResult } from "./schema";

/**
 * Nhận yêu cầu tư vấn từ trang liên hệ.
 *
 * Lưu thành SupportTicket không gắn organization — đây là khách chưa có workspace.
 * Nếu database chưa sẵn sàng, trả về `reason: "storage"` để giao diện hướng khách
 * gọi điện thay vì im lặng nuốt lỗi.
 */
export async function submitContact(raw: unknown): Promise<ContactResult> {
  const parsed = contactSchema.safeParse(raw);

  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fields[key]) fields[key] = issue.message;
    }
    return { ok: false, reason: "validation", fields };
  }

  const data = parsed.data;
  const body = [
    `Doanh nghiệp: ${data.business}`,
    `Ngành nghề: ${data.industry}`,
    `Email: ${data.email}`,
    `Điện thoại: ${data.phone || "—"}`,
    "",
    data.message,
  ].join("\n");

  try {
    await prisma.supportTicket.create({
      data: {
        subject: `Yêu cầu tư vấn — ${data.business}`,
        body,
        priority: "HIGH",
        status: "OPEN",
      },
    });
    return { ok: true };
  } catch (error) {
    console.error("[contact] không lưu được yêu cầu tư vấn:", error);
    return { ok: false, reason: "storage" };
  }
}
