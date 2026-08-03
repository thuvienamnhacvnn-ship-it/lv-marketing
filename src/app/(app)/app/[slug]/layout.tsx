import { cookies } from "next/headers";
import { AppSidebar } from "@/components/app/app-sidebar";
import { AppTopbar } from "@/components/app/app-topbar";
import { NAV_GROUPS } from "@/config/app-nav";
import { THEME_COOKIE, resolveTheme } from "@/config/themes";
import { getAppDictionary } from "@/i18n/get-dictionary";
import { listUserOrganizations, requireTenant } from "@/server/tenant";

/**
 * Khung của workspace.
 *
 * Chốt chặn quyền truy cập nằm ở đây chứ không ở `src/proxy.ts`: kiểm tra thành
 * viên cần truy vấn Prisma, mà proxy chạy trên edge runtime nên không dùng được
 * Prisma. `requireTenant` sẽ `redirect("/login")` nếu chưa đăng nhập và
 * `notFound()` nếu người dùng không thuộc tổ chức này.
 */
export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ctx = await requireTenant(slug);

  const [{ locale, t }, cookieStore, organizations] = await Promise.all([
    getAppDictionary(),
    cookies(),
    listUserOrganizations(ctx.user.id),
  ]);

  const theme = resolveTheme(cookieStore.get(THEME_COOKIE)?.value);

  // Lọc quyền ở server rồi chỉ gửi danh sách khoá xuống trình duyệt — không đẩy
  // cả bảng phân quyền vào bundle của client.
  const allowed = NAV_GROUPS.flatMap((group) => group.items)
    .filter((item) => !item.permission || ctx.can(item.permission))
    .map((item) => item.key);

  return (
    <div className="bg-paper flex min-h-dvh">
      <AppSidebar slug={slug} t={t} allowed={allowed} />

      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar
          locale={locale}
          theme={theme}
          t={t}
          title={ctx.organization.name}
          organizations={organizations}
          currentSlug={slug}
          user={{ name: ctx.user.name, email: ctx.user.email }}
        />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
