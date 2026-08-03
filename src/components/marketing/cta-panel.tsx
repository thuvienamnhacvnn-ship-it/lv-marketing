import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { Photo } from "@/components/brand/photo";
import { siteConfig } from "@/config/site";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/vi";

export function CtaPanel({ locale, t }: { locale: Locale; t: Dictionary["finalCta"] }) {
  return (
    <section className="lv-container py-20 lg:py-28">
      <Reveal>
        <div className="lv-slab relative grid overflow-hidden rounded-[2.5rem] lg:grid-cols-[1.15fr_0.85fr]">
          {/* Khối chữ */}
          <div className="relative z-10 p-9 sm:p-12 lg:p-16">
            <span className="bg-brand inline-flex rounded-full px-3.5 py-1.5 text-[0.7rem] font-bold tracking-[0.1em] text-white uppercase">
              {siteConfig.company}
            </span>

            <h2 className="text-slab-ink mt-7 text-[1.75rem] leading-[1.15] font-extrabold sm:text-4xl lg:text-[2.85rem]">
              {splitAccent(t.title, t.titleAccent)}
            </h2>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button
                size="xl"
                className="rounded-full shadow-[var(--shadow-brand)]"
                render={<Link href={`/${locale}/lien-he`} />}
              >
                {t.primary}
                <ArrowRight className="size-4" aria-hidden />
              </Button>
              <Button
                size="xl"
                variant="outline"
                className="border-slab-line text-slab-ink hover:text-slab-ink rounded-full bg-white/8 hover:bg-white/16"
                render={<Link href="/register" />}
              >
                {t.secondary}
              </Button>
            </div>

            <a
              href={siteConfig.contact.phoneHref}
              className="text-slab-ink-soft hover:text-slab-ink mt-8 inline-flex items-center gap-2.5 transition-colors"
            >
              <span className="bg-brand/20 text-brand grid size-9 place-items-center rounded-full">
                <Phone className="size-4" aria-hidden />
              </span>
              <span className="text-lg font-bold">{siteConfig.contact.phone}</span>
            </a>
          </div>

          {/* Ảnh */}
          <div className="relative min-h-[16rem] lg:min-h-[26rem]">
            <Photo
              name="teamMeeting"
              locale={locale}
              width={760}
              height={700}
              sizes="(min-width: 1024px) 38vw, 100vw"
              className="absolute inset-0 h-full w-full"
            />
            <span
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, var(--slab) 0%, color-mix(in srgb, var(--slab) 35%, transparent) 48%, transparent 100%)",
              }}
              aria-hidden
            />
          </div>

          {/* Vệt màu trang trí */}
          <span
            className="animate-lv-blob pointer-events-none absolute -bottom-32 -left-24 size-[26rem] rounded-full opacity-45 blur-[90px]"
            style={{ background: "radial-gradient(circle, var(--brand) 0%, transparent 70%)" }}
            aria-hidden
          />
        </div>
      </Reveal>
    </section>
  );
}

function splitAccent(text: string, accent: string) {
  const at = text.indexOf(accent);
  if (at === -1) return text;
  return (
    <>
      {text.slice(0, at)}
      <span className="text-brand">{accent}</span>
      {text.slice(at + accent.length)}
    </>
  );
}
