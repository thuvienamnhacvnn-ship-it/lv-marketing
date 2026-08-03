import Link from "next/link";
import { Globe, MapPin, Phone } from "lucide-react";
import { LvLogo } from "@/components/brand/lv-logo";
import { siteConfig } from "@/config/site";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/vi";

export function SiteFooter({ locale, t }: { locale: Locale; t: Dictionary }) {
  const year = new Date().getFullYear();

  const productLinks = [
    { href: `/${locale}/giai-phap`, label: t.nav.solutions },
    { href: `/${locale}/nganh-nghe`, label: t.nav.industries },
    { href: `/${locale}/tinh-nang`, label: t.nav.features },
    { href: `/${locale}/bang-gia`, label: t.nav.pricing },
  ];

  const companyLinks = [
    { href: `/${locale}/ve-chung-toi`, label: t.nav.about },
    { href: `/${locale}/du-an`, label: t.nav.projects },
    { href: `/${locale}/lien-he`, label: t.finalCta.primary },
  ];

  const legalLinks = [
    { href: `/${locale}/phap-ly/bao-mat`, label: t.footer.privacy },
    { href: `/${locale}/phap-ly/dieu-khoan`, label: t.footer.terms },
    { href: `/${locale}/phap-ly/impressum`, label: t.footer.imprint },
  ];

  return (
    <footer className="border-line bg-paper-2 border-t">
      <div className="lv-container py-14 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <LvLogo size={44} withWordmark />
            <ul className="text-ink-2 mt-6 space-y-1.5 text-sm">
              {t.footer.lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>

            <div className="mt-7 space-y-2.5 text-sm">
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
          </div>

          <FooterColumn title={t.footer.productTitle} links={productLinks} />
          <FooterColumn title={t.footer.companyTitle} links={companyLinks} />
          <FooterColumn title={t.footer.legalTitle} links={legalLinks} />
        </div>

        <div className="border-line text-ink-3 mt-12 flex flex-col gap-2 border-t pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.company}. {t.footer.rights}
          </p>
          <p className="font-semibold">{siteConfig.productName}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <p className="text-ink text-sm font-bold">{title}</p>
      <ul className="mt-5 space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-ink-2 hover:text-brand-ink text-sm transition-colors">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
