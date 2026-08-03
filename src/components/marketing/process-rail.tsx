"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { Reveal } from "@/components/motion/reveal";
import type { Dictionary } from "@/i18n/dictionaries/vi";
import { cn } from "@/lib/utils";

const TONES = [
  "bg-brand-tint text-brand-ink",
  "bg-violet-tint text-violet-ink",
  "bg-mint-tint text-mint-ink",
  "bg-amber-tint text-amber-ink",
  "bg-sky-tint text-sky-ink",
  "bg-magenta-tint text-magenta-ink",
];

/**
 * Tám bước quy trình.
 *
 * Bố cục đổi theo bề rộng vì cùng một nội dung không thể vừa đọc tốt trên điện
 * thoại vừa không kéo dài lê thê trên màn rộng:
 * - dưới `xl`: xếp dọc, trục nằm sát mép trái, vạch tiến độ chạy từ trên xuống;
 * - từ `xl`: lưới 4 cột × 2 hàng, trục nằm ngang phía trên mỗi hàng, vạch chạy
 *   từ trái sang. Cách này cắt chiều cao section xuống còn khoảng một nửa.
 *
 * Bản dọc trước đây cao 1.44 màn hình chỉ để liệt kê 8 ô chữ ngắn — quá tốn cuộn
 * cho lượng thông tin thực sự có.
 */
export function ProcessRail({ t }: { t: Dictionary["process"] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "end 70%"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 80, damping: 24, mass: 0.4 });

  const rows = [t.steps.slice(0, 4), t.steps.slice(4)];

  return (
    <div ref={ref} className="mt-14">
      {/* ── Dưới xl: một cột, trục dọc bên trái ─────────────── */}
      <div className="relative xl:hidden">
        <div className="bg-line absolute top-0 bottom-0 left-[0.9rem] w-px" aria-hidden>
          <motion.div
            className="from-brand via-magenta to-violet h-full w-full origin-top bg-gradient-to-b"
            style={{ scaleY: reduce ? 1 : progress }}
          />
        </div>

        <ol className="space-y-5">
          {t.steps.map((step, i) => (
            <li key={step.title} className="relative pl-11">
              <Dot className="top-5 left-[0.9rem] -translate-x-1/2" />
              <Reveal direction="right" delay={0.03}>
                <StepCard step={step} index={i} />
              </Reveal>
            </li>
          ))}
        </ol>
      </div>

      {/* ── Từ xl: 4 cột × 2 hàng, trục ngang ───────────────── */}
      <div className="hidden xl:block">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className={cn("relative", rowIndex === 1 && "mt-12")}>
            {/* Trục ngang của hàng */}
            <div className="bg-line relative h-px w-full" aria-hidden>
              <motion.div
                className="from-brand via-magenta to-violet absolute inset-0 origin-left bg-gradient-to-r"
                style={{ scaleX: reduce ? 1 : progress }}
              />
            </div>

            <ol className="grid grid-cols-4 gap-7 2xl:gap-10">
              {row.map((step, i) => {
                const index = rowIndex * 4 + i;
                return (
                  <li key={step.title} className="relative pt-8">
                    <Dot className="top-0 left-0 -translate-y-1/2" />
                    <Reveal direction="up" delay={0.04 * i}>
                      <StepCard step={step} index={index} />
                    </Reveal>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Chấm trên trục. Viền dày lấy đúng nền của section (`paper-3`) để chấm trông như
 * "đục lỗ" qua đường kẻ — dùng `border-paper` sẽ lộ vành sáng hơn nền.
 */
function Dot({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "border-paper-3 bg-brand absolute z-10 size-3 rounded-full border-[3px]",
        className,
      )}
      aria-hidden
    />
  );
}

function StepCard({ step, index }: { step: { title: string; text: string }; index: number }) {
  return (
    <div className="lv-card lv-card-hover h-full rounded-2xl p-5">
      <span
        className={cn(
          "inline-grid size-9 place-items-center rounded-xl text-xs font-extrabold",
          TONES[index % TONES.length],
        )}
      >
        {String(index + 1).padStart(2, "0")}
      </span>
      <h3 className="text-ink mt-4 text-base font-bold">{step.title}</h3>
      <p className="text-ink-2 mt-2 text-sm leading-relaxed">{step.text}</p>
    </div>
  );
}
