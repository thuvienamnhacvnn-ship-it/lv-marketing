"use server";

import { hash } from "bcryptjs";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/server/auth";
import { loginSchema, registerSchema, type AuthResult } from "./schema";
import type { LeadStatus } from "@/generated/prisma/enums";

/** Bảy giai đoạn pipeline mặc định cho workspace mới. */
const DEFAULT_STAGES: { key: LeadStatus; name: string }[] = [
  { key: "NEW", name: "Khách mới" },
  { key: "CONTACTED", name: "Đã liên hệ" },
  { key: "QUALIFIED", name: "Đủ điều kiện" },
  { key: "APPOINTMENT", name: "Đã hẹn" },
  { key: "PROPOSAL", name: "Đã báo giá" },
  { key: "WON", name: "Chốt đơn" },
  { key: "LOST", name: "Không thành" },
];

function collectIssues(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !fields[key]) fields[key] = issue.message;
  }
  return fields;
}

/** Tạo slug từ tên doanh nghiệp, thêm hậu tố nếu đã tồn tại. */
async function uniqueSlug(name: string): Promise<string> {
  const base =
    name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/đ/gi, "d")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "workspace";

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const slug = attempt === 0 ? base : `${base}-${attempt + 1}`;
    const taken = await prisma.organization.findUnique({ where: { slug }, select: { id: true } });
    if (!taken) return slug;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export async function login(raw: unknown): Promise<AuthResult> {
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, reason: "validation", fields: collectIssues(parsed.error) };
  }

  try {
    await signIn("credentials", { ...parsed.data, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) return { ok: false, reason: "invalid" };
    console.error("[auth] đăng nhập thất bại:", error);
    return { ok: false, reason: "storage" };
  }

  return { ok: true, redirectTo: "/app" };
}

export async function register(raw: unknown): Promise<AuthResult> {
  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, reason: "validation", fields: collectIssues(parsed.error) };
  }

  const data = parsed.data;
  const email = data.email.toLowerCase();

  try {
    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) return { ok: false, reason: "emailTaken" };

    const slug = await uniqueSlug(data.orgName);
    const passwordHash = await hash(data.password, 12);

    // Một giao dịch: user + workspace + thành viên + hồ sơ thương hiệu + pipeline.
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { name: data.name, email, passwordHash, systemRole: "CUSTOMER" },
        select: { id: true },
      });

      const organization = await tx.organization.create({
        data: {
          name: data.orgName,
          slug,
          industry: data.industry,
          city: "Berlin",
          members: { create: { userId: user.id, role: "TENANT_OWNER", acceptedAt: new Date() } },
          brandProfiles: { create: { brandName: data.orgName } },
          pipelineStages: {
            create: DEFAULT_STAGES.map((stage, position) => ({ ...stage, position })),
          },
        },
        select: { id: true },
      });

      await tx.auditLog.create({
        data: {
          organizationId: organization.id,
          userId: user.id,
          action: "organization.created",
          entity: "Organization",
          entityId: organization.id,
        },
      });
    });
  } catch (error) {
    console.error("[auth] đăng ký thất bại:", error);
    return { ok: false, reason: "storage" };
  }

  try {
    await signIn("credentials", { email, password: data.password, redirect: false });
  } catch {
    // Tài khoản đã tạo xong nhưng chưa đăng nhập được — đưa về trang login.
    return { ok: true, redirectTo: "/login" };
  }

  return { ok: true, redirectTo: "/app" };
}
