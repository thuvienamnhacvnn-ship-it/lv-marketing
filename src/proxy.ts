import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_COOKIE, defaultLocale, isLocale } from "@/i18n/config";

const PUBLIC_FILE = /\.(?:png|jpe?g|svg|webp|ico|txt|xml|webmanifest)$/i;

/**
 * Chỉ xử lý ngôn ngữ. Kiểm tra quyền truy cập được thực hiện ở layout phía server
 * (cần Prisma nên không chạy được trên edge runtime).
 */
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/brand") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const segment = pathname.split("/")[1];
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;

  // Trang marketing: ngôn ngữ nằm trong URL.
  if (isLocale(segment)) {
    const response = withLocaleHeader(request, segment);
    if (cookieLocale !== segment) {
      response.cookies.set(LOCALE_COOKIE, segment, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
      });
    }
    return response;
  }

  // Trang gốc: chuyển tới ngôn ngữ đã chọn trước đó, mặc định tiếng Việt.
  if (pathname === "/") {
    const target = isLocale(cookieLocale) ? cookieLocale : defaultLocale;
    return NextResponse.redirect(new URL(`/${target}`, request.url));
  }

  // Khu vực app/admin/auth: ngôn ngữ lấy từ cookie.
  return withLocaleHeader(request, isLocale(cookieLocale) ? cookieLocale : defaultLocale);
}

function withLocaleHeader(request: NextRequest, locale: string) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-lv-locale", locale);
  requestHeaders.set("x-lv-pathname", request.nextUrl.pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
