import type { Permission } from "@/server/auth/rbac";
import type { Dictionary } from "@/i18n/dictionaries/vi";

export type NavGroupKey = "groupWork" | "groupGrow" | "groupOrg";

export type NavItem = {
  /** Khoá trong `appNav` của từ điển — cũng là đoạn cuối của đường dẫn. */
  key: keyof Dictionary["appNav"];
  /** Đường dẫn tương đối sau `/app/[slug]`. Rỗng = trang gốc của workspace. */
  path: string;
  icon: string;
  /** Quyền tối thiểu để thấy mục này. Bỏ trống = ai vào được workspace đều thấy. */
  permission?: Permission;
  /**
   * Màn hình chưa dựng. Vẫn hiện trong menu để người dùng thấy lộ trình sản phẩm,
   * nhưng không bấm được — thà vậy còn hơn dẫn tới một trang trống.
   */
  soon?: boolean;
};

/**
 * Cấu trúc menu của khu vực app.
 *
 * Nhãn không nằm ở đây mà lấy từ `t.appNav[key]` để không phải dịch hai nơi.
 */
export const NAV_GROUPS: { key: NavGroupKey; items: NavItem[] }[] = [
  {
    key: "groupWork",
    items: [
      { key: "overview", path: "", icon: "gauge" },
      { key: "studio", path: "studio", icon: "sparkles", permission: "ai:generate" },
      { key: "calendar", path: "calendar", icon: "calendar", permission: "calendar:manage", soon: true },
      { key: "publishing", path: "publishing", icon: "send", permission: "content:publish", soon: true },
      { key: "channels", path: "channels", icon: "share", permission: "channel:manage", soon: true },
      { key: "inbox", path: "inbox", icon: "inbox", permission: "inbox:read", soon: true },
      { key: "crm", path: "crm", icon: "users", permission: "crm:read", soon: true },
    ],
  },
  {
    key: "groupGrow",
    items: [
      { key: "strategy", path: "strategy", icon: "compass", permission: "ai:generate", soon: true },
      { key: "campaigns", path: "campaigns", icon: "megaphone", permission: "campaign:manage", soon: true },
      { key: "reviews", path: "reviews", icon: "star", permission: "review:read", soon: true },
      { key: "automations", path: "automations", icon: "workflow", permission: "automation:manage", soon: true },
      { key: "loyalty", path: "loyalty", icon: "gift", permission: "loyalty:manage" },
      { key: "pages", path: "pages", icon: "layout", soon: true },
      { key: "analytics", path: "analytics", icon: "chart", permission: "analytics:read", soon: true },
    ],
  },
  {
    key: "groupOrg",
    items: [
      { key: "assets", path: "assets", icon: "image", permission: "asset:read", soon: true },
      { key: "services", path: "services", icon: "wrench", permission: "service:request", soon: true },
      { key: "team", path: "team", icon: "team", permission: "org:manage_members", soon: true },
      { key: "settings", path: "settings", icon: "settings", permission: "settings:manage", soon: true },
    ],
  },
];
