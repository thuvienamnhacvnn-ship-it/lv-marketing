export const locales = ["vi", "de"] as const;

export type Locale = (typeof locales)[number];

/** Giai đoạn development mặc định tiếng Việt. */
export const defaultLocale: Locale = "vi";

export const LOCALE_COOKIE = "lv_locale";

export const localeLabels: Record<Locale, { label: string; short: string }> = {
  vi: { label: "Tiếng Việt", short: "VI" },
  de: { label: "Deutsch", short: "DE" },
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

export function resolveLocale(value: string | undefined | null): Locale {
  return isLocale(value) ? value : defaultLocale;
}
