import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { LvLogo } from "@/components/brand/lv-logo";
import { Photo } from "@/components/brand/photo";
import { getAppDictionary } from "@/i18n/get-dictionary";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const { locale, t } = await getAppDictionary();
  const p = t.pages.auth;

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1.05fr]">
      {/* Cột form */}
      <div className="flex flex-col px-5 py-8 sm:px-10 lg:px-14">
        <div className="flex items-center justify-between gap-4">
          <Link href={`/${locale}`} className="shrink-0">
            <LvLogo size={38} withWordmark />
          </Link>
          <Link
            href={`/${locale}`}
            className="text-ink-3 hover:text-ink inline-flex items-center gap-1.5 text-sm transition-colors"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            {p.backHome}
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>

      {/* Cột giới thiệu — ẩn trên màn hình nhỏ */}
      <div className="relative hidden overflow-hidden lg:block">
        <Photo
          name="teamDesk"
          locale={locale}
          width={1000}
          height={1200}
          sizes="52vw"
          className="absolute inset-0 h-full w-full"
        />
        <span
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(200deg, color-mix(in srgb, var(--slab) 55%, transparent) 0%, var(--slab) 100%)",
          }}
          aria-hidden
        />

        <div className="relative flex h-full flex-col justify-end p-14">
          <h2 className="text-slab-ink max-w-md text-3xl leading-tight font-extrabold">
            {p.sideTitle}
          </h2>
          <ul className="mt-8 space-y-3.5">
            {p.sidePoints.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <span className="bg-brand mt-0.5 grid size-5 shrink-0 place-items-center rounded-full">
                  <Check className="size-3 text-white" strokeWidth={3.5} aria-hidden />
                </span>
                <span className="text-slab-ink-soft text-sm">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
