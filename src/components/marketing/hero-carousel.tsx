"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Globe,
  Hand,
  LineChart,
  MessagesSquare,
  Pause,
  Play,
  Share2,
  Sparkles,
  Star,
  Ticket,
  Utensils,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Photo } from "@/components/brand/photo";
import { DashboardPreview } from "@/components/marketing/dashboard-preview";
import { SOLUTIONS } from "@/config/solutions";
import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/vi";

const ICONS: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  share2: Share2,
  utensils: Utensils,
  hand: Hand,
  messagesSquare: MessagesSquare,
  star: Star,
  ticket: Ticket,
  globe: Globe,
  lineChart: LineChart,
};

/** Mỗi giải pháp có một sắc riêng để dải slide không bị đơn điệu. */
const TONES = [
  { chip: "bg-brand-tint text-brand-ink", dot: "bg-brand", ring: "ring-brand/30" },
  { chip: "bg-violet-tint text-violet-ink", dot: "bg-violet", ring: "ring-violet/30" },
  { chip: "bg-amber-tint text-amber-ink", dot: "bg-amber", ring: "ring-amber/40" },
  { chip: "bg-magenta-tint text-magenta-ink", dot: "bg-magenta", ring: "ring-magenta/30" },
  { chip: "bg-sky-tint text-sky-ink", dot: "bg-sky", ring: "ring-sky/30" },
];

const AUTOPLAY_MS = 7000;

export function HeroCarousel({ locale, t }: { locale: Locale; t: Dictionary["hero"] }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [inView, setInView] = useState(true);
  const reduce = useReducedMotion();
  const railRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const go = useCallback((next: number) => {
    setIndex(((next % SOLUTIONS.length) + SOLUTIONS.length) % SOLUTIONS.length);
  }, []);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.3,
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!playing || !inView || reduce) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % SOLUTIONS.length), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [playing, inView, reduce]);

  // Cuộn ngang riêng thanh chọn — không dùng scrollIntoView vì nó kéo cả trang.
  useEffect(() => {
    const rail = railRef.current;
    const active = rail?.querySelector<HTMLElement>(`[data-slide="${index}"]`);
    if (!rail || !active) return;
    const target = active.offsetLeft - rail.clientWidth / 2 + active.clientWidth / 2;
    rail.scrollTo({ left: Math.max(0, target), behavior: reduce ? "auto" : "smooth" });
  }, [index, reduce]);

  const slide = SOLUTIONS[index];
  const Icon = ICONS[slide.icon] ?? Sparkles;
  const tone = TONES[index % TONES.length];

  return (
    <div ref={rootRef} className="relative">
      <div className="lv-card overflow-hidden rounded-3xl">
        <div className="grid lg:grid-cols-[1fr_1.08fr]">
          {/* Nội dung */}
          <div className="order-2 p-7 sm:p-10 lg:order-1 lg:p-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.slug}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "grid size-11 place-items-center rounded-2xl ring-1",
                      tone.chip,
                      tone.ring,
                    )}
                  >
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className={cn("lv-chip", tone.chip, "border-transparent")}>
                    {t.slideOf} {String(index + 1).padStart(2, "0")} / {SOLUTIONS.length}
                  </span>
                </div>

                <h3 className="text-ink mt-6 text-2xl font-extrabold sm:text-[1.75rem]">
                  {slide.name[locale]}
                </h3>
                <p className="text-ink-2 mt-4 text-base leading-relaxed">{slide.summary[locale]}</p>

                <div className="bg-paper-3 mt-7 rounded-2xl p-4">
                  <p className="text-ink-3 text-[0.68rem] font-semibold tracking-[0.12em] uppercase">
                    {t.exampleLabel}
                  </p>
                  <p className="text-ink mt-2 text-sm leading-relaxed">{slide.example[locale]}</p>
                </div>

                <dl className="mt-7 flex flex-wrap gap-x-9 gap-y-4">
                  {slide.metrics.map((metric) => (
                    <div key={metric.label[locale]}>
                      <dd className="text-ink text-2xl font-extrabold">{metric.value}</dd>
                      <dt className="text-ink-3 mt-1 text-xs">{metric.label[locale]}</dt>
                    </div>
                  ))}
                </dl>

                <div className="mt-8 flex flex-wrap gap-2.5">
                  <Button
                    size="lg"
                    className="rounded-full"
                    render={<Link href={`/${locale}/giai-phap#${slide.slug}`} />}
                  >
                    {t.viewSolution}
                    <ArrowRight className="size-4" aria-hidden />
                  </Button>
                  <Button
                    size="lg"
                    variant="ghost"
                    className="text-ink-2 hover:text-ink rounded-full"
                    render={<Link href={`/${locale}/lien-he?solution=${slide.slug}`} />}
                  >
                    {t.secondaryCta}
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Ảnh + mockup giao diện chồng lên */}
          <div className="bg-paper-3 relative order-1 min-h-[19rem] overflow-hidden lg:order-2 lg:min-h-[34rem]">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${slide.slug}-visual`}
                initial={reduce ? false : { opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduce ? undefined : { opacity: 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <Photo
                  name={slide.photo}
                  locale={locale}
                  width={900}
                  height={900}
                  sizes="(min-width: 1024px) 52vw, 100vw"
                  className="h-full w-full"
                  priority={index === 0}
                />
                <span
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(200deg, rgba(20,23,26,0.05) 0%, rgba(20,23,26,0.42) 100%)",
                  }}
                  aria-hidden
                />
              </motion.div>
            </AnimatePresence>

            {/* Thẻ giao diện nổi trên ảnh */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${slide.slug}-ui`}
                initial={reduce ? false : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -12 }}
                transition={{ duration: 0.45, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="absolute right-4 bottom-4 left-4 lg:right-7 lg:bottom-7 lg:left-auto lg:w-[22rem]"
              >
                <DashboardPreview variant={slide.preview} floating />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Điều hướng */}
      <div className="mt-5 flex items-center gap-3">
        <div className="flex shrink-0 gap-1.5">
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous"
            className="lv-round-btn text-ink-2 size-9"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next"
            className="lv-round-btn text-ink-2 size-9"
          >
            <ChevronRight className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? t.autoplayPause : t.autoplayPlay}
            className="lv-round-btn text-ink-2 size-9"
          >
            {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
          </button>
        </div>

        <div ref={railRef} className="no-scrollbar lv-fade-x flex flex-1 gap-1.5 overflow-x-auto">
          {SOLUTIONS.map((item, i) => (
            <button
              key={item.slug}
              data-slide={i}
              type="button"
              onClick={() => go(i)}
              aria-current={i === index}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-2 text-[0.82rem] font-medium whitespace-nowrap transition-all duration-300",
                i === index
                  ? cn(TONES[i % TONES.length].chip, "shadow-[var(--shadow-sm)]")
                  : "text-ink-3 hover:bg-paper-3 hover:text-ink",
              )}
            >
              {item.name[locale]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
