"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/server/tenant";

/**
 * Dời một nội dung sang ngày khác.
 *
 * `dayKey` là chuỗi `YYYY-MM-DD` lấy từ ô lịch, không phải Date. Truyền Date qua
 * ranh giới client–server sẽ bị đổi sang UTC theo múi giờ trình duyệt và bài
 * nhảy sang ngày kề. Ở đây tự dựng lại ngày ở giữa trưa UTC nên lệch múi giờ
 * vài tiếng cũng không đổi ngày.
 *
 * `null` = gỡ khỏi lịch, đưa về danh sách chưa xếp.
 */
export async function moveContentAction(
  slug: string,
  contentId: string,
  dayKey: string | null,
): Promise<{ ok: boolean; message?: string }> {
  const ctx = await requirePermission(slug, "calendar:manage");

  let targetDate: Date | null = null;
  if (dayKey) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dayKey)) {
      return { ok: false, message: "Ngày không hợp lệ." };
    }
    targetDate = new Date(`${dayKey}T12:00:00.000Z`);
    if (Number.isNaN(targetDate.getTime())) {
      return { ok: false, message: "Ngày không hợp lệ." };
    }
  }

  // `updateMany` kèm organizationId: chặn việc sửa nội dung của tenant khác dù
  // ai đó có đoán đúng id. `update` theo id đơn thuần không có lớp chặn này.
  const result = await prisma.contentItem.updateMany({
    where: { id: contentId, organizationId: ctx.organization.id },
    data: { targetDate },
  });

  if (result.count === 0) return { ok: false, message: "Không tìm thấy nội dung." };

  revalidatePath(`/app/${slug}/calendar`);
  return { ok: true };
}
