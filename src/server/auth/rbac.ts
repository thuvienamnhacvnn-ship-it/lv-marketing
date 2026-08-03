import type { OrgRole, SystemRole } from "@/generated/prisma/enums";

/** Quyền thao tác trong phạm vi một organization. */
export const PERMISSIONS = [
  "org:read",
  "org:update",
  "org:manage_members",
  "brand:update",
  "content:read",
  "content:create",
  "content:update",
  "content:approve",
  "content:publish",
  "calendar:manage",
  "channel:manage",
  "inbox:read",
  "inbox:reply",
  "crm:read",
  "crm:update",
  "campaign:manage",
  "review:read",
  "review:reply",
  "automation:manage",
  "loyalty:manage",
  "asset:read",
  "asset:upload",
  "asset:delete",
  "analytics:read",
  "service:request",
  "ai:generate",
  "settings:manage",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const ALL: readonly Permission[] = PERMISSIONS;

const READ_ONLY: readonly Permission[] = [
  "org:read",
  "content:read",
  "inbox:read",
  "crm:read",
  "review:read",
  "asset:read",
  "analytics:read",
];

export const ORG_ROLE_PERMISSIONS: Record<OrgRole, readonly Permission[]> = {
  TENANT_OWNER: ALL,
  TENANT_ADMIN: ALL.filter((p) => p !== "org:update"),
  MARKETER: [
    "org:read",
    "brand:update",
    "content:read",
    "content:create",
    "content:update",
    "content:publish",
    "calendar:manage",
    "channel:manage",
    "inbox:read",
    "inbox:reply",
    "crm:read",
    "crm:update",
    "campaign:manage",
    "review:read",
    "review:reply",
    "automation:manage",
    "loyalty:manage",
    "asset:read",
    "asset:upload",
    "analytics:read",
    "service:request",
    "ai:generate",
  ],
  EDITOR: [
    "org:read",
    "content:read",
    "content:create",
    "content:update",
    "calendar:manage",
    "asset:read",
    "asset:upload",
    "analytics:read",
    "ai:generate",
  ],
  APPROVER: [
    "org:read",
    "content:read",
    "content:approve",
    "content:publish",
    "review:read",
    "review:reply",
    "asset:read",
    "analytics:read",
  ],
  STAFF: ["org:read", "content:read", "inbox:read", "inbox:reply", "crm:read", "crm:update", "asset:read"],
  VIEWER: READ_ONLY,
};

/** Nhân sự LV GROUP thao tác xuyên tenant ở mức hỗ trợ. */
export const SYSTEM_ROLE_OVERRIDE: Partial<Record<SystemRole, readonly Permission[]>> = {
  SUPER_ADMIN: ALL,
  LV_ADMIN: ALL,
  ACCOUNT_MANAGER: [
    "org:read",
    "content:read",
    "content:create",
    "content:update",
    "content:approve",
    "inbox:read",
    "crm:read",
    "review:read",
    "asset:read",
    "analytics:read",
    "service:request",
    "ai:generate",
  ],
};

export function hasPermission(
  permission: Permission,
  orgRole: OrgRole | null,
  systemRole: SystemRole,
): boolean {
  const systemGrants = SYSTEM_ROLE_OVERRIDE[systemRole];
  if (systemGrants?.includes(permission)) return true;
  if (!orgRole) return false;
  return ORG_ROLE_PERMISSIONS[orgRole].includes(permission);
}

export function isLvStaff(systemRole: SystemRole): boolean {
  return systemRole === "SUPER_ADMIN" || systemRole === "LV_ADMIN" || systemRole === "ACCOUNT_MANAGER";
}

export function isPlatformAdmin(systemRole: SystemRole): boolean {
  return systemRole === "SUPER_ADMIN" || systemRole === "LV_ADMIN";
}

export const ORG_ROLE_LABELS: Record<OrgRole, string> = {
  TENANT_OWNER: "Chủ doanh nghiệp",
  TENANT_ADMIN: "Quản trị",
  MARKETER: "Marketer",
  EDITOR: "Biên tập",
  APPROVER: "Người duyệt",
  STAFF: "Nhân viên",
  VIEWER: "Chỉ xem",
};

export const SYSTEM_ROLE_LABELS: Record<SystemRole, string> = {
  SUPER_ADMIN: "Super Admin",
  LV_ADMIN: "LV Admin",
  ACCOUNT_MANAGER: "Account Manager",
  CUSTOMER: "Khách hàng",
};
