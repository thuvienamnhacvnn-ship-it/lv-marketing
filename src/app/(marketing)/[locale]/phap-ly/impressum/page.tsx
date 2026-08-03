import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CircleAlert } from "lucide-react";
import { LegalPage } from "@/components/marketing/legal-page";
import { Reveal } from "@/components/motion/reveal";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/i18n/config";
import { siteConfig } from "@/config/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDictionary(locale).pages.legal.imprint.title, robots: { index: false } };
}

export default async function ImprintPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const legal = getDictionary(locale).pages.legal;
  const p = legal.imprint;

  return (
    <LegalPage
      locale={locale}
      eyebrow={p.eyebrow}
      title={p.title}
      reviewNotice={legal.reviewNotice}
      intro={p.intro}
    >
      {/* Thông tin đã có */}
      <Reveal>
        <div className="lv-card mt-8 rounded-2xl p-6">
          <p className="text-ink text-lg font-extrabold">{siteConfig.company}</p>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex gap-3">
              <dt className="text-ink-3 w-28 shrink-0">Telefon</dt>
              <dd className="text-ink-2">
                <a href={siteConfig.contact.phoneHref} className="hover:text-ink transition-colors">
                  {siteConfig.contact.phone}
                </a>
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="text-ink-3 w-28 shrink-0">Website</dt>
              <dd className="text-ink-2">
                <a
                  href={siteConfig.contact.websiteHref}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-ink transition-colors"
                >
                  {siteConfig.contact.website}
                </a>
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="text-ink-3 w-28 shrink-0">Sitz</dt>
              <dd className="text-ink-2">{siteConfig.contact.city}, Deutschland</dd>
            </div>
          </dl>
        </div>
      </Reveal>

      {/* Thông tin còn thiếu — nói thẳng thay vì bịa */}
      <Reveal delay={0.06}>
        <div className="border-line mt-6 rounded-2xl border border-dashed p-6">
          <p className="text-ink flex items-center gap-2 text-sm font-bold">
            <CircleAlert className="text-amber-ink size-4" aria-hidden />
            {p.pendingLabel}
          </p>
          <ul className="mt-4 space-y-2">
            {p.pending.map((item) => (
              <li key={item} className="text-ink-2 flex items-start gap-2.5 text-sm">
                <span className="bg-line-strong mt-1.5 size-1.5 shrink-0 rounded-full" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-8">
          <h2 className="text-ink text-lg font-extrabold">{p.disputeTitle}</h2>
          <p className="text-ink-2 mt-2.5 text-sm leading-relaxed">{p.disputeText}</p>
        </div>
      </Reveal>
    </LegalPage>
  );
}
