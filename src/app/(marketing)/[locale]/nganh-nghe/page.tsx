import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, Flower2, Hand, Store, Utensils, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/marketing/page-hero";
import { Photo } from "@/components/brand/photo";
import { TemplateCard } from "@/components/marketing/template-card";
import { CtaPanel } from "@/components/marketing/cta-panel";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { INDUSTRIES } from "@/config/solutions";
import { MARKETING_TEMPLATES } from "@/data/templates";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/i18n/config";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  utensils: Utensils,
  hand: Hand,
  flower: Flower2,
  store: Store,
};

const TONES = [
  { tint: "bg-brand-tint", text: "text-brand-ink", solid: "bg-brand" },
  { tint: "bg-magenta-tint", text: "text-magenta-ink", solid: "bg-magenta" },
  { tint: "bg-violet-tint", text: "text-violet-ink", solid: "bg-violet" },
  { tint: "bg-sky-tint", text: "text-sky-ink", solid: "bg-sky" },
];

/** Template tiêu biểu cho từng ngành, theo thứ tự INDUSTRIES. */
const INDUSTRY_TEMPLATES = [
  ["post-restaurant", "menu-a4", "story-promo"],
  ["post-nail", "price-list", "story-beforeafter"],
  ["post-spa", "voucher", "review-card"],
  ["google-post", "landing-restaurant", "loyalty-card"],
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale).pages.industries;
  return { title: t.title, description: t.lead };
}

export default async function IndustriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const p = t.pages.industries;

  return (
    <>
      <PageHero
        eyebrow={p.eyebrow}
        title={p.title}
        accent={p.titleAccent}
        lead={p.lead}
        tone="violet"
        locale={locale}
        photo="restaurantBright"
      >
        <div className="flex flex-wrap gap-2">
          {INDUSTRIES.map((industry, i) => {
            const Icon = ICONS[industry.icon] ?? Store;
            const tone = TONES[i % TONES.length];
            return (
              <a
                key={industry.slug}
                href={`#${industry.slug}`}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-transform duration-300 hover:-translate-y-0.5",
                  tone.tint,
                  tone.text,
                )}
              >
                <Icon className="size-4" aria-hidden />
                {industry.name[locale]}
              </a>
            );
          })}
        </div>
      </PageHero>

      {INDUSTRIES.map((industry, i) => {
        const Icon = ICONS[industry.icon] ?? Store;
        const tone = TONES[i % TONES.length];
        const templates = INDUSTRY_TEMPLATES[i] ?? [];

        return (
          <section
            key={industry.slug}
            id={industry.slug}
            className={cn("relative scroll-mt-24", i % 2 === 1 && "bg-paper-3")}
          >
            <div className="lv-container py-16 lg:py-20">
              <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
                <Reveal>
                  <div className="lg:sticky lg:top-28 lg:self-start">
                    <span className={cn("grid size-12 place-items-center rounded-2xl", tone.tint, tone.text)}>
                      <Icon className="size-6" aria-hidden />
                    </span>
                    <h2 className="text-ink mt-5 text-2xl font-extrabold sm:text-3xl">
                      {industry.name[locale]}
                    </h2>
                    <p className="text-ink-2 mt-4 text-base leading-relaxed">
                      {industry.lead[locale]}
                    </p>

                    <div className="lv-shot mt-7 aspect-[4/3]">
                      <Photo
                        name={industry.photo}
                        locale={locale}
                        width={680}
                        height={510}
                        sizes="(min-width: 1024px) 38vw, 92vw"
                        className="h-full w-full"
                      />
                    </div>

                    <Button
                      className="mt-7 rounded-full"
                      size="lg"
                      render={<Link href={`/${locale}/lien-he?industry=${industry.slug}`} />}
                    >
                      {t.hero.secondaryCta}
                      <ArrowRight className="size-4" aria-hidden />
                    </Button>
                  </div>
                </Reveal>

                <div>
                  <p className="text-ink-3 text-[0.72rem] font-bold tracking-[0.12em] uppercase">
                    {p.featureTitle}
                  </p>
                  <RevealGroup as="ul" className="mt-5 grid gap-2.5 sm:grid-cols-2">
                    {industry.features[locale].map((feature) => (
                      <RevealItem key={feature} as="li">
                        <div className="lv-card flex items-start gap-3 rounded-2xl px-4 py-3.5">
                          <span
                            className={cn(
                              "mt-0.5 grid size-4 shrink-0 place-items-center rounded-full",
                              tone.solid,
                            )}
                          >
                            <Check className="size-2.5 text-white" strokeWidth={3.5} aria-hidden />
                          </span>
                          <span className="text-ink text-sm font-medium">{feature}</span>
                        </div>
                      </RevealItem>
                    ))}
                  </RevealGroup>

                  <RevealGroup className="mt-8 grid grid-cols-3 gap-4">
                    {templates.map((slug) => {
                      const template = MARKETING_TEMPLATES.find((item) => item.slug === slug);
                      if (!template) return null;
                      return (
                        <RevealItem key={slug}>
                          <div className="lv-card overflow-hidden rounded-2xl">
                            <TemplateCard template={template} locale={locale} />
                          </div>
                        </RevealItem>
                      );
                    })}
                  </RevealGroup>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      <CtaPanel locale={locale} t={t.finalCta} />
    </>
  );
}
