import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale, locales } from "@/i18n/config";
import { THEME_COOKIE, resolveTheme } from "@/config/themes";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function MarketingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const theme = resolveTheme((await cookies()).get(THEME_COOKIE)?.value);
  const t = getDictionary(locale);

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader locale={locale} theme={theme} t={t.nav} />
      {/* pt-16 khớp đúng chiều cao thanh header cố định (h-16). */}
      <main className="flex-1 pt-16">{children}</main>
      <SiteFooter locale={locale} t={t} />
    </div>
  );
}
