"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/server/tenant";
import {
  ALLOWED_TRANSITIONS,
  contentFormSchema,
  type ContentFormResult,
} from "@/features/calendar/schema";
import type { ContentLanguage, ContentStatus, ContentType } from "@/generated/prisma/enums";

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

/**
 * Tạo hoặc sửa một nội dung.
 *
 * Gộp hai việc vào một action vì biểu mẫu là một: truyền `id` là sửa, không
 * truyền là tạo mới. Tách đôi chỉ nhân bản phần kiểm tra dữ liệu.
 */
export async function saveContentAction(
  slug: string,
  raw: unknown,
  id?: string,
): Promise<ContentFormResult> {
  const ctx = await requirePermission(slug, id ? "content:update" : "content:create");

  const parsed = contentFormSchema.safeParse(raw);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fields[key]) fields[key] = issue.message;
    }
    return { ok: false, message: "Nội dung chưa hợp lệ.", fields };
  }
  const input = parsed.data;

  // Giữa trưa UTC — xem chú thích ở `moveContentAction`.
  const targetDate = input.targetDate ? new Date(`${input.targetDate}T12:00:00.000Z`) : null;
  const hashtags = (input.hashtags ?? "")
    .split(/[\s,]+/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`))
    .slice(0, 15);

  const data = {
    title: input.title,
    body: input.body,
    type: input.type as ContentType,
    status: input.status as ContentStatus,
    language: input.language as ContentLanguage,
    callToAction: input.callToAction || null,
    hashtags,
    targetDate,
  };

  try {
    if (id) {
      // `updateMany` kèm organizationId để chặn sửa nội dung của tenant khác.
      const result = await prisma.contentItem.updateMany({
        where: { id, organizationId: ctx.organization.id },
        data,
      });
      if (result.count === 0) return { ok: false, message: "Không tìm thấy nội dung." };
      revalidatePath(`/app/${slug}/calendar`);
      return { ok: true, id, message: "Đã lưu thay đổi." };
    }

    const created = await prisma.contentItem.create({
      data: { ...data, organizationId: ctx.organization.id, authorId: ctx.user.id },
      select: { id: true },
    });
    revalidatePath(`/app/${slug}/calendar`);
    return { ok: true, id: created.id, message: "Đã tạo nội dung." };
  } catch {
    return { ok: false, message: "Không lưu được. Thử lại sau." };
  }
}

/**
 * Đổi trạng thái, chỉ theo các bước hợp lệ trong `ALLOWED_TRANSITIONS`.
 *
 * Kiểm ở máy chủ chứ không chỉ ẩn nút ở giao diện: giao diện chỉ là gợi ý, ai
 * cũng gọi thẳng action được.
 */
export async function changeStatusAction(
  slug: string,
  id: string,
  next: string,
): Promise<{ ok: boolean; message: string }> {
  const ctx = await requirePermission(slug, "content:update");

  const item = await prisma.contentItem.findFirst({
    where: { id, organizationId: ctx.organization.id },
    select: { status: true },
  });
  if (!item) return { ok: false, message: "Không tìm thấy nội dung." };

  const allowed = ALLOWED_TRANSITIONS[item.status] ?? [];
  if (!allowed.includes(next)) {
    return {
      ok: false,
      message: `Không chuyển được từ "${item.status.toLowerCase()}" sang "${next.toLowerCase()}".`,
    };
  }

  // Duyệt bài là quyền riêng, không phải ai sửa được nội dung cũng duyệt được.
  if (next === "APPROVED" && !ctx.can("content:approve")) {
    return { ok: false, message: "Bạn không có quyền duyệt nội dung." };
  }

  await prisma.contentItem.updateMany({
    where: { id, organizationId: ctx.organization.id },
    data: { status: next as ContentStatus },
  });

  revalidatePath(`/app/${slug}/calendar`);
  return { ok: true, message: "Đã đổi trạng thái." };
}

export async function deleteContentAction(
  slug: string,
  id: string,
): Promise<{ ok: boolean; message: string }> {
  const ctx = await requirePermission(slug, "content:update");

  const item = await prisma.contentItem.findFirst({
    where: { id, organizationId: ctx.organization.id },
    select: { status: true },
  });
  if (!item) return { ok: false, message: "Không tìm thấy nội dung." };

  // Bài đã đăng không xoá được — xoá đi thì số liệu tháng đó hụt mà không giải
  // thích được. Muốn ẩn thì chuyển sang lưu trữ.
  if (item.status === "PUBLISHED") {
    return { ok: false, message: "Bài đã đăng không xoá được. Chuyển sang lưu trữ thay vì xoá." };
  }

  await prisma.contentItem.deleteMany({ where: { id, organizationId: ctx.organization.id } });
  revalidatePath(`/app/${slug}/calendar`);
  return { ok: true, message: "Đã xoá nội dung." };
}
