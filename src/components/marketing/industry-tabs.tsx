"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Flower2, Hand, Store, Utensils, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Photo } from "@/components/brand/photo";
import { INDUSTRIES } from "@/config/solutions";
import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n/config";

const ICONS: Record<string, LucideIcon> = {
  utensils: Utensils,
  hand: Hand,
  flower: Flower2,
  store: Store,
};

/** Mỗi ngành một sắc riêng — nền, chữ và dấu tích đổi theo. */
const TONES = [
  { tint: "bg-brand-tint", text: "text-brand-ink", solid: "bg-brand", ring: "ring-brand/25" },
  { tint: "bg-magenta-tint", text: "text-magenta-ink", solid: "bg-magenta", ring: "ring-magenta/25" },
  { tint: "bg-sky-tint", text: "text-sky-ink", solid: "bg-sky", ring: "ring-sky/25" },
  { tint: "bg-violet-tint", text: "text-violet-ink", solid: "bg-violet", ring: "ring-violet/25" },
];

export function IndustryTabs({ locale }: { locale: Locale }) {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const current = INDUSTRIES[active];
  const tone = TONES[active % TONES.length];
  const Icon = ICONS[current.icon] ?? Store;

  return (
    <div>
      {/* Thanh chọn ngành */}
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {INDUSTRIES.map((industry, i) => {
          const ItemIcon = ICONS[industry.icon] ?? Store;
          const selected = i === active;
          const itemTone = TONES[i % TONES.length];
          return (
            <button
              key={industry.slug}
              type="button"
              aria-pressed={selected}
              onClick={() => setActive(i)}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-300",
                selected
                  ? cn(itemTone.tint, itemTone.text, "shadow-[var(--shadow-sm)] ring-1", itemTone.ring)
                  : "text-ink-3 hover:bg-paper-3 hover:text-ink",
              )}
            >
              <ItemIcon className="size-4" aria-hidden />
              {industry.name[locale]}
            </button>
          );
        })}
      </div>

      {/* Nội dung ngành */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.slug}
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -10 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="lv-card mt-6 grid overflow-hidden rounded-3xl lg:grid-cols-[1.05fr_1fr]"
        >
          {/* Ảnh ngành */}
          <div className="relative min-h-[15rem] lg:min-h-[27rem]">
            <Photo
              name={current.photo}
              locale={locale}
              width={820}
              height={760}
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="absolute inset-0 h-full w-full"
            />
            <span
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(20,23,26,0) 45%, rgba(20,23,26,0.55) 100%)",
              }}
              aria-hidden
            />
            <span
              className={cn(
                "absolute top-4 left-4 grid size-11 place-items-center rounded-2xl shadow-[var(--shadow-md)]",
                tone.tint,
                tone.text,
              )}
            >
              <Icon className="size-5" aria-hidden />
            </span>
          </div>

          {/* Danh sách tính năng */}
          <div className="p-7 sm:p-9 lg:p-10">
            <h3 className="text-ink text-2xl font-extrabold">{current.name[locale]}</h3>
            <p className="text-ink-2 mt-3 text-base leading-relaxed">{current.lead[locale]}</p>

            <ul className="mt-7 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {current.features[locale].map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <span
                    className={cn(
                      "mt-0.5 grid size-4 shrink-0 place-items-center rounded-full",
                      tone.solid,
                    )}
                  >
                    <Check className="size-2.5 text-white" strokeWidth={3.5} aria-hidden />
                  </span>
                  <span className="text-ink-2 text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              className="mt-8 rounded-full"
              size="lg"
              render={<Link href={`/${locale}/nganh-nghe#${current.slug}`} />}
            >
              {current.name[locale]}
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
