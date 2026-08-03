"use client";

import { usePathname, useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LOCALE_COOKIE, locales, localeLabels, type Locale } from "@/i18n/config";
import { ONE_YEAR_SECONDS, writeCookie } from "@/lib/client-cookies";

export function LocaleSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const router = useRouter();

  function switchTo(next: Locale) {
    writeCookie(LOCALE_COOKIE, next, ONE_YEAR_SECONDS);

    const segments = pathname.split("/");
    if (locales.includes(segments[1] as Locale)) {
      segments[1] = next;
      router.push(segments.join("/") || "/");
    } else {
      router.refresh();
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="text-ink-2 hover:text-ink gap-1.5 rounded-full"
            aria-label="Sprache / Ngôn ngữ"
          />
        }
      >
        <Globe className="size-4" />
        <span className="text-xs font-medium tracking-wide">{localeLabels[locale].short}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-36">
        {locales.map((item) => (
          <DropdownMenuItem
            key={item}
            // Base UI `Menu.Item` chỉ có `onClick`. Dùng `onSelect` thì React gắn nó
            // thành listener của sự kiện DOM `select` và không bao giờ chạy khi bấm.
            onClick={() => switchTo(item)}
            className={item === locale ? "text-brand-ink font-semibold" : undefined}
          >
            {localeLabels[item].label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
