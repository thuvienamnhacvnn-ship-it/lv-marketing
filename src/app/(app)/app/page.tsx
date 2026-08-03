import { redirect } from "next/navigation";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LvLogo } from "@/components/brand/lv-logo";
import { listUserOrganizations, requireUser } from "@/server/tenant";
import { getAppDictionary } from "@/i18n/get-dictionary";

export const metadata = { title: "Workspace" };

/**
 * Điểm tiếp đất sau khi đăng nhập.
 *
 * `login()` và `register()` đều trả về `/app`, còn mọi màn hình thật lại nằm dưới
 * `/app/[slug]` vì `requireTenant` nạp theo slug. Trang này làm cầu nối: có một
 * tổ chức thì vào thẳng, nhiều tổ chức thì cho chọn.
 */
export default async function AppEntryPage() {
  const user = await requireUser();
  const organizations = await listUserOrganizations(user.id);
  const { t } = await getAppDictionary();

  if (organizations.length === 1) redirect(`/app/${organizations[0].slug}`);

  return (
    <main className="bg-paper flex min-h-dvh items-center justify-center p-6">
      <div className="w-full max-w-md">
        <LvLogo size={44} withWordmark />

        {organizations.length === 0 ? (
          <>
            <h1 className="text-ink mt-8 text-2xl font-extrabold">Chưa có workspace nào</h1>
            <p className="text-ink-2 mt-3 text-sm leading-relaxed">
              Tài khoản {user.email} chưa thuộc doanh nghiệp nào. Hãy tạo workspace mới, hoặc nhờ
              chủ doanh nghiệp mời bạn vào.
            </p>
            <Button size="lg" className="mt-7 rounded-full" render={<Link href="/register" />}>
              Tạo workspace
            </Button>
          </>
        ) : (
          <>
            <h1 className="text-ink mt-8 text-2xl font-extrabold">Chọn workspace</h1>
            <p className="text-ink-2 mt-2 text-sm">
              Tài khoản của bạn thuộc {organizations.length} doanh nghiệp.
            </p>

            <ul className="mt-7 space-y-2.5">
              {organizations.map((org) => (
                <li key={org.id}>
                  <Link
                    href={`/app/${org.slug}`}
                    className="lv-card lv-card-hover flex items-center gap-3 rounded-2xl px-4 py-3.5"
                  >
                    <span className="bg-brand-tint text-brand-ink grid size-9 shrink-0 place-items-center rounded-xl">
                      <Building2 className="size-4" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="text-ink block truncate text-sm font-bold">{org.name}</span>
                      <span className="text-ink-3 block truncate text-xs">/{org.slug}</span>
                    </span>
                    {org.isDemo ? (
                      <span className="bg-amber-tint text-amber-ink shrink-0 rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase">
                        {t.common.demoBadge}
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </main>
  );
}
