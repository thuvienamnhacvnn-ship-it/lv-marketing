/** Ghi cookie phía trình duyệt. Tách khỏi component để không đụng biến ngoài trong render. */
export function writeCookie(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
}

export const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/**
 * Đổi `data-theme` trên <html> để giao diện chuyển ngay, không chờ server render lại.
 *
 * Vì sao phải tắt transition trong lúc đổi: Chrome không khởi động lại transition khi
 * giá trị của một thuộc tính đến từ biến CSS thừa kế bị đổi ở phần tử tổ tiên. Hậu quả
 * là `body { transition: background-color }` giữ nguyên màu nền cũ vĩnh viễn dù
 * `--background` đã đổi đúng. Tắt transition một khung hình rồi bật lại thì màu áp
 * dụng tức thì, mà hiệu ứng hover của các component vẫn còn nguyên.
 */
export function applyThemeAttribute(theme: string) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  root.setAttribute("data-theme-switching", "");
  root.setAttribute("data-theme", theme);

  // Đọc layout để ép trình duyệt tính lại style ngay trong khung hình này.
  void root.offsetHeight;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => root.removeAttribute("data-theme-switching"));
  });
}
