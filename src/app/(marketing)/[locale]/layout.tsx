import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { MobileTabBar } from "@/components/marketing/mobile-tab-bar";
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
      {/*
        pt-16 khớp chiều cao header cố định. pb ở đáy chừa chỗ cho thanh tab của
        điện thoại (4.5rem) cộng vùng an toàn của máy có thanh gạt Home — không
        chừa thì phần cuối trang nằm khuất dưới thanh tab.
      */}
      <main className="flex-1 pt-16 pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:pb-0">
        {children}
      </main>
      <SiteFooter locale={locale} t={t} />
      <MobileTabBar locale={locale} t={t.nav} />
    </div>
  );
}
