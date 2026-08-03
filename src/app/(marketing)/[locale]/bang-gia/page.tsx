import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/marketing/page-hero";
import { PricingGrid } from "@/components/marketing/pricing-grid";
import { CtaPanel } from "@/components/marketing/cta-panel";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale).pages.pricing;
  return { title: t.title, description: t.lead };
}

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const p = t.pages.pricing;

  return (
    <>
      <PageHero
        eyebrow={p.eyebrow}
        title={p.title}
        accent={p.titleAccent}
        lead={p.lead}
        tone="amber"
        locale={locale}
      />

      <section className="lv-container pb-16">
        <Reveal>
          <PricingGrid locale={locale} t={t.pricing} />
        </Reveal>
      </section>

      <section className="bg-paper-3">
        <div className="lv-container py-16 lg:py-20">
          <Reveal>
            <h2 className="text-ink text-2xl font-extrabold sm:text-3xl">{p.faqTitle}</h2>
          </Reveal>

          <RevealGroup as="ul" className="mt-9 grid gap-4 lg:grid-cols-2">
            {p.faq.map((item) => (
              <RevealItem key={item.q} as="li">
                <div className="lv-card h-full rounded-2xl p-6">
                  <h3 className="text-ink text-base font-bold">{item.q}</h3>
                  <p className="text-ink-2 mt-3 text-sm leading-relaxed">{item.a}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <CtaPanel locale={locale} t={t.finalCta} />
    </>
  );
}
