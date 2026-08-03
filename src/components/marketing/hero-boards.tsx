"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { RotatingPhoto } from "@/components/marketing/rotating-photo";
import { PHOTOS, type PhotoKey } from "@/data/media";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

/** Đổi cả ảnh lẫn bố cục sau mỗi nhịp này. */
const STEP_MS = 5200;

const BOARDS: { key: string; photos: readonly PhotoKey[] }[] = [
  { key: "a", photos: ["restaurantInteriorWarm", "cafeInterior", "showroomSofa", "retailStore"] },
  { key: "b", photos: ["nailsPink", "spaFacial", "manicureWork", "spaStones"] },
  { key: "c", photos: ["fineDiningPlate", "spaProducts", "cafeTable", "nailsDark"] },
];

/**
 * Ba cách xếp ba board trong cùng một lưới 3 cột × 2 hàng.
 *
 * Đặt vị trí TƯỜNG MINH bằng `col-start`/`row-start` chứ không thả cho lưới tự
 * dồn: `grid-auto-flow` sẽ xếp lại theo thứ tự DOM nên board đổi chỗ cho nhau
 * một cách khó đoán, và hiệu ứng trượt của framer-motion trông như nhảy loạn.
 *
 * Các chuỗi class phải viết thẳng ở đây — Tailwind quét mã nguồn dạng tĩnh nên
 * ghép chuỗi động (`col-start-${n}`) sẽ không sinh ra class nào.
 */
const LAYOUTS: [string, string, string][] = [
  [
    "col-start-1 col-span-2 row-start-1 row-span-2",
    "col-start-3 row-start-1",
    "col-start-3 row-start-2",
  ],
  [
    "col-start-1 col-span-2 row-start-1",
    "col-start-3 row-start-1 row-span-2",
    "col-start-1 col-span-2 row-start-2",
  ],
  [
    "col-start-1 row-start-1 row-span-2",
    "col-start-2 col-span-2 row-start-1",
    "col-start-2 col-span-2 row-start-2",
  ],
];

export function HeroBoards({ locale }: { locale: Locale }) {
  const [step, setStep] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const timer = window.setInterval(() => setStep((s) => s + 1), STEP_MS);
    return () => window.clearInterval(timer);
  }, [reduce]);

  const layout = LAYOUTS[step % LAYOUTS.length];

  return (
    <div
      className="grid h-[clamp(16rem,26vw,27rem)] grid-cols-3 grid-rows-2 gap-4"
      onMouseLeave={() => setHovered(null)}
    >
      {BOARDS.map((board, i) => {
        const photo = board.photos[step % board.photos.length];
        const isHovered = hovered === i;
        const dimmed = hovered !== null && !isHovered;

        return (
          <motion.div
            key={board.key}
            // `layout` để framer đo vị trí cũ/mới rồi tự trượt board sang ô mới.
            layout
            onMouseEnter={() => setHovered(i)}
            animate={{
              opacity: dimmed ? 0.5 : 1,
              scale: isHovered ? 1.03 : 1,
              filter: dimmed ? "saturate(0.55)" : "saturate(1)",
            }}
            transition={{
              layout: { duration: reduce ? 0 : 0.75, ease: [0.22, 1, 0.36, 1] },
              default: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
            }}
            style={{ boxShadow: i === 0 ? "var(--shadow-xl)" : "var(--shadow-lg)" }}
            className={cn(
              "lv-shot group relative z-0 cursor-pointer",
              layout[i],
              isHovered && "z-10",
            )}
          >
            <RotatingPhoto
              names={board.photos}
              locale={locale}
              index={step}
              width={i === 0 ? 1100 : 560}
              height={i === 0 ? 760 : 420}
              sizes={i === 0 ? "(min-width: 1024px) 36vw, 92vw" : "(min-width: 1024px) 18vw, 45vw"}
              priority={i === 0}
              imageClassName="transition-transform duration-[900ms] ease-out group-hover:scale-[1.08]"
            />

            {/* Nhãn hiện khi rê chuột — dùng luôn alt song ngữ trong registry ảnh */}
            <span
              className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 p-4 opacity-0 transition-all duration-400 group-hover:translate-y-0 group-hover:opacity-100"
              style={{
                background:
                  "linear-gradient(0deg, rgba(20,23,26,0.88) 0%, rgba(20,23,26,0.35) 60%, transparent 100%)",
              }}
            >
              <span className="block text-xs font-semibold text-white sm:text-sm">
                {PHOTOS[photo].alt[locale]}
              </span>
            </span>

            {/* Viền sáng khi rê chuột */}
            <span
              className={cn(
                "pointer-events-none absolute inset-0 rounded-[inherit] ring-2 ring-inset transition-opacity duration-300",
                isHovered ? "ring-brand/70 opacity-100" : "opacity-0",
              )}
              aria-hidden
            />
          </motion.div>
        );
      })}
    </div>
  );
}
