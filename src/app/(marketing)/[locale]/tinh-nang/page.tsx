import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/marketing/page-hero";
import { DashboardPreview, type PreviewVariant } from "@/components/marketing/dashboard-preview";
import { CtaPanel } from "@/components/marketing/cta-panel";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/i18n/config";
import { cn } from "@/lib/utils";

const GROUP_TONES = [
  { chip: "bg-brand-tint text-brand-ink", dot: "bg-brand" },
  { chip: "bg-violet-tint text-violet-ink", dot: "bg-violet" },
  { chip: "bg-sky-tint text-sky-ink", dot: "bg-sky" },
  { chip: "bg-amber-tint text-amber-ink", dot: "bg-amber" },
];

/** Mockup minh hoạ cho mỗi nhóm module. */
const GROUP_PREVIEW: PreviewVariant[] = ["studio", "inbox", "analytics", "loyalty"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale).pages.features;
  return { title: t.title, description: t.lead };
}

export default async function FeaturesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const p = t.pages.features;

  return (
    <>
      <PageHero
        eyebrow={p.eyebrow}
        title={p.title}
        accent={p.titleAccent}
        lead={p.lead}
        tone="sky"
        locale={locale}
      />

      {p.groups.map((group, gi) => {
        const tone = GROUP_TONES[gi % GROUP_TONES.length];
        return (
          <section key={group.name} className={cn("relative", gi % 2 === 1 && "bg-paper-3")}>
            <div className="lv-container py-14 lg:py-16">
              <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-14">
                <Reveal>
                  <div className="lg:sticky lg:top-28 lg:self-start">
                    <span className={cn("lv-chip border-transparent", tone.chip)}>
                      {String(gi + 1).padStart(2, "0")}
                    </span>
                    <h2 className="text-ink mt-4 text-2xl font-extrabold">{group.name}</h2>
                    <div className="mt-6 max-w-xs">
                      <DashboardPreview variant={GROUP_PREVIEW[gi] ?? "studio"} />
                    </div>
                  </div>
                </Reveal>

                <RevealGroup as="ul" className="grid gap-4 sm:grid-cols-2">
                  {group.items.map((item) => (
                    <RevealItem key={item.name} as="li">
                      <div className="lv-card lv-card-hover h-full rounded-2xl p-6">
                        <span className={cn("block size-2.5 rounded-full", tone.dot)} aria-hidden />
                        <h3 className="text-ink mt-4 text-base font-bold">{item.name}</h3>
                        <p className="text-ink-2 mt-2.5 text-sm leading-relaxed">{item.text}</p>
                      </div>
                    </RevealItem>
                  ))}
                </RevealGroup>
              </div>
            </div>
          </section>
        );
      })}

      <CtaPanel locale={locale} t={t.finalCta} />
    </>
  );
}
