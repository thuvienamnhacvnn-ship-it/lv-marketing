"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  CalendarDays,
  Inbox,
  Megaphone,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { TourScreen } from "@/components/marketing/tour-screens";
import { TOUR_MODULES, type TourKey } from "@/data/platform-tour";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  calendar: CalendarDays,
  inbox: Inbox,
  star: Star,
  megaphone: Megaphone,
  users: Users,
};

const LABELS = {
  problem: { vi: "Vấn đề hiện tại", de: "Das Problem heute" },
  action: { vi: "Bạn làm gì", de: "Was Sie tun" },
  outcome: { vi: "Đo được gì", de: "Was messbar wird" },
  note: {
    vi: "Ảnh chụp giao diện dựng từ dữ liệu demo. Mọi con số là số minh hoạ.",
    de: "Oberfläche mit Demodaten. Alle Zahlen sind Beispielwerte.",
  },
} as const;

/**
 * Khu "Bên trong nền tảng" — bấm chọn từng module, xem màn hình thật của nó.
 *
 * Bản trước xếp sáu ảnh giao diện cạnh nhau, mỗi ảnh chỉ là mấy thanh xám giả
 * chữ. Nhìn thì gọn nhưng người xem không rút ra được gì: không biết sản phẩm
 * làm được việc gì, cũng không thấy nó giải quyết nỗi khổ nào của mình.
 *
 * Ở đây mỗi module chiếm trọn sân khấu, nội dung bên trong đọc được từng chữ, và
 * đi kèm ba câu: đang khổ vì gì → bấm gì → đo được gì.
 */
export function PlatformTour({ locale }: { locale: Locale }) {
  const [active, setActive] = useState<TourKey>("studio");
  const reduce = useReducedMotion();
  const current = TOUR_MODULES.find((m) => m.key === active)!;

  return (
    <div className="mt-12">
      {/* ── Thanh chọn module ───────────────────────────────── */}
      <div
        role="tablist"
        aria-label={locale === "de" ? "Module" : "Các module"}
        className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-2"
      >
        {TOUR_MODULES.map((mod) => {
          const Icon = ICONS[mod.icon] ?? Sparkles;
          const on = mod.key === active;
          return (
            <button
              key={mod.key}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setActive(mod.key)}
              className={cn(
                "group relative flex shrink-0 items-center gap-2.5 rounded-2xl border px-4 py-3 text-left transition-all duration-300",
                on
                  ? "border-slab-line bg-white/[0.12] shadow-[var(--shadow-md)]"
                  : "border-slab-line/60 hover:bg-white/[0.07]",
              )}
            >
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-xl transition-colors duration-300",
                  on ? "bg-brand text-white" : "text-slab-ink-soft bg-white/10",
                )}
              >
                <Icon className="size-4" aria-hidden />
              </span>
              <span className="min-w-0">
                <span
                  className={cn(
                    "block text-sm font-bold whitespace-nowrap transition-colors duration-300",
                    on ? "text-slab-ink" : "text-slab-ink-soft",
                  )}
                >
                  {mod.name[locale]}
                </span>
                <span className="text-slab-ink-soft hidden max-w-[16rem] truncate text-xs lg:block">
                  {mod.tagline[locale]}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Sân khấu: màn hình bên trái, khung ứng dụng bên phải ── */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:gap-8">
        <motion.div
          key={active}
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="border-slab-line overflow-hidden rounded-3xl border bg-white/[0.06] p-2 backdrop-blur-sm sm:p-3"
        >
          {/* Thanh trình duyệt giả — cho biết đây là màn hình trong sản phẩm */}
          <div className="flex items-center gap-2 px-2 pt-1 pb-2.5">
            <span className="flex gap-1.5" aria-hidden>
              <span className="bg-brand/70 size-2 rounded-full" />
              <span className="bg-amber/70 size-2 rounded-full" />
              <span className="bg-mint/70 size-2 rounded-full" />
            </span>
            <span className="text-slab-ink-soft rounded-md bg-white/10 px-2 py-0.5 font-mono text-[0.6rem]">
              app.lv-groups.com/{current.key}
            </span>
          </div>

          <TourScreen variant={active} locale={locale} />
        </motion.div>

        {/* Khung ứng dụng marketing */}
        <motion.div
          key={`${active}-copy`}
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col"
        >
          <h3 className="text-slab-ink text-xl font-extrabold sm:text-2xl">
            {current.name[locale]}
          </h3>

          <dl className="mt-6 space-y-5">
            <Block
              icon={Target}
              tone="bg-magenta-tint text-magenta-ink"
              label={LABELS.problem[locale]}
              text={current.problem[locale]}
            />
            <Block
              icon={Zap}
              tone="bg-brand-tint text-brand-ink"
              label={LABELS.action[locale]}
              text={current.action[locale]}
            />
            <Block
              icon={TrendingUp}
              tone="bg-mint-tint text-mint-ink"
              label={LABELS.outcome[locale]}
              text={current.outcome[locale]}
            />
          </dl>

          {/* Ba số liệu — đổi theo module */}
          <div className="border-slab-line mt-7 grid grid-cols-3 gap-3 border-t pt-5">
            {current.facts.map((fact) => (
              <div key={fact.label[locale]}>
                <p className="text-slab-ink text-lg font-extrabold tabular-nums">{fact.value}</p>
                <p className="text-slab-ink-soft mt-0.5 text-[0.68rem] leading-tight">
                  {fact.label[locale]}
                </p>
              </div>
            ))}
          </div>

          <p className="text-slab-ink-soft mt-6 text-xs leading-relaxed">{LABELS.note[locale]}</p>
        </motion.div>
      </div>
    </div>
  );
}

function Block({
  icon: Icon,
  tone,
  label,
  text,
}: {
  icon: LucideIcon;
  tone: string;
  label: string;
  text: string;
}) {
  return (
    <div className="flex gap-3">
      <span className={cn("grid size-7 shrink-0 place-items-center rounded-lg", tone)}>
        <Icon className="size-3.5" aria-hidden />
      </span>
      <div className="min-w-0">
        <dt className="text-slab-ink-soft text-[0.62rem] font-bold tracking-[0.14em] uppercase">
          {label}
        </dt>
        <dd className="text-slab-ink mt-1.5 text-sm leading-relaxed">{text}</dd>
      </div>
    </div>
  );
}
