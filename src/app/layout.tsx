import type { Metadata, Viewport } from "next";
import { cookies, headers } from "next/headers";
import { Be_Vietnam_Pro, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { siteConfig } from "@/config/site";
import { resolveLocale } from "@/i18n/config";
import { THEME_COLOR, THEME_COOKIE, resolveTheme } from "@/config/themes";
import "./globals.css";

// Cả hai font đều có subset `vietnamese` và `latin-ext` (dấu tiếng Việt + ä/ö/ü/ß).
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext", "vietnamese"],
  display: "swap",
});

const display = Be_Vietnam_Pro({
  variable: "--font-display",
  subsets: ["latin", "latin-ext", "vietnamese"],
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.contact.websiteHref),
  title: {
    default: `${siteConfig.productName} — ${siteConfig.company}`,
    template: `%s · ${siteConfig.productName}`,
  },
  description: siteConfig.tagline.vi,
  icons: {
    icon: siteConfig.logo.badge,
    apple: siteConfig.logo.badge,
  },
};

/**
 * Phải là hàm chứ không phải hằng: màu thanh địa chỉ và `color-scheme` của trình duyệt
 * phụ thuộc cookie theme, nếu để cứng thì ở nền tối trình duyệt vẫn vẽ khung sáng.
 */
export async function generateViewport(): Promise<Viewport> {
  const theme = resolveTheme((await cookies()).get(THEME_COOKIE)?.value);
  return {
    themeColor: THEME_COLOR[theme],
    colorScheme: theme,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [headerList, cookieStore] = await Promise.all([headers(), cookies()]);
  const locale = resolveLocale(headerList.get("x-lv-locale"));
  const theme = resolveTheme(cookieStore.get(THEME_COOKIE)?.value);

  return (
    <html
      lang={locale}
      data-theme={theme}
      className={`h-full ${inter.variable} ${display.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
