"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { LvLogo } from "@/components/brand/lv-logo";
import { LocaleSwitcher } from "@/components/marketing/locale-switcher";
import { ThemeSwitcher } from "@/components/marketing/theme-switcher";
import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n/config";
import type { ThemeName } from "@/config/themes";
import type { Dictionary } from "@/i18n/dictionaries/vi";

/** Mỗi mục menu một màu nhấn riêng — vạch gạch chân đổi màu theo mục đang trỏ. */
const LINK_TONES = [
  "bg-brand",
  "bg-magenta",
  "bg-violet",
  "bg-sky",
  "bg-mint",
  "bg-amber",
] as const;

export function SiteHeader({
  locale,
  theme,
  t,
}: {
  locale: Locale;
  theme: ThemeName;
  t: Dictionary["nav"];
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Đọc vị trí cuộn qua rAF: khi trang mở kèm hash (#bang-gia) trình duyệt nhảy
  // tới vị trí mới mà không phải lúc nào cũng phát ra sự kiện scroll.
  useEffect(() => {
    let frame = 0;
    let last = -1;

    const measure = () => {
      const next = window.scrollY > 12 ? 1 : 0;
      if (next !== last) {
        last = next;
        setScrolled(next === 1);
      }
      frame = requestAnimationFrame(measure);
    };

    frame = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(frame);
  }, []);

  const links = [
    { href: `/${locale}/giai-phap`, label: t.solutions },
    { href: `/${locale}/nganh-nghe`, label: t.industries },
    { href: `/${locale}/tinh-nang`, label: t.features },
    { href: `/${locale}/bang-gia`, label: t.pricing },
    { href: `/${locale}/du-an`, label: t.projects },
    { href: `/${locale}/ve-chung-toi`, label: t.about },
  ];

  return (
    /*
      Thanh ngang chạm hai mép thay cho viên thuốc nổi ở giữa: trang đã chuyển
      sang bố cục tràn hai mép, một viên thuốc dài 2500px trông không ra hình gì,
      và cũng không có "chân thanh" để đặt vạch màu.
    */
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={cn(
          "relative transition-colors duration-400",
          scrolled ? "bg-paper-2/85 backdrop-blur-xl" : "bg-transparent",
        )}
      >
        <div className="lv-container flex h-16 items-center justify-between gap-5">
          {/*
            Ẩn trên mobile: banner đã có một logo lớn ở giữa, để thêm logo nhỏ
            trên header là hai logo chồng nhau trong cùng một khung nhìn. Điều
            hướng trên điện thoại đã có thanh tab ở đáy, nên header chỉ còn giữ
            các nút phụ trợ.
          */}
          <Link
            href={`/${locale}`}
            className="focus-visible:ring-brand/50 hidden shrink-0 rounded-full focus-visible:ring-2 focus-visible:outline-none md:inline-flex"
          >
            <LvLogo size={36} withWordmark priority />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {links.map((link, i) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative px-3.5 py-2 text-[0.9rem] font-medium transition-colors",
                    active ? "text-ink" : "text-ink-2 hover:text-ink",
                  )}
                >
                  {link.label}

                  {/* Gạch chân màu: hiện sẵn ở mục đang mở, trượt ra khi rê chuột */}
                  <span
                    className={cn(
                      "absolute inset-x-3 -bottom-0.5 h-0.5 origin-left rounded-full transition-transform duration-300 ease-out",
                      LINK_TONES[i % LINK_TONES.length],
                      active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                    )}
                    aria-hidden
                  />
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-1.5 lg:flex">
            <ThemeSwitcher locale={locale} current={theme} />
            <LocaleSwitcher locale={locale} />
            <Button
              variant="ghost"
              size="sm"
              className="text-ink-2 hover:text-ink rounded-full"
              render={<Link href="/login" />}
            >
              {t.login}
            </Button>
            <Button
              size="sm"
              className="rounded-full shadow-[var(--shadow-brand)]"
              render={<Link href="/register" />}
            >
              {t.cta}
              <ArrowRight className="size-3.5" aria-hidden />
            </Button>
          </div>

          {/* ml-auto: dưới `md` không còn logo bên trái nên cụm nút phải tự đẩy sang phải. */}
          <div className="ml-auto flex items-center gap-1 md:ml-0 lg:hidden">
            <ThemeSwitcher locale={locale} current={theme} />
            <LocaleSwitcher locale={locale} />
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger
                render={
                  <Button variant="ghost" size="icon" className="rounded-full" aria-label={t.menu} />
                }
              >
                <Menu className="size-5" />
              </SheetTrigger>
              <SheetContent side="right" className="bg-paper w-[min(23rem,90vw)]">
                <SheetHeader>
                  <SheetTitle className="text-left">
                    <LvLogo size={34} withWordmark />
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-2 flex flex-col gap-1 px-4" aria-label="Mobile">
                  {links.map((link, i) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="text-ink border-line hover:text-brand-ink flex items-center gap-3 border-b py-3.5 text-base font-medium transition-colors"
                    >
                      <span
                        className={cn(
                          "h-4 w-0.5 shrink-0 rounded-full",
                          LINK_TONES[i % LINK_TONES.length],
                        )}
                        aria-hidden
                      />
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <div className="mt-6 flex flex-col gap-2 px-4">
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full"
                    render={<Link href="/login" onClick={() => setOpen(false)} />}
                  >
                    {t.login}
                  </Button>
                  <Button
                    size="lg"
                    className="rounded-full"
                    render={<Link href="/register" onClick={() => setOpen(false)} />}
                  >
                    {t.cta}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/*
          Vạch màu dưới chân thanh menu. Chỉ đậm hẳn khi đã cuộn — lúc trang còn ở
          đỉnh, header trong suốt nằm đè lên banner nên một vạch đặc sẽ cắt ngang ảnh.
        */}
        <span
          className={cn(
            "lv-menu-line absolute inset-x-0 bottom-0 h-0.5 transition-opacity duration-400",
            scrolled ? "opacity-100" : "opacity-35",
          )}
          aria-hidden
        />
      </div>
    </header>
  );
}
