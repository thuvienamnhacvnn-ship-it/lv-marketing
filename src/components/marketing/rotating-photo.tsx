"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Photo } from "@/components/brand/photo";
import type { PhotoKey } from "@/data/media";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

/**
 * Board ảnh tự đổi — chuyển mềm giữa vài ảnh trong cùng một khung.
 *
 * Mọi ảnh đều được gắn sẵn và chồng lên nhau, chỉ đổi `opacity`. Nếu tháo/lắp
 * theo lượt thì mỗi lần đổi trình duyệt phải tải ảnh mới rồi mới vẽ, nên sẽ thấy
 * một nháy trắng giữa hai ảnh.
 *
 * `delayMs` để lệch pha giữa các board: nếu mọi board cùng đổi một lúc thì cả
 * banner chớp một nhịp, trông như lỗi tải trang.
 */
export function RotatingPhoto({
  names,
  locale,
  width,
  height,
  sizes,
  sourceWidth,
  priority,
  className,
  imageClassName,
  intervalMs = 4600,
  delayMs = 0,
  index: controlledIndex,
}: {
  names: readonly PhotoKey[];
  locale: Locale;
  width: number;
  height: number;
  sizes?: string;
  sourceWidth?: number;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
  intervalMs?: number;
  delayMs?: number;
  /**
   * Truyền vào để bên ngoài cầm nhịp. Cần khi ảnh phải đổi ĐÚNG LÚC với một thứ
   * khác (ở banner là lúc lưới ảnh đổi bố cục) — hai bộ đếm riêng sẽ trôi lệch
   * nhau dần và trông như hai hiệu ứng rời rạc.
   */
  index?: number;
}) {
  const [selfIndex, setSelfIndex] = useState(0);
  const reduce = useReducedMotion();
  const controlled = controlledIndex !== undefined;
  const index = controlled ? controlledIndex % names.length : selfIndex;

  useEffect(() => {
    if (controlled || reduce || names.length < 2) return;

    let interval: number | undefined;
    const timeout = window.setTimeout(() => {
      setSelfIndex((i) => (i + 1) % names.length);
      interval = window.setInterval(() => setSelfIndex((i) => (i + 1) % names.length), intervalMs);
    }, delayMs + intervalMs);

    return () => {
      window.clearTimeout(timeout);
      if (interval) window.clearInterval(interval);
    };
  }, [controlled, reduce, names.length, intervalMs, delayMs]);

  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      {names.map((name, i) => (
        <div
          key={name}
          className="absolute inset-0 transition-opacity duration-[1100ms] ease-in-out"
          style={{ opacity: i === index ? 1 : 0 }}
          // Chỉ ảnh đang hiện mới nằm trong luồng đọc của trình đọc màn hình.
          aria-hidden={i !== index}
        >
          <Photo
            name={name}
            locale={locale}
            width={width}
            height={height}
            sizes={sizes}
            sourceWidth={sourceWidth}
            priority={priority && i === 0}
            className={cn("h-full w-full", imageClassName)}
          />
        </div>
      ))}
    </div>
  );
}
