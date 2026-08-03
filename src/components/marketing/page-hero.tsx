import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/reveal";
import { Photo } from "@/components/brand/photo";
import type { PhotoKey } from "@/data/media";
import type { Locale } from "@/i18n/config";

const EYEBROW_TONE = {
  brand: "",
  magenta: "lv-eyebrow-magenta",
  violet: "lv-eyebrow-violet",
  sky: "lv-eyebrow-sky",
  amber: "lv-eyebrow-amber",
} as const;

/** Đầu trang dùng chung cho mọi trang phụ — giữ nhịp thị giác thống nhất với trang chủ. */
export function PageHero({
  eyebrow,
  title,
  accent,
  lead,
  tone = "brand",
  photo,
  locale,
  children,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  lead?: string;
  tone?: keyof typeof EYEBROW_TONE;
  photo?: PhotoKey;
  locale: Locale;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden">
      {/* Vệt màu nền, đổi theo theme */}
      <span
        className="animate-lv-blob pointer-events-none absolute -top-48 -right-40 size-[36rem] rounded-full opacity-40 blur-[110px]"
        style={{ background: "radial-gradient(circle, var(--hero-mesh-1) 0%, transparent 70%)" }}
        aria-hidden
      />
      <span
        className="animate-lv-blob pointer-events-none absolute top-20 -left-40 size-[30rem] rounded-full opacity-30 blur-[110px]"
        style={{
          background: "radial-gradient(circle, var(--hero-mesh-3) 0%, transparent 70%)",
          animationDelay: "-9s",
        }}
        aria-hidden
      />

      <div className="lv-container relative pt-14 pb-14 lg:pt-20 lg:pb-16">
        <div
          className={cn(
            "grid items-center gap-12",
            photo ? "lg:grid-cols-[1.05fr_0.95fr]" : "max-w-3xl",
          )}
        >
          <div>
            <Reveal direction="none">
              <span className={cn("lv-eyebrow", EYEBROW_TONE[tone])}>{eyebrow}</span>
            </Reveal>

            <Reveal delay={0.06}>
              <h1 className="text-ink mt-6 text-[2.2rem] leading-[1.06] font-extrabold sm:text-[3rem] lg:text-[3.5rem]">
                {renderTitle(title, accent)}
              </h1>
            </Reveal>

            {lead ? (
              <Reveal delay={0.12}>
                <p className="text-ink-2 mt-6 max-w-2xl text-lg leading-relaxed">{lead}</p>
              </Reveal>
            ) : null}

            {children ? (
              <Reveal delay={0.18}>
                <div className="mt-8">{children}</div>
              </Reveal>
            ) : null}
          </div>

          {photo ? (
            <Reveal delay={0.1} direction="left">
              <div className="lv-shot aspect-[4/3]">
                <Photo
                  name={photo}
                  locale={locale}
                  width={820}
                  height={615}
                  sizes="(min-width: 1024px) 44vw, 92vw"
                  className="h-full w-full"
                  priority
                />
              </div>
            </Reveal>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function renderTitle(title: string, accent?: string) {
  if (!accent) return title;
  const at = title.indexOf(accent);
  if (at === -1) return title;
  return (
    <>
      {title.slice(0, at)}
      <span className="lv-underline">{accent}</span>
      {title.slice(at + accent.length)}
    </>
  );
}
