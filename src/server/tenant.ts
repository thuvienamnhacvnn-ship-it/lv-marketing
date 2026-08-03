import "server-only";
import { cache } from "react";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/server/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission, isLvStaff, type Permission } from "@/server/auth/rbac";
import type { OrgRole, SystemRole } from "@/generated/prisma/enums";

export type SessionUser = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  systemRole: SystemRole;
};

export type TenantContext = {
  user: SessionUser;
  organization: {
    id: string;
    name: string;
    slug: string;
    industry: string;
    logoUrl: string | null;
    isDemo: boolean;
    timezone: string;
  };
  /** null khi nhân sự LV GROUP truy cập tenant mà họ không phải thành viên. */
  orgRole: OrgRole | null;
  can: (permission: Permission) => boolean;
};

export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) return null;
  return {
    id: session.user.id,
    name: session.user.name ?? null,
    email: session.user.email,
    image: session.user.image ?? null,
    systemRole: session.user.systemRole,
  };
});

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export const listUserOrganizations = cache(async (userId: string) => {
  const memberships = await prisma.organizationMember.findMany({
    where: { userId },
    orderBy: { invitedAt: "asc" },
    select: {
      role: true,
      organization: {
        select: { id: true, name: true, slug: true, industry: true, logoUrl: true, isDemo: true },
      },
    },
  });
  return memberships.map((m) => ({ ...m.organization, role: m.role }));
});

/**
 * Nạp tenant theo slug và kiểm tra quyền truy cập.
 * Thành viên đọc theo OrgRole; nhân sự LV GROUP được vào để hỗ trợ nhưng quyền vẫn giới hạn theo SystemRole.
 */
export async function requireTenant(slug: string): Promise<TenantContext> {
  const user = await requireUser();

  const organization = await prisma.organization.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      industry: true,
      logoUrl: true,
      isDemo: true,
      isActive: true,
      timezone: true,
      members: {
        where: { userId: user.id },
        select: { role: true },
        take: 1,
      },
    },
  });

  if (!organization || !organization.isActive) notFound();

  const orgRole = organization.members[0]?.role ?? null;
  if (!orgRole && !isLvStaff(user.systemRole)) notFound();

  return {
    user,
    organization: {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      industry: organization.industry,
      logoUrl: organization.logoUrl,
      isDemo: organization.isDemo,
      timezone: organization.timezone,
    },
    orgRole,
    can: (permission) => hasPermission(permission, orgRole, user.systemRole),
  };
}

export async function requirePermission(slug: string, permission: Permission): Promise<TenantContext> {
  const ctx = await requireTenant(slug);
  if (!ctx.can(permission)) {
    throw new Error(`Không đủ quyền: ${permission}`);
  }
  return ctx;
}

export async function requirePlatformAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.systemRole !== "SUPER_ADMIN" && user.systemRole !== "LV_ADMIN") {
    notFound();
  }
  return user;
}
