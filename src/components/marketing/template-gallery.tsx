"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Maximize2, X } from "lucide-react";
import { TemplateCard } from "@/components/marketing/template-card";
import {
  MARKETING_TEMPLATES,
  SHAPE_RATIO,
  TEMPLATE_CATEGORIES,
  type MarketingTemplate,
  type TemplateCategory,
} from "@/data/templates";
import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n/config";

/** Ô trong lưới — dạng dọc chiếm 2 hàng, dạng ngang chiếm 2 cột. */
const SPAN: Record<MarketingTemplate["shape"], string> = {
  story: "sm:row-span-2",
  portrait: "sm:row-span-2",
  square: "",
  landscape: "",
  wide: "sm:col-span-2",
};

export function TemplateGallery({ locale }: { locale: Locale }) {
  const [filter, setFilter] = useState<TemplateCategory | "all">("all");
  const [preview, setPreview] = useState<MarketingTemplate | null>(null);
  const reduce = useReducedMotion();

  const visible =
    filter === "all"
      ? MARKETING_TEMPLATES
      : MARKETING_TEMPLATES.filter((item) => item.category === filter);

  return (
    <div>
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {TEMPLATE_CATEGORIES.map((category) => {
          const active = category.key === filter;
          return (
            <button
              key={category.key}
              type="button"
              onClick={() => setFilter(category.key)}
              aria-pressed={active}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all duration-300",
                active
                  ? "lv-slab shadow-[var(--shadow-sm)]"
                  : "text-ink-3 hover:bg-paper-3 hover:text-ink",
              )}
            >
              {category.label[locale]}
            </button>
          );
        })}
      </div>

      <motion.div
        layout={!reduce}
        // Thêm cột ở màn rộng: trang tràn hai mép, dừng ở 4 cột thì mỗi ô rộng
        // gần 600px và các mẫu dọc (`row-span-2`) đội chiều cao lưới lên rất nhiều.
        className="mt-7 grid auto-rows-min grid-flow-row-dense grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
      >
        <AnimatePresence mode="popLayout">
          {visible.map((item) => (
            <motion.div
              key={item.slug}
              layout={!reduce}
              initial={reduce ? false : { opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className={SPAN[item.shape]}
            >
              <button
                type="button"
                onClick={() => setPreview(item)}
                aria-label={item.name[locale]}
                className="lv-card lv-card-hover group/card relative block w-full overflow-hidden rounded-2xl p-0 text-left"
              >
                <TemplateCard template={item} locale={locale} />

                <span
                  className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100"
                  style={{
                    background:
                      "linear-gradient(0deg, rgba(20,23,26,0.92) 0%, rgba(20,23,26,0.5) 60%, transparent 100%)",
                  }}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-semibold text-white">
                      {item.name[locale]}
                    </span>
                    <span className="mt-0.5 block truncate text-[0.65rem] text-white/70">
                      {item.format[locale]}
                    </span>
                  </span>
                  <Maximize2 className="size-3.5 shrink-0 text-white" aria-hidden />
                </span>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {preview ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-10"
            style={{ background: "rgba(20,23,26,0.72)", backdropFilter: "blur(8px)" }}
            onClick={() => setPreview(null)}
            role="dialog"
            aria-modal="true"
            aria-label={preview.name[locale]}
          >
            <motion.div
              initial={reduce ? false : { scale: 0.95, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={reduce ? undefined : { scale: 0.97, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="bg-paper-2 relative w-full rounded-3xl p-3 shadow-[var(--shadow-xl)]"
              style={{
                maxWidth: `min(92vw, ${Math.round(74 * SHAPE_RATIO[preview.shape])}vh)`,
              }}
              onClick={(event) => event.stopPropagation()}
            >
              <TemplateCard
                template={preview}
                locale={locale}
                className="rounded-2xl"
              />
              <div className="mt-3 flex items-center justify-between gap-4 px-2 pb-1">
                <div className="min-w-0">
                  <p className="text-ink truncate text-sm font-bold">{preview.name[locale]}</p>
                  <p className="text-ink-3 truncate text-xs">{preview.format[locale]}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreview(null)}
                  className="text-ink-3 hover:bg-paper-3 hover:text-ink shrink-0 rounded-full p-2 transition-colors"
                  aria-label="Close"
                >
                  <X className="size-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
