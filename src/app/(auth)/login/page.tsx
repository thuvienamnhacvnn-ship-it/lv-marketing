import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { getAppDictionary } from "@/i18n/get-dictionary";
import { getSessionUser } from "@/server/tenant";

export const metadata: Metadata = { title: "Đăng nhập", robots: { index: false } };

export default async function LoginPage() {
  if (await getSessionUser()) redirect("/app");

  const { locale, t } = await getAppDictionary();
  const p = t.pages.auth;

  return (
    <>
      <h1 className="text-ink text-3xl font-extrabold">{p.loginTitle}</h1>
      <p className="text-ink-2 mt-3 text-sm leading-relaxed">{p.loginLead}</p>
      <div className="mt-8">
        <AuthForm mode="login" locale={locale} t={p} />
      </div>
    </>
  );
}
