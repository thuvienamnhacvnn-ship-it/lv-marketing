import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Globe,
  Hand,
  LineChart,
  MessagesSquare,
  Share2,
  Sparkles,
  Star,
  Ticket,
  Utensils,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/marketing/page-hero";
import { Photo } from "@/components/brand/photo";
import { DashboardPreview, type PreviewVariant } from "@/components/marketing/dashboard-preview";
import { CtaPanel } from "@/components/marketing/cta-panel";
import { Reveal } from "@/components/motion/reveal";
import { SOLUTIONS } from "@/config/solutions";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/i18n/config";
import { cn } from "@/lib/utils";

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

const TONES = [
  { chip: "bg-brand-tint text-brand-ink", band: "" },
  { chip: "bg-violet-tint text-violet-ink", band: "bg-paper-3" },
  { chip: "bg-amber-tint text-amber-ink", band: "" },
  { chip: "bg-magenta-tint text-magenta-ink", band: "bg-paper-3" },
  { chip: "bg-sky-tint text-sky-ink", band: "" },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale).pages.solutions;
  return { title: t.title, description: t.lead };
}

export default async function SolutionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const p = t.pages.solutions;

  return (
    <>
      <PageHero
        eyebrow={p.eyebrow}
        title={p.title}
        accent={p.titleAccent}
        lead={p.lead}
        locale={locale}
        photo="teamDesk"
      />

      {SOLUTIONS.map((solution, i) => {
        const Icon = ICONS[solution.icon] ?? Sparkles;
        const tone = TONES[i % TONES.length];
        const flipped = i % 2 === 1;

        return (
          <section key={solution.slug} id={solution.slug} className={cn("relative", tone.band)}>
            <div className="lv-container py-16 lg:py-20">
              <div
                className={cn(
                  "grid items-center gap-10 lg:grid-cols-2 lg:gap-16",
                  flipped && "lg:[&>*:first-child]:order-2",
                )}
              >
                <Reveal direction={flipped ? "left" : "right"}>
                  <div>
                    <div className="flex items-center gap-3">
                      <span className={cn("grid size-11 place-items-center rounded-2xl", tone.chip)}>
                        <Icon className="size-5" aria-hidden />
                      </span>
                      <span className="text-ink-3 font-mono text-xs font-bold">
                        {String(i + 1).padStart(2, "0")} / {String(SOLUTIONS.length).padStart(2, "0")}
                      </span>
                    </div>

                    <h2 className="text-ink mt-5 text-2xl font-extrabold sm:text-3xl">
                      {solution.name[locale]}
                    </h2>
                    <p className="text-ink-2 mt-4 text-base leading-relaxed">
                      {solution.summary[locale]}
                    </p>

                    <div className="bg-paper-3 mt-6 rounded-2xl p-5">
                      <p className="text-ink-3 text-[0.68rem] font-bold tracking-[0.12em] uppercase">
                        {t.hero.exampleLabel}
                      </p>
                      <p className="text-ink mt-2 text-sm leading-relaxed">
                        {solution.example[locale]}
                      </p>
                    </div>

                    <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-4">
                      {solution.metrics.map((metric) => (
                        <div key={metric.label[locale]}>
                          <dd className="text-ink text-2xl font-extrabold">{metric.value}</dd>
                          <dt className="text-ink-3 mt-1 text-xs">{metric.label[locale]}</dt>
                        </div>
                      ))}
                    </dl>
                  </div>
                </Reveal>

                <Reveal direction={flipped ? "right" : "left"} delay={0.08}>
                  <div className="relative">
                    <div className="lv-shot aspect-[4/3]">
                      <Photo
                        name={solution.photo}
                        locale={locale}
                        width={760}
                        height={570}
                        sizes="(min-width: 1024px) 44vw, 92vw"
                        className="h-full w-full"
                      />
                    </div>
                    <div className="absolute -right-3 -bottom-6 w-52 sm:-right-6 sm:w-64">
                      <DashboardPreview variant={solution.preview as PreviewVariant} floating />
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </section>
        );
      })}

      <section className="lv-container py-16">
        <Reveal>
          <div className="lv-card flex flex-col items-start gap-6 rounded-3xl p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
            <div>
              <h2 className="text-ink text-xl font-extrabold sm:text-2xl">{p.ctaTitle}</h2>
              <p className="text-ink-2 mt-2 max-w-xl text-sm leading-relaxed">{p.ctaText}</p>
            </div>
            <Button
              size="xl"
              className="shrink-0 rounded-full"
              render={<Link href={`/${locale}/lien-he`} />}
            >
              {t.hero.secondaryCta}
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          </div>
        </Reveal>
      </section>

      <CtaPanel locale={locale} t={t.finalCta} />
    </>
  );
}
