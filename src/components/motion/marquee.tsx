"use client";

import { cn } from "@/lib/utils";

/**
 * Dải chạy ngang vô tận. Nội dung được nhân đôi và animation dịch đúng −50%,
 * nên điểm nối luôn khít — đây là lý do phải render `children` hai lần thay vì
 * dùng một bản rồi lặp animation.
 *
 * `aria-hidden` ở bản sao để trình đọc màn hình không đọc lặp nội dung.
 */
export function Marquee({
  children,
  className,
  itemClassName,
  reverse = false,
  duration = 44,
  gap = "gap-4",
}: {
  children: React.ReactNode;
  className?: string;
  itemClassName?: string;
  reverse?: boolean;
  /** Giây cho một vòng. Dải càng dài thì để càng lớn để tốc độ nhìn không đổi. */
  duration?: number;
  gap?: string;
}) {
  return (
    <div className={cn("lv-fade-x lv-pause-hover overflow-hidden", className)}>
      <div
        className={cn("flex w-max", gap, reverse ? "animate-lv-marquee-rev" : "animate-lv-marquee")}
        style={{ animationDuration: `${duration}s` }}
      >
        <div className={cn("flex shrink-0", gap, itemClassName)}>{children}</div>
        <div className={cn("flex shrink-0", gap, itemClassName)} aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * Dải chữ khổ lớn chạy ngang — dùng làm vách ngăn giữa các section.
 * Chữ viền rỗng xen kẽ chữ đặc để dải không thành một mảng màu nặng.
 */
export function TextMarquee({
  words,
  className,
  reverse = false,
  duration = 38,
}: {
  words: string[];
  className?: string;
  reverse?: boolean;
  duration?: number;
}) {
  return (
    <Marquee className={className} reverse={reverse} duration={duration} gap="gap-0">
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="flex shrink-0 items-center">
          <span
            className={cn(
              // leading-[1.25]: chừa chỗ cho dấu tiếng Việt, nếu không dải marquee
            // (overflow-hidden) cắt mất ngọn chữ ở "thẩm mỹ", "café".
            "px-6 text-[3.2rem] leading-[1.25] font-extrabold tracking-[-0.03em] whitespace-nowrap sm:text-[5rem] lg:text-[6.5rem]",
              i % 2 === 0 ? "text-ink" : "lv-text-outline",
            )}
          >
            {word}
          </span>
          <span className="bg-brand size-2.5 shrink-0 rounded-full sm:size-3.5" aria-hidden />
        </span>
      ))}
    </Marquee>
  );
}
