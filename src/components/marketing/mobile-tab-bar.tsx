"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Phone, Sparkles, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/vi";

/**
 * Thanh điều hướng đáy màn hình — chỉ hiện dưới `lg`.
 *
 * Trên điện thoại, menu ẩn sau nút ba gạch nghĩa là mỗi lần chuyển trang phải
 * bấm hai lần. Ứng dụng thật không làm vậy: đích đến chính luôn nằm trong tầm
 * ngón cái. Đây là thứ tạo cảm giác "app" rõ nhất, hơn mọi hiệu ứng chuyển cảnh.
 *
 * Nút giữa nhô lên là hành động chính (dùng thử) — quy ước quen thuộc của app di động.
 */
export function MobileTabBar({ locale, t }: { locale: Locale; t: Dictionary["nav"] }) {
  const pathname = usePathname();

  const left = [
    { href: `/${locale}`, label: t.home, icon: Home },
    { href: `/${locale}/giai-phap`, label: t.solutions, icon: LayoutGrid },
  ];
  const right = [
    { href: `/${locale}/bang-gia`, label: t.pricing, icon: Tag },
    { href: `/${locale}/lien-he`, label: t.contact, icon: Phone },
  ];

  return (
    <nav
      aria-label={t.menu}
      className={cn(
        "border-line bg-paper-2/92 fixed inset-x-0 bottom-0 z-50 border-t backdrop-blur-xl lg:hidden",
        // Chừa chỗ cho thanh gạt Home của iPhone; máy không có thì `env()` trả 0.
        "pb-[env(safe-area-inset-bottom)]",
      )}
    >
      <div className="flex items-stretch justify-around px-1">
        {left.map((item) => (
          <TabLink key={item.href} {...item} active={pathname === item.href} />
        ))}

        {/* Hành động chính — nhô lên khỏi thanh */}
        <Link
          href="/register"
          className="relative -mt-5 flex w-[4.5rem] shrink-0 flex-col items-center justify-start"
        >
          <span className="bg-brand border-paper-2 grid size-12 place-items-center rounded-full border-4 text-white shadow-[var(--shadow-brand)]">
            <Sparkles className="size-5" aria-hidden />
          </span>
          <span className="text-brand-ink mt-1 line-clamp-1 text-[0.6rem] font-bold">
            {t.cta.split(" ")[0]}
          </span>
        </Link>

        {right.map((item) => (
          <TabLink key={item.href} {...item} active={pathname === item.href} />
        ))}
      </div>
    </nav>
  );
}

function TabLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: typeof Home;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      // min-h-14: vùng chạm tối thiểu 56px, thoải mái hơn mức 44px khuyến nghị.
      className={cn(
        "flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 transition-colors",
        active ? "text-brand-ink" : "text-ink-3",
      )}
    >
      <Icon className="size-5" aria-hidden />
      <span className="line-clamp-1 text-[0.62rem] font-semibold">{label}</span>
    </Link>
  );
}
