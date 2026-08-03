"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  Compass,
  Gauge,
  Gift,
  Image as ImageIcon,
  Inbox,
  LayoutTemplate,
  Megaphone,
  PanelLeftClose,
  PanelLeftOpen,
  Send,
  Settings,
  Share2,
  Sparkles,
  Star,
  Users,
  UsersRound,
  Workflow,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { LvLogo } from "@/components/brand/lv-logo";
import { NAV_GROUPS, type NavItem } from "@/config/app-nav";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/i18n/dictionaries/vi";

const ICONS: Record<string, LucideIcon> = {
  gauge: Gauge,
  sparkles: Sparkles,
  calendar: CalendarDays,
  send: Send,
  share: Share2,
  inbox: Inbox,
  users: Users,
  compass: Compass,
  megaphone: Megaphone,
  star: Star,
  workflow: Workflow,
  gift: Gift,
  layout: LayoutTemplate,
  chart: BarChart3,
  image: ImageIcon,
  wrench: Wrench,
  team: UsersRound,
  settings: Settings,
};

export function AppSidebar({
  slug,
  t,
  allowed,
}: {
  slug: string;
  t: Dictionary;
  /**
   * Danh sách khoá mục mà người dùng đủ quyền xem. Tính ở server rồi truyền
   * xuống — không gửi cả bảng phân quyền vào bundle của trình duyệt.
   */
  allowed: string[];
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const base = `/app/${slug}`;
  const allowedSet = new Set(allowed);

  return (
    <aside
      className={cn(
        "border-line bg-paper-2 hidden shrink-0 flex-col border-r transition-[width] duration-300 lg:flex",
        collapsed ? "w-[4.5rem]" : "w-64",
      )}
    >
      <div className="border-line flex h-16 items-center gap-2 border-b px-4">
        <Link href={base} className="flex min-w-0 items-center gap-2.5">
          <LvLogo size={30} />
          {!collapsed ? (
            <span className="flex min-w-0 flex-col leading-none">
              <span className="font-display text-ink truncate text-sm font-extrabold">LV GROUP</span>
              <span className="text-ink-3 mt-1 text-[0.6rem] font-semibold tracking-[0.14em] uppercase">
                Marketing Hub
              </span>
            </span>
          ) : null}
        </Link>

        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="text-ink-3 hover:bg-paper-3 hover:text-ink ml-auto shrink-0 rounded-lg p-1.5 transition-colors"
          aria-label={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
        >
          {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Workspace">
        {NAV_GROUPS.map((group) => {
          const items = group.items.filter((item) => allowedSet.has(item.key));
          if (items.length === 0) return null;

          return (
            <div key={group.key} className="mb-5 last:mb-0">
              {!collapsed ? (
                <p className="text-ink-3 mb-2 px-2.5 text-[0.62rem] font-bold tracking-[0.16em] uppercase">
                  {t.appNav[group.key]}
                </p>
              ) : null}

              <ul className="space-y-0.5">
                {items.map((item) => (
                  <li key={item.key}>
                    <NavLink
                      item={item}
                      base={base}
                      pathname={pathname}
                      label={t.appNav[item.key]}
                      soonLabel={t.common.comingSoon}
                      collapsed={collapsed}
                    />
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

function NavLink({
  item,
  base,
  pathname,
  label,
  soonLabel,
  collapsed,
}: {
  item: NavItem;
  base: string;
  pathname: string;
  label: string;
  soonLabel: string;
  collapsed: boolean;
}) {
  const Icon = ICONS[item.icon] ?? Gauge;
  const href = item.path ? `${base}/${item.path}` : base;
  const active = pathname === href;

  const inner = (
    <>
      <Icon className="size-4 shrink-0" aria-hidden />
      {!collapsed ? (
        <>
          <span className="truncate">{label}</span>
          {item.soon ? (
            <span className="text-ink-3 border-line ml-auto shrink-0 rounded-full border px-1.5 py-0.5 text-[0.55rem] font-bold tracking-wide uppercase">
              {soonLabel}
            </span>
          ) : null}
        </>
      ) : null}
    </>
  );

  const shared = cn(
    "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium transition-colors",
    collapsed && "justify-center",
  );

  // Màn hình chưa dựng thì render ra <span>, không phải <a>: một liên kết dẫn tới
  // trang trống gây khó chịu hơn hẳn một mục xám không bấm được.
  if (item.soon) {
    return (
      <span className={cn(shared, "text-ink-3 cursor-not-allowed")} title={`${label} — ${soonLabel}`}>
        {inner}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      title={collapsed ? label : undefined}
      className={cn(
        shared,
        active ? "bg-brand-tint text-brand-ink" : "text-ink-2 hover:bg-paper-3 hover:text-ink",
      )}
    >
      {inner}
    </Link>
  );
}
