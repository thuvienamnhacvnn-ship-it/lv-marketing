import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock, Globe, MapPin, Phone } from "lucide-react";
import { PageHero } from "@/components/marketing/page-hero";
import { ContactForm } from "@/components/marketing/contact-form";
import { Photo } from "@/components/brand/photo";
import { Reveal } from "@/components/motion/reveal";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/i18n/config";
import { siteConfig } from "@/config/site";
import { INDUSTRIES, SOLUTIONS } from "@/config/solutions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale).pages.contact;
  return { title: t.title, description: t.lead };
}

export default async function ContactPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const p = t.pages.contact;

  // Điền sẵn nội dung khi khách bấm CTA từ một giải pháp, ngành hoặc gói cụ thể.
  const solutionSlug = typeof query.solution === "string" ? query.solution : undefined;
  const industrySlug = typeof query.industry === "string" ? query.industry : undefined;
  const planKey = typeof query.plan === "string" ? query.plan : undefined;

  const solution = SOLUTIONS.find((item) => item.slug === solutionSlug);
  const industry = INDUSTRIES.find((item) => item.slug === industrySlug);
  const plan = t.pricing.plans.find((item) => item.key === planKey);

  const prefill = [
    solution ? `${t.hero.slideOf}: ${solution.name[locale]}` : null,
    plan ? `${t.pricing.eyebrow}: ${plan.name}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <>
      <PageHero
        eyebrow={p.eyebrow}
        title={p.title}
        accent={p.titleAccent}
        lead={p.lead}
        locale={locale}
      />

      <section className="lv-container pb-20">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
          <Reveal>
            <ContactForm
              locale={locale}
              t={p}
              defaultIndustry={industry?.name[locale]}
              defaultMessage={prefill || undefined}
            />
          </Reveal>

          <Reveal delay={0.08} direction="left">
            <div className="space-y-5">
              {/* Liên hệ trực tiếp */}
              <div className="lv-card rounded-3xl p-6 sm:p-7">
                <p className="text-ink-3 text-[0.7rem] font-bold tracking-[0.12em] uppercase">
                  {p.directTitle}
                </p>

                <a
                  href={siteConfig.contact.phoneHref}
                  className="group mt-4 flex items-center gap-3"
                >
                  <span className="bg-brand grid size-11 shrink-0 place-items-center rounded-2xl text-white">
                    <Phone className="size-5" aria-hidden />
                  </span>
                  <span>
                    <span className="text-ink group-hover:text-brand-ink block text-xl font-extrabold transition-colors">
                      {siteConfig.contact.phone}
                    </span>
                    <span className="text-ink-3 block text-xs">WhatsApp · Zalo · Telefon</span>
                  </span>
                </a>

                <div className="border-line mt-5 space-y-3 border-t pt-5 text-sm">
                  <p className="text-ink-2 flex items-center gap-2.5">
                    <span className="bg-violet-tint text-violet-ink grid size-7 shrink-0 place-items-center rounded-full">
                      <MapPin className="size-3.5" aria-hidden />
                    </span>
                    {siteConfig.contact.city} · {siteConfig.contact.coverage[locale]}
                  </p>
                  <a
                    href={siteConfig.contact.websiteHref}
                    target="_blank"
                    rel="noreferrer"
                    className="text-ink-2 hover:text-ink flex items-center gap-2.5 transition-colors"
                  >
                    <span className="bg-sky-tint text-sky-ink grid size-7 shrink-0 place-items-center rounded-full">
                      <Globe className="size-3.5" aria-hidden />
                    </span>
                    {siteConfig.contact.website}
                  </a>
                </div>
              </div>

              {/* Giờ làm việc */}
              <div className="lv-card rounded-3xl p-6 sm:p-7">
                <p className="text-ink-3 flex items-center gap-2 text-[0.7rem] font-bold tracking-[0.12em] uppercase">
                  <Clock className="size-3.5" aria-hidden />
                  {p.hoursTitle}
                </p>
                <ul className="mt-4 space-y-2">
                  {p.hours.map((line) => (
                    <li key={line} className="text-ink-2 text-sm">
                      {line}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="lv-shot aspect-[4/3]">
                <Photo
                  name="berlinNight"
                  locale={locale}
                  width={620}
                  height={465}
                  sizes="(min-width: 1024px) 32vw, 92vw"
                  className="h-full w-full"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
