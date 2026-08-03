import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Globe, MapPin, Phone } from "lucide-react";
import { PageHero } from "@/components/marketing/page-hero";
import { Photo } from "@/components/brand/photo";
import { CtaPanel } from "@/components/marketing/cta-panel";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/i18n/config";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const VALUE_TONES = [
  "bg-brand-tint text-brand-ink",
  "bg-violet-tint text-violet-ink",
  "bg-sky-tint text-sky-ink",
  "bg-magenta-tint text-magenta-ink",
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale).pages.about;
  return { title: t.title, description: t.lead };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const p = t.pages.about;

  return (
    <>
      <PageHero
        eyebrow={p.eyebrow}
        title={p.title}
        accent={p.titleAccent}
        lead={p.lead}
        locale={locale}
        photo="teamWorking"
      />

      {/* Câu chuyện */}
      <section className="bg-paper-3">
        <div className="lv-container py-16 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <Reveal>
              <h2 className="text-ink text-2xl font-extrabold sm:text-3xl lg:sticky lg:top-28">
                {p.storyTitle}
              </h2>
            </Reveal>

            <div>
              <RevealGroup className="space-y-6">
                {p.story.map((paragraph, i) => (
                  <RevealItem key={i}>
                    <p className="text-ink-2 text-lg leading-relaxed">{paragraph}</p>
                  </RevealItem>
                ))}
              </RevealGroup>

              <Reveal delay={0.1}>
                <div className="mt-10 grid grid-cols-2 gap-4">
                  <div className="lv-shot aspect-[4/5]">
                    <Photo
                      name="teamMeeting"
                      locale={locale}
                      width={420}
                      height={525}
                      sizes="(min-width: 1024px) 24vw, 46vw"
                      className="h-full w-full"
                    />
                  </div>
                  <div className="lv-shot mt-8 aspect-[4/5]">
                    <Photo
                      name="showroomChairs"
                      locale={locale}
                      width={420}
                      height={525}
                      sizes="(min-width: 1024px) 24vw, 46vw"
                      className="h-full w-full"
                    />
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Giá trị */}
      <section className="lv-container py-16 lg:py-20">
        <Reveal>
          <h2 className="text-ink text-2xl font-extrabold sm:text-3xl">{p.valuesTitle}</h2>
        </Reveal>

        <RevealGroup className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {p.values.map((value, i) => (
            <RevealItem key={value.name}>
              <div className="lv-card lv-card-hover h-full rounded-3xl p-6">
                <span
                  className={cn(
                    "grid size-9 place-items-center rounded-xl text-xs font-extrabold",
                    VALUE_TONES[i % VALUE_TONES.length],
                  )}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-ink mt-4 text-base font-bold">{value.name}</h3>
                <p className="text-ink-2 mt-2.5 text-sm leading-relaxed">{value.text}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* Thông tin công ty */}
      <section className="bg-paper-3">
        <div className="lv-container py-16">
          <Reveal>
            <div className="lv-card grid gap-8 rounded-3xl p-8 sm:grid-cols-3 sm:p-10">
              <div>
                <p className="text-ink-3 text-[0.7rem] font-bold tracking-[0.12em] uppercase">
                  {p.factsTitle}
                </p>
                <p className="text-ink mt-3 text-xl font-extrabold">{siteConfig.company}</p>
                <ul className="text-ink-2 mt-3 space-y-1 text-sm">
                  {t.footer.lines.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3 text-sm">
                <p className="text-ink-2 flex items-center gap-2.5">
                  <span className="bg-brand-tint text-brand-ink grid size-7 shrink-0 place-items-center rounded-full">
                    <MapPin className="size-3.5" aria-hidden />
                  </span>
                  {siteConfig.contact.city} · {siteConfig.contact.coverage[locale]}
                </p>
                <a
                  href={siteConfig.contact.phoneHref}
                  className="text-ink hover:text-brand-ink flex items-center gap-2.5 font-semibold transition-colors"
                >
                  <span className="bg-sky-tint text-sky-ink grid size-7 shrink-0 place-items-center rounded-full">
                    <Phone className="size-3.5" aria-hidden />
                  </span>
                  {siteConfig.contact.phone}
                </a>
                <a
                  href={siteConfig.contact.websiteHref}
                  target="_blank"
                  rel="noreferrer"
                  className="text-ink-2 hover:text-ink flex items-center gap-2.5 transition-colors"
                >
                  <span className="bg-violet-tint text-violet-ink grid size-7 shrink-0 place-items-center rounded-full">
                    <Globe className="size-3.5" aria-hidden />
                  </span>
                  {siteConfig.contact.website}
                </a>
              </div>

              <div className="lv-shot aspect-[4/3]">
                <Photo
                  name="berlinGate"
                  locale={locale}
                  width={420}
                  height={315}
                  sizes="(min-width: 640px) 28vw, 92vw"
                  className="h-full w-full"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <CtaPanel locale={locale} t={t.finalCta} />
    </>
  );
}
