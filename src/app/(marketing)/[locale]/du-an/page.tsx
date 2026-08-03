import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { PageHero } from "@/components/marketing/page-hero";
import { Photo } from "@/components/brand/photo";
import { CtaPanel } from "@/components/marketing/cta-panel";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/i18n/config";
import type { PhotoKey } from "@/data/media";
import { cn } from "@/lib/utils";

/** Ảnh cho từng nhóm dự án — 1 ảnh lớn + 2 ảnh phụ. */
const GROUP_PHOTOS: { main: PhotoKey; side: [PhotoKey, PhotoKey]; tone: string }[] = [
  {
    main: "restaurantInteriorWarm",
    side: ["fineDiningPlate", "cafeSign"],
    tone: "bg-brand-tint text-brand-ink",
  },
  {
    main: "manicureWork",
    side: ["nailsPink", "nailsDark"],
    tone: "bg-magenta-tint text-magenta-ink",
  },
  {
    main: "spaFacialTwo",
    side: ["spaProducts", "spaStones"],
    tone: "bg-violet-tint text-violet-ink",
  },
  {
    main: "showroomChairs",
    side: ["showroomSofa", "interiorModern"],
    tone: "bg-sky-tint text-sky-ink",
  },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale).pages.projects;
  return { title: t.title, description: t.lead };
}

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const p = t.pages.projects;

  return (
    <>
      <PageHero
        eyebrow={p.eyebrow}
        title={p.title}
        accent={p.titleAccent}
        lead={p.lead}
        tone="magenta"
        locale={locale}
        photo="interiorLiving"
      />

      <section className="lv-container">
        <Reveal>
          <p className="bg-amber-tint text-amber-ink rounded-2xl px-4 py-3 text-sm">
            {p.disclaimer}
          </p>
        </Reveal>
      </section>

      {p.groups.map((group, i) => {
        const photos = GROUP_PHOTOS[i % GROUP_PHOTOS.length];
        const flipped = i % 2 === 1;

        return (
          <section key={group.name} className={cn("relative", flipped && "bg-paper-3")}>
            <div className="lv-container py-16 lg:py-20">
              <div
                className={cn(
                  "grid items-center gap-10 lg:grid-cols-2 lg:gap-16",
                  flipped && "lg:[&>*:first-child]:order-2",
                )}
              >
                <Reveal direction={flipped ? "left" : "right"}>
                  <div>
                    <span className={cn("lv-chip border-transparent", photos.tone)}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h2 className="text-ink mt-4 text-2xl font-extrabold sm:text-3xl">
                      {group.name}
                    </h2>
                    <p className="text-ink-2 mt-4 text-base leading-relaxed">{group.text}</p>

                    <ul className="mt-7 space-y-3">
                      {group.items.map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <span className="bg-brand mt-0.5 grid size-4 shrink-0 place-items-center rounded-full">
                            <Check className="size-2.5 text-white" strokeWidth={3.5} aria-hidden />
                          </span>
                          <span className="text-ink-2 text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>

                <Reveal direction={flipped ? "right" : "left"} delay={0.08}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="lv-shot col-span-2 aspect-[16/10]">
                      <Photo
                        name={photos.main}
                        locale={locale}
                        width={760}
                        height={475}
                        sizes="(min-width: 1024px) 44vw, 92vw"
                        className="h-full w-full"
                      />
                    </div>
                    {photos.side.map((name) => (
                      <div key={name} className="lv-shot aspect-square">
                        <Photo
                          name={name}
                          locale={locale}
                          width={380}
                          height={380}
                          sizes="(min-width: 1024px) 22vw, 46vw"
                          className="h-full w-full"
                        />
                      </div>
                    ))}
                  </div>
                </Reveal>
              </div>
            </div>
          </section>
        );
      })}

      <section className="lv-container py-16">
        <RevealGroup className="grid gap-6 md:grid-cols-2">
          {t.cases.items.map((item, i) => (
            <RevealItem key={item.title} as="article">
              <div className="lv-card h-full rounded-3xl p-7">
                <p className="text-ink-3 text-xs font-semibold">{item.industry}</p>
                <h3 className="text-ink mt-3 text-lg font-extrabold">{item.title}</h3>
                <p className="text-ink-2 mt-3 text-sm leading-relaxed">{item.text}</p>
                <div className="border-line mt-5 flex items-baseline gap-3 border-t pt-4">
                  <span
                    className={cn(
                      "text-2xl font-extrabold",
                      ["text-brand-ink", "text-magenta-ink", "text-violet-ink", "text-sky-ink"][i % 4],
                    )}
                  >
                    {item.metric}
                  </span>
                  <span className="text-ink-3 text-xs">{item.metricLabel}</span>
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal>
          <p className="text-ink-3 mt-6 text-xs">{t.cases.disclaimer}</p>
        </Reveal>
      </section>

      <CtaPanel locale={locale} t={t.finalCta} />
    </>
  );
}
