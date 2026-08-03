"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  THEME_COOKIE,
  THEME_META,
  oppositeTheme,
  type ThemeName,
} from "@/config/themes";
import { ONE_YEAR_SECONDS, applyThemeAttribute, writeCookie } from "@/lib/client-cookies";
import type { Locale } from "@/i18n/config";

/**
 * Nút bật/tắt nền tối. Cố ý KHÔNG dùng dropdown: `Menu.Item` của Base UI chỉ nhận
 * `onClick`, còn `onSelect` lọt qua thành sự kiện DOM `select` và không bao giờ chạy —
 * chính là lý do bộ chọn theme cũ bấm không ăn.
 */
export function ThemeSwitcher({ locale, current }: { locale: Locale; current: ThemeName }) {
  // Giữ state cục bộ để giao diện đổi ngay, không phải chờ server render lại.
  const [active, setActive] = useState<ThemeName>(current);
  const router = useRouter();
  const reduce = useReducedMotion();

  function toggle() {
    const next = oppositeTheme(active);
    setActive(next);
    applyThemeAttribute(next);
    writeCookie(THEME_COOKIE, next, ONE_YEAR_SECONDS);
    router.refresh();
  }

  const label = THEME_META[active].switchTo[locale];
  const Icon = active === "dark" ? Sun : Moon;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className="text-ink-2 hover:text-ink relative rounded-full"
      aria-label={label}
      title={label}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={active}
          initial={reduce ? false : { rotate: -70, opacity: 0, scale: 0.6 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={reduce ? undefined : { rotate: 70, opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="grid place-items-center"
        >
          <Icon className="size-4" aria-hidden />
        </motion.span>
      </AnimatePresence>
    </Button>
  );
}
