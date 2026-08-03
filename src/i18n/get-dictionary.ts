import "server-only";
import { cookies } from "next/headers";
import { LOCALE_COOKIE, resolveLocale, type Locale } from "./config";
import { vi, type Dictionary as BaseDictionary } from "./dictionaries/vi";
import { de } from "./dictionaries/de";
import { pagesVi, type PagesDictionary } from "./pages/vi";
import { pagesDe } from "./pages/de";

export type Dictionary = BaseDictionary & { pages: PagesDictionary };

const dictionaries: Record<Locale, Dictionary> = {
  vi: { ...vi, pages: pagesVi },
  de: { ...de, pages: pagesDe },
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.vi;
}

/** Dùng cho khu vực dashboard — locale lấy từ cookie, không nằm trong URL. */
export async function getAppLocale(): Promise<Locale> {
  const store = await cookies();
  return resolveLocale(store.get(LOCALE_COOKIE)?.value);
}

export async function getAppDictionary(): Promise<{ locale: Locale; t: Dictionary }> {
  const locale = await getAppLocale();
  return { locale, t: getDictionary(locale) };
}
