"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Play, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LvLogo } from "@/components/brand/lv-logo";
import { Photo } from "@/components/brand/photo";
import { HeroBoards } from "@/components/marketing/hero-boards";
import { TemplateCard } from "@/components/marketing/template-card";
import { DashboardPreview } from "@/components/marketing/dashboard-preview";
import { MARKETING_TEMPLATES } from "@/data/templates";
import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/vi";

const ROTATE_MS = 2600;

/** Template hiện trong khung điện thoại — chọn bản bài đăng nhà hàng. */
const PHONE_TEMPLATE = MARKETING_TEMPLATES.find((t) => t.slug === "post-restaurant")!;


/** Chữ nhô lên từng dòng khi vào trang. */
const RISE = {
  hidden: { y: "110%" },
  show: (i: number) => ({
    y: "0%",
    transition: { duration: 0.75, delay: 0.06 * i, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function HeroStage({ locale, t }: { locale: Locale; t: Dictionary["hero"] }) {
  const [word, setWord] = useState(0);
  const reduce = useReducedMotion();
  // Chữ vừa rời đi phải trượt LÊN, khác với các chữ đang chờ ở bên dưới.
  const previous = (word - 1 + t.rotating.length) % t.rotating.length;

  useEffect(() => {
    if (reduce) return;
    const timer = window.setInterval(() => setWord((w) => (w + 1) % t.rotating.length), ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [reduce, t.rotating.length]);

  return (
    <section className="lv-hero-frame relative overflow-hidden py-10">
      <MeshBackdrop />

      <div className="lv-container relative grid w-full items-center gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14 2xl:gap-16">
        {/*
          `lg:ms-[3cm]` — đẩy cả cụm chữ vào trong 3cm. Dùng đơn vị `cm` thật chứ
          không quy đổi ra px: CSS hiểu `cm` trực tiếp (1cm = 37.8px ở 96dpi) nên
          giữ nguyên con số cho dễ chỉnh lại sau. Chỉ áp dụng từ `lg` trở lên —
          màn hẹp mà thụt vào 3cm thì chữ không còn chỗ.
        */}
        <div className="w-full lg:ms-[3cm]">
          {/* ── Logo LV cỡ lớn ─────────────────────────────── */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="flex flex-wrap items-center gap-5"
          >
            <LvLogo size={104} priority className="shrink-0" />
            <span className="flex flex-col leading-none">
              <span className="font-display text-ink text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">
                LV GROUP
              </span>
              <span className="text-ink-3 mt-2 text-[0.7rem] font-bold tracking-[0.22em] uppercase">
                Marketing Hub
              </span>
            </span>
          </motion.div>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lv-eyebrow mt-7"
          >
            <Sparkles className="size-3.5" aria-hidden />
            {t.poweredBy}
          </motion.p>

          {/* Mỗi dòng nằm trong ô `overflow-hidden` để chữ nhô lên từ dưới. */}
          <h1 className="lv-display text-ink mt-5">
            <span className="block overflow-hidden">
              <motion.span
                className="block"
                variants={RISE}
                custom={0}
                initial={reduce ? false : "hidden"}
                animate="show"
              >
                {t.linePre}
              </motion.span>
            </span>

            {/*
              Dòng chữ chạy. Cố ý KHÔNG dùng `AnimatePresence`: phần tử thoát không
              được dọn kịp nên sau vài vòng cả sáu chữ cùng tồn tại và đè lên dòng
              trên. Ở đây mọi chữ luôn gắn sẵn, chỉ đổi vị trí — chữ đang hiện ở 0%,
              chữ vừa rời đi trượt lên trên, còn lại xếp bên dưới.
            */}
            <span className="relative block h-[1.14em] overflow-hidden" aria-hidden>
              {t.rotating.map((item, i) => (
                <motion.span
                  key={item}
                  initial={false}
                  animate={{ y: i === word ? "0%" : i === previous ? "-110%" : "110%" }}
                  transition={
                    reduce ? { duration: 0 } : { duration: 0.62, ease: [0.22, 1, 0.36, 1] }
                  }
                  className="lv-gradient-text absolute inset-x-0 top-0 block"
                >
                  {item}
                </motion.span>
              ))}
            </span>
            {/* Ngăn xếp trên là hiệu ứng thị giác — cho trình đọc màn hình một câu ổn định. */}
            <span className="sr-only">{t.rotating[0]}</span>

            <span className="block overflow-hidden">
              <motion.span
                className="block"
                variants={RISE}
                custom={2}
                initial={reduce ? false : "hidden"}
                animate="show"
              >
                {t.linePost}
              </motion.span>
            </span>
          </h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.34 }}
            className="text-ink-2 mt-6 max-w-xl text-lg leading-relaxed xl:text-xl"
          >
            {t.sub}
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.42 }}
            className="mt-7 flex flex-wrap items-center gap-3"
          >
            <Button
              size="xl"
              className="rounded-full shadow-[var(--shadow-brand)]"
              render={<Link href="/register" />}
            >
              {t.primaryCta}
              <ArrowRight className="size-4" aria-hidden />
            </Button>
            <Button
              size="xl"
              variant="outline"
              className="rounded-full"
              render={<Link href={`/${locale}/lien-he`} />}
            >
              <Play className="size-4" aria-hidden />
              {t.secondaryCta}
            </Button>
          </motion.div>

          {/* Dải tin cậy */}
          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.52 }}
            className="border-line mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t pt-6"
          >
            <span className="flex -space-x-2.5">
              {(["portraitWoman", "portraitMan", "teamWorking"] as const).map((name) => (
                <span
                  key={name}
                  className="border-paper-2 size-9 overflow-hidden rounded-full border-2"
                >
                  <Photo
                    name={name}
                    locale={locale}
                    width={72}
                    height={72}
                    sourceWidth={120}
                    className="h-full w-full"
                  />
                </span>
              ))}
            </span>
            <span className="flex items-center gap-1.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="fill-amber text-amber size-3.5" aria-hidden />
              ))}
            </span>
            <span className="text-ink-3 max-w-xs text-xs leading-snug">{t.trust}</span>
          </motion.div>
        </div>

        {/* ── Sân khấu ảnh ─────────────────────────────────── */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full"
        >
          {/* Cụm ảnh: đổi ảnh và đổi luôn bố cục theo cùng một nhịp, kèm hiệu ứng rê chuột. */}
          <HeroBoards locale={locale} />

          {/* Hàng dưới: thẻ đánh giá + bảng số liệu + template trên điện thoại */}
          <div className="mt-4 grid grid-cols-3 gap-4">
            <ReviewCard t={t} locale={locale} />

            <div className="lv-card flex flex-col justify-between rounded-3xl p-4">
              <DashboardPreview variant="analytics" bare />
            </div>

            <div className="lv-slab rounded-3xl p-2" style={{ boxShadow: "var(--shadow-xl)" }}>
              <div className="overflow-hidden rounded-[1.4rem]">
                <TemplateCard template={PHONE_TEMPLATE} locale={locale} />
              </div>
            </div>
          </div>

          {/* Chip màu nổi trên góc board lớn */}
          <span className="bg-brand absolute -top-3 left-6 z-20 rounded-full px-3.5 py-1.5 text-xs font-bold text-white shadow-[var(--shadow-brand)]">
            +38 % đặt bàn
          </span>
        </motion.div>
      </div>
    </section>
  );
}

/** Thẻ đánh giá khách hàng — điểm Google, sao, và một trích dẫn ngắn. */
function ReviewCard({ t, locale }: { t: Dictionary["hero"]; locale: Locale }) {
  return (
    <div className="lv-card flex flex-col rounded-3xl p-4">
      <div className="flex items-center gap-2.5">
        <span className="bg-amber-tint text-amber-ink grid size-8 shrink-0 place-items-center rounded-full">
          <Star className="size-4 fill-current" aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="text-ink block text-lg leading-none font-extrabold">
            {t.reviewScore}
          </span>
          <span className="text-ink-3 mt-1 block truncate text-[0.65rem]">
            {t.reviewSource} · {t.reviewCount}
          </span>
        </span>
      </div>

      <div className="mt-3 flex items-center gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} className="fill-amber text-amber size-3" aria-hidden />
        ))}
      </div>

      <p className="text-ink-2 mt-3 line-clamp-4 text-xs leading-relaxed">“{t.reviewQuote}”</p>

      <div className="mt-auto flex items-center gap-2 pt-3">
        <span className="border-line size-7 shrink-0 overflow-hidden rounded-full border">
          <Photo
            name="portraitWoman"
            locale={locale}
            width={56}
            height={56}
            sourceWidth={96}
            className="h-full w-full"
          />
        </span>
        <span className="text-ink-3 min-w-0 truncate text-[0.65rem]">{t.reviewAuthor}</span>
      </div>

      {/* Bắt buộc ghi rõ: đây là nội dung dựng để minh hoạ, không phải đánh giá thật. */}
      <p className="text-ink-3/70 mt-2 text-[0.6rem]">{t.reviewDisclaimer}</p>
    </div>
  );
}

/** Nền mesh gradient động — đổi màu theo theme qua biến `--hero-mesh-*`. */
function MeshBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="lv-grid-bg absolute inset-0 opacity-40" />
      {[
        { c: "var(--hero-mesh-1)", cls: "-top-40 -left-32 size-[42rem]", delay: "0s" },
        { c: "var(--hero-mesh-2)", cls: "-top-24 right-0 size-[38rem]", delay: "-8s" },
        { c: "var(--hero-mesh-3)", cls: "top-1/2 left-1/3 size-[34rem]", delay: "-16s" },
      ].map((blob) => (
        <div
          key={blob.cls}
          className={cn("animate-lv-blob absolute rounded-full blur-[120px]", blob.cls)}
          style={{
            background: `radial-gradient(circle, ${blob.c} 0%, transparent 68%)`,
            opacity: "var(--hero-mesh-alpha)",
            animationDelay: blob.delay,
          }}
        />
      ))}
      <div
        className="absolute inset-x-0 bottom-0 h-40"
        style={{ background: "linear-gradient(to top, var(--paper), transparent)" }}
      />
    </div>
  );
}
