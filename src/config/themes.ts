import type { Locale } from "@/i18n/config";

export const THEMES = ["light", "dark"] as const;
export type ThemeName = (typeof THEMES)[number];

export const THEME_COOKIE = "lv_theme";
export const defaultTheme: ThemeName = "light";

export function isTheme(value: string | undefined | null): value is ThemeName {
  return !!value && (THEMES as readonly string[]).includes(value);
}

/**
 * Tên theme cũ còn nằm trong cookie của khách đã ghé trước đây.
 * Không có bảng này thì họ bị đá về theme sáng dù trước đó đang dùng nền tối.
 */
const LEGACY_ALIASES: Record<string, ThemeName> = {
  sunrise: "light",
  pop: "light",
  studio: "light",
  midnight: "dark",
};

export function resolveTheme(value: string | undefined | null): ThemeName {
  if (isTheme(value)) return value;
  if (value && value in LEGACY_ALIASES) return LEGACY_ALIASES[value];
  return defaultTheme;
}

export function oppositeTheme(theme: ThemeName): ThemeName {
  return theme === "light" ? "dark" : "light";
}

/** Màu thanh địa chỉ trình duyệt — phải khớp `--paper` của từng theme. */
export const THEME_COLOR: Record<ThemeName, string> = {
  light: "#fffbf6",
  dark: "#08080f",
};

/** Nhãn cho nút đổi theme. Nội dung mô tả hành động sắp xảy ra, không phải trạng thái hiện tại. */
export const THEME_META: Record<ThemeName, { switchTo: Record<Locale, string> }> = {
  light: { switchTo: { vi: "Chuyển sang nền tối", de: "Zum dunklen Modus wechseln" } },
  dark: { switchTo: { vi: "Chuyển sang nền sáng", de: "Zum hellen Modus wechseln" } },
};
