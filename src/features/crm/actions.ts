"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/server/tenant";
import { loadLeadActivities } from "@/features/crm/queries";
import {
  CLOSED_STATUSES,
  LEAD_STATUSES,
  STATUS_LABELS,
  activityFormSchema,
  leadFormSchema,
  type LeadFormResult,
  type LeadStatusKey,
} from "@/features/crm/schema";

type Result = { ok: boolean; message?: string };

function isClosed(status: string) {
  return (CLOSED_STATUSES as readonly string[]).includes(status);
}

/** Ngày nhập từ ô lịch là chuỗi YYYY-MM-DD; dựng lại ở giữa trưa UTC cho khỏi lệch ngày. */
function noonUtc(dayKey: string | null) {
  return dayKey ? new Date(`${dayKey}T12:00:00.000Z`) : null;
}

/**
 * Kéo một lead sang cột khác.
 *
 * Ba việc phải đi cùng nhau nên gói trong một giao dịch: đổi `status`, đồng bộ
 * `stageId` cho khớp, và ghi một dòng nhật ký. Thiếu dòng nhật ký thì vài tuần
 * sau không ai trả lời được câu "ai chuyển sang Không thành, vì sao".
 */
export async function moveLeadAction(
  slug: string,
  leadId: string,
  status: string,
): Promise<Result> {
  const ctx = await requirePermission(slug, "crm:update");

  if (!(LEAD_STATUSES as readonly string[]).includes(status)) {
    return { ok: false, message: "Giai đoạn không hợp lệ." };
  }
  const next = status as LeadStatusKey;

  const lead = await prisma.lead.findFirst({
    where: { id: leadId, organizationId: ctx.organization.id },
    select: { id: true, status: true, fullName: true },
  });
  if (!lead) return { ok: false, message: "Không tìm thấy lead." };
  if (lead.status === next) return { ok: true };

  const stage = await prisma.pipelineStage.findUnique({
    where: { organizationId_key: { organizationId: ctx.organization.id, key: next } },
    select: { id: true },
  });

  await prisma.$transaction(async (tx) => {
    await tx.lead.update({
      where: { id: leadId },
      data: {
        status: next,
        stageId: stage?.id ?? null,
        // Vào cột kết thúc thì đóng dấu thời điểm; kéo ngược ra thì gỡ dấu,
        // nếu không lead sẽ vẫn bị tính là "chốt trong tháng này".
        closedAt: isClosed(next) ? new Date() : null,
      },
    });
    await tx.leadActivity.create({
      data: {
        leadId,
        userId: ctx.user.id,
        type: "STAGE",
        content: `${STATUS_LABELS[lead.status as LeadStatusKey] ?? lead.status} → ${STATUS_LABELS[next]}`,
      },
    });
  });

  revalidatePath(`/app/${slug}/crm`);
  return { ok: true };
}

export async function saveLeadAction(
  slug: string,
  raw: unknown,
  id?: string,
): Promise<LeadFormResult> {
  const ctx = await requirePermission(slug, "crm:update");

  const parsed = leadFormSchema.safeParse(raw);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fields[key]) fields[key] = issue.message;
    }
    return { ok: false, message: "Thông tin chưa hợp lệ.", fields };
  }
  const input = parsed.data;

  const stage = await prisma.pipelineStage.findUnique({
    where: { organizationId_key: { organizationId: ctx.organization.id, key: input.status } },
    select: { id: true },
  });

  const data = {
    fullName: input.fullName,
    phone: input.phone,
    email: input.email,
    source: input.source,
    need: input.need,
    note: input.note,
    status: input.status,
    stageId: stage?.id ?? null,
    expectedValueCents: input.expectedValueEuro,
    nextFollowUpAt: noonUtc(input.nextFollowUpAt),
    consent: input.consent,
  };

  try {
    if (id) {
      const current = await prisma.lead.findFirst({
        where: { id, organizationId: ctx.organization.id },
        select: { status: true, closedAt: true },
      });
      if (!current) return { ok: false, message: "Không tìm thấy lead." };

      // Giữ nguyên mốc đóng nếu vẫn ở cột kết thúc cũ, đặt mới nếu vừa chuyển vào.
      const closedAt = isClosed(input.status)
        ? isClosed(current.status)
          ? current.closedAt
          : new Date()
        : null;

      await prisma.lead.updateMany({
        where: { id, organizationId: ctx.organization.id },
        data: { ...data, closedAt },
      });

      if (current.status !== input.status) {
        await prisma.leadActivity.create({
          data: {
            leadId: id,
            userId: ctx.user.id,
            type: "STAGE",
            content: `${STATUS_LABELS[current.status as LeadStatusKey] ?? current.status} → ${STATUS_LABELS[input.status]}`,
          },
        });
      }

      revalidatePath(`/app/${slug}/crm`);
      return { ok: true, id, message: "Đã lưu thay đổi." };
    }

    const created = await prisma.lead.create({
      data: {
        ...data,
        organizationId: ctx.organization.id,
        ownerId: ctx.user.id,
        closedAt: isClosed(input.status) ? new Date() : null,
      },
      select: { id: true },
    });

    revalidatePath(`/app/${slug}/crm`);
    return { ok: true, id: created.id, message: "Đã thêm lead." };
  } catch {
    return { ok: false, message: "Không lưu được. Thử lại sau." };
  }
}

export type ActivityRow = {
  id: string;
  type: string;
  content: string;
  createdAt: Date;
  userName: string | null;
};

/**
 * Nhật ký của một lead, nạp khi mở bảng chi tiết.
 *
 * Không gửi kèm ngay từ đầu cùng bảng phễu: 300 lead × nhật ký mỗi lead là một
 * đống dữ liệu mà người dùng chỉ xem của đúng một lead tại một thời điểm.
 */
export async function fetchLeadActivitiesAction(
  slug: string,
  leadId: string,
): Promise<ActivityRow[]> {
  const ctx = await requirePermission(slug, "crm:read");
  const rows = await loadLeadActivities(ctx.organization.id, leadId);
  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    content: row.content,
    createdAt: row.createdAt,
    userName: row.user?.name ?? null,
  }));
}

export async function addLeadActivityAction(
  slug: string,
  leadId: string,
  raw: unknown,
): Promise<Result> {
  const ctx = await requirePermission(slug, "crm:update");

  const parsed = activityFormSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Nội dung chưa hợp lệ." };
  }

  const lead = await prisma.lead.findFirst({
    where: { id: leadId, organizationId: ctx.organization.id },
    select: { id: true },
  });
  if (!lead) return { ok: false, message: "Không tìm thấy lead." };

  await prisma.leadActivity.create({
    data: {
      leadId,
      userId: ctx.user.id,
      type: parsed.data.type,
      content: parsed.data.content,
    },
  });

  revalidatePath(`/app/${slug}/crm`);
  return { ok: true, message: "Đã ghi vào nhật ký." };
}

/**
 * Biến một lead đã chốt thành hồ sơ khách hàng.
 *
 * Làm bằng tay chứ không tự động khi kéo sang "Chốt đơn": mỗi lần chốt mà tự
 * tạo hồ sơ thì một khách quay lại đặt tiệc lần hai sẽ thành hai người khác
 * nhau trong danh sách. Ở đây tìm trùng theo email/điện thoại trước, có rồi thì
 * nối vào bản ghi cũ.
 */
export async function convertLeadAction(slug: string, leadId: string): Promise<Result> {
  const ctx = await requirePermission(slug, "crm:update");

  const lead = await prisma.lead.findFirst({
    where: { id: leadId, organizationId: ctx.organization.id },
  });
  if (!lead) return { ok: false, message: "Không tìm thấy lead." };
  if (lead.customerId) return { ok: false, message: "Lead này đã có hồ sơ khách hàng." };

  const match =
    lead.email || lead.phone
      ? await prisma.customer.findFirst({
          where: {
            organizationId: ctx.organization.id,
            OR: [
              ...(lead.email ? [{ email: lead.email }] : []),
              ...(lead.phone ? [{ phone: lead.phone }] : []),
            ],
          },
          select: { id: true },
        })
      : null;

  const customerId =
    match?.id ??
    (
      await prisma.customer.create({
        data: {
          organizationId: ctx.organization.id,
          fullName: lead.fullName,
          email: lead.email,
          phone: lead.phone,
          notes: lead.need,
          // Đồng ý tiếp thị đi theo lead, không tự bật. Bật hộ khách là chỗ dễ
          // dính phạt nhất khi làm marketing ở Đức.
          marketingConsent: lead.consent,
          consentAt: lead.consent ? new Date() : null,
        },
        select: { id: true },
      })
    ).id;

  await prisma.lead.updateMany({
    where: { id: leadId, organizationId: ctx.organization.id },
    data: { customerId },
  });

  revalidatePath(`/app/${slug}/crm`);
  return {
    ok: true,
    message: match ? "Đã nối vào hồ sơ khách đã có." : "Đã tạo hồ sơ khách hàng.",
  };
}

export async function deleteLeadAction(slug: string, id: string): Promise<Result> {
  const ctx = await requirePermission(slug, "crm:update");

  const lead = await prisma.lead.findFirst({
    where: { id, organizationId: ctx.organization.id },
    select: { status: true },
  });
  if (!lead) return { ok: false, message: "Không tìm thấy lead." };

  // Lead đã chốt là số liệu doanh thu của tháng. Xoá đi thì báo cáo hụt mà
  // không giải thích được — muốn ẩn thì kéo sang "Không thành".
  if (lead.status === "WON") {
    return { ok: false, message: "Lead đã chốt không xoá được." };
  }

  await prisma.lead.deleteMany({ where: { id, organizationId: ctx.organization.id } });
  revalidatePath(`/app/${slug}/crm`);
  return { ok: true, message: "Đã xoá lead." };
}
