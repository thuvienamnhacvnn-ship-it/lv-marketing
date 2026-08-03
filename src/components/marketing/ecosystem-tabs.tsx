"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Photo } from "@/components/brand/photo";
import type { PhotoKey } from "@/data/media";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/vi";
import { cn } from "@/lib/utils";

const SCENES: { photo: PhotoKey; dot: string; text: string; ring: string }[] = [
  { photo: "interiorLiving", dot: "bg-sky", text: "text-sky-ink", ring: "border-sky" },
  { photo: "showroomSofa", dot: "bg-violet", text: "text-violet-ink", ring: "border-violet" },
  { photo: "cafeSign", dot: "bg-brand", text: "text-brand-ink", ring: "border-brand" },
  { photo: "teamWorking", dot: "bg-magenta", text: "text-magenta-ink", ring: "border-magenta" },
];

/**
 * Bốn bước hệ sinh thái dạng bấm chọn.
 *
 * Bản trước gắn bước đang xem vào tiến độ cuộn: muốn xem bước 4 thì buộc phải cuộn
 * qua hết ba bước trên, và không quay lại được nếu không cuộn ngược. Ở đây bấm phát
 * nào ra phát đó, cả section gói gọn trong một màn hình.
 *
 * Dùng `role="tablist"` để bàn phím đi được bằng Tab + Enter/Space như một bộ tab thật.
 */
export function EcosystemTabs({ locale, t }: { locale: Locale; t: Dictionary["ecosystem"] }) {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const step = t.steps[active];
  const scene = SCENES[active];

  return (
    <div className="mt-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
      {/* ── Danh sách bước ─────────────────────────────────── */}
      <div role="tablist" aria-label={t.eyebrow} className="flex flex-col gap-3">
        {t.steps.map((item, i) => {
          const on = i === active;
          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={on}
              aria-controls="lv-ecosystem-panel"
              onClick={() => setActive(i)}
              className={cn(
                "group relative overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300",
                on
                  ? "border-line-strong bg-paper-2 shadow-[var(--shadow-md)]"
                  : "border-line bg-paper-2/40 hover:bg-paper-2 hover:shadow-[var(--shadow-sm)]",
              )}
            >
              {/* Vạch màu bên trái báo bước đang chọn */}
              <motion.span
                className={cn("absolute inset-y-0 left-0 w-1", SCENES[i].dot)}
                initial={false}
                animate={{ scaleY: on ? 1 : 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                style={{ originY: 0.5 }}
                aria-hidden
              />

              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "text-xs font-bold tabular-nums transition-colors duration-300",
                    on ? SCENES[i].text : "text-ink-3",
                  )}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold text-white",
                    SCENES[i].dot,
                  )}
                >
                  {item.label}
                </span>
                <ArrowRight
                  className={cn(
                    "ml-auto size-4 transition-all duration-300",
                    on ? "text-ink translate-x-0 opacity-100" : "text-ink-3 -translate-x-1 opacity-0",
                  )}
                  aria-hidden
                />
              </div>

              <p
                className={cn(
                  "mt-3 text-base font-bold transition-colors duration-300",
                  on ? "text-ink" : "text-ink-2",
                )}
              >
                {item.title}
              </p>

              {/* Mô tả chỉ mở ở bước đang chọn — giữ danh sách ngắn, dễ quét mắt */}
              <motion.div
                initial={false}
                animate={{ height: on ? "auto" : 0, opacity: on ? 1 : 0 }}
                transition={
                  reduce ? { duration: 0 } : { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
                }
                className="overflow-hidden"
              >
                <p className="text-ink-2 pt-2 text-sm leading-relaxed">{item.text}</p>
              </motion.div>
            </button>
          );
        })}
      </div>

      {/* ── Ảnh của bước đang chọn ─────────────────────────── */}
      <div
        id="lv-ecosystem-panel"
        role="tabpanel"
        className="lv-shot relative h-[clamp(20rem,34vw,30rem)] lg:sticky lg:top-28"
      >
        {/* Mọi ảnh gắn sẵn và chỉ đổi độ mờ — tháo/lắp sẽ thấy nháy trắng khi đổi bước. */}
        {SCENES.map((item, i) => (
          <div
            key={item.photo}
            className="absolute inset-0 transition-opacity duration-500 ease-out"
            style={{ opacity: i === active ? 1 : 0 }}
            aria-hidden={i !== active}
          >
            <Photo
              name={item.photo}
              locale={locale}
              width={1100}
              height={760}
              sizes="(min-width: 1024px) 52vw, 92vw"
              className="h-full w-full"
            />
          </div>
        ))}

        <span
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
          style={{
            background: "linear-gradient(to top, rgba(20,23,26,0.82) 0%, transparent 100%)",
          }}
          aria-hidden
        />

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-6 sm:p-8">
          <div className="min-w-0">
            <span
              className={cn(
                "inline-flex rounded-full px-3 py-1 text-[0.68rem] font-bold text-white",
                scene.dot,
              )}
            >
              {step.label}
            </span>
            <p className="mt-3 text-xl font-extrabold text-white sm:text-2xl">{step.title}</p>
          </div>
          <span
            className="shrink-0 text-[4rem] leading-none font-extrabold text-white/35 sm:text-[5.5rem]"
            aria-hidden
          >
            {String(active + 1).padStart(2, "0")}
          </span>
        </div>
      </div>
    </div>
  );
}
