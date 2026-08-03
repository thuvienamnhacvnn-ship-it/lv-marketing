"use client";

import Link from "next/link";
import { Building2, Check, ChevronsUpDown, ExternalLink, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LocaleSwitcher } from "@/components/marketing/locale-switcher";
import { ThemeSwitcher } from "@/components/marketing/theme-switcher";
import { signOutAction } from "@/features/auth/session-actions";
import { ORG_ROLE_LABELS } from "@/server/auth/rbac";
import { cn } from "@/lib/utils";
import type { OrgRole } from "@/generated/prisma/enums";
import type { Locale } from "@/i18n/config";
import type { ThemeName } from "@/config/themes";
import type { Dictionary } from "@/i18n/dictionaries/vi";

export type OrgOption = {
  id: string;
  name: string;
  slug: string;
  isDemo: boolean;
  role: OrgRole;
};

export function AppTopbar({
  locale,
  theme,
  t,
  title,
  organizations,
  currentSlug,
  user,
}: {
  locale: Locale;
  theme: ThemeName;
  t: Dictionary;
  title: string;
  organizations: OrgOption[];
  currentSlug: string;
  user: { name: string | null; email: string };
}) {
  const current = organizations.find((o) => o.slug === currentSlug);

  return (
    <header className="border-line bg-paper-2/85 sticky top-0 z-40 border-b backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        {/* Bộ chọn workspace */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-paper-3 -ml-1 h-10 max-w-[15rem] gap-2 rounded-xl px-2.5"
              />
            }
          >
            <span className="bg-brand-tint text-brand-ink grid size-7 shrink-0 place-items-center rounded-lg">
              <Building2 className="size-4" aria-hidden />
            </span>
            <span className="flex min-w-0 flex-col items-start leading-none">
              <span className="text-ink truncate text-sm font-bold">
                {current?.name ?? currentSlug}
              </span>
              {current ? (
                <span className="text-ink-3 mt-0.5 truncate text-[0.65rem]">
                  {ORG_ROLE_LABELS[current.role]}
                </span>
              ) : null}
            </span>
            <ChevronsUpDown className="text-ink-3 size-3.5 shrink-0" aria-hidden />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="start" className="min-w-64">
            {organizations.map((org) => (
              <DropdownMenuItem
                key={org.id}
                // Base UI `Menu.Item` chỉ có `onClick`; `onSelect` sẽ không bao giờ chạy.
                onClick={() => {
                  window.location.href = `/app/${org.slug}`;
                }}
                className="gap-2.5 py-2"
              >
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="flex items-center gap-2 truncate text-sm font-semibold">
                    {org.name}
                    {org.isDemo ? (
                      <span className="bg-amber-tint text-amber-ink shrink-0 rounded-full px-1.5 py-0.5 text-[0.55rem] font-bold uppercase">
                        {t.common.demoBadge}
                      </span>
                    ) : null}
                  </span>
                  <span className="text-ink-3 truncate text-xs">{ORG_ROLE_LABELS[org.role]}</span>
                </span>
                <Check
                  className={cn(
                    "size-4 shrink-0",
                    org.slug === currentSlug ? "opacity-100" : "opacity-0",
                  )}
                />
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <span className="bg-line hidden h-6 w-px sm:block" aria-hidden />
        <h1 className="text-ink hidden truncate text-sm font-bold sm:block">{title}</h1>

        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-ink-2 hover:text-ink hidden gap-1.5 rounded-full sm:inline-flex"
            render={<Link href={`/${locale}`} target="_blank" />}
          >
            <ExternalLink className="size-3.5" aria-hidden />
            <span className="text-xs font-semibold">lv-groups.com</span>
          </Button>

          <ThemeSwitcher locale={locale} current={theme} />
          <LocaleSwitcher locale={locale} />

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-paper-3 rounded-full"
                  aria-label={user.email}
                />
              }
            >
              <span className="bg-violet-tint text-violet-ink grid size-7 place-items-center rounded-full text-xs font-bold">
                {initials(user.name, user.email)}
              </span>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="min-w-56">
              <div className="px-2 py-1.5">
                <p className="text-ink truncate text-sm font-semibold">{user.name ?? user.email}</p>
                <p className="text-ink-3 truncate text-xs">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  void signOutAction();
                }}
                className="gap-2 py-2"
              >
                <LogOut className="size-4" aria-hidden />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

/** Chữ cái đầu cho ảnh đại diện — ưu tiên tên, không có thì lấy từ email. */
function initials(name: string | null, email: string) {
  const source = name?.trim() || email;
  const parts = source.split(/[\s@.]+/).filter(Boolean);
  return (parts[0]?.[0] ?? "?").concat(parts[1]?.[0] ?? "").toUpperCase();
}
