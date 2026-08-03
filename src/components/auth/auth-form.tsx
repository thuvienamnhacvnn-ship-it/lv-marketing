"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { login, register } from "@/features/auth/actions";
import { INDUSTRY_LABELS } from "@/features/auth/schema";
import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

type Mode = "login" | "register";

export function AuthForm({
  mode,
  locale,
  t,
}: {
  mode: Mode;
  locale: Locale;
  t: Dictionary["pages"]["auth"];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    startTransition(async () => {
      const payload =
        mode === "login"
          ? { email: String(data.get("email") ?? ""), password: String(data.get("password") ?? "") }
          : {
              name: String(data.get("name") ?? ""),
              email: String(data.get("email") ?? ""),
              password: String(data.get("password") ?? ""),
              orgName: String(data.get("orgName") ?? ""),
              industry: String(data.get("industry") ?? "OTHER"),
            };

      const result = mode === "login" ? await login(payload) : await register(payload);

      if (result.ok) {
        router.push(result.redirectTo);
        return;
      }

      setFieldErrors(result.reason === "validation" ? (result.fields ?? {}) : {});
      setFormError(
        result.reason === "invalid"
          ? t.invalid
          : result.reason === "emailTaken"
            ? t.emailTaken
            : result.reason === "storage"
              ? t.dbOffline
              : null,
      );
    });
  }

  return (
    <form onSubmit={onSubmit} noValidate className="w-full">
      {formError ? (
        <div
          role="alert"
          className="border-line bg-amber-tint text-amber-ink mb-6 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>{formError}</span>
        </div>
      ) : null}

      <div className="space-y-4">
        {mode === "register" ? (
          <>
            <Field label={t.name} name="name" autoComplete="name" error={fieldErrors.name} />
            <Field
              label={t.orgName}
              name="orgName"
              autoComplete="organization"
              error={fieldErrors.orgName}
            />
            <label className="block">
              <span className="text-ink-2 mb-1.5 block text-sm font-semibold">{t.industry}</span>
              <select
                name="industry"
                defaultValue="RESTAURANT"
                className="border-line bg-paper-2 text-ink focus:border-brand focus:ring-brand/25 w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2"
              >
                {Object.entries(INDUSTRY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label[locale]}
                  </option>
                ))}
              </select>
            </label>
          </>
        ) : null}

        <Field
          label={t.email}
          name="email"
          type="email"
          autoComplete="email"
          error={fieldErrors.email}
        />
        <Field
          label={t.password}
          name="password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          hint={mode === "register" ? t.passwordHint : undefined}
          error={fieldErrors.password}
        />
      </div>

      <Button type="submit" size="xl" disabled={pending} className="mt-7 w-full rounded-full">
        {pending ? t.working : mode === "login" ? t.submitLogin : t.submitRegister}
        {!pending ? <ArrowRight className="size-4" aria-hidden /> : null}
      </Button>

      <p className="text-ink-2 mt-6 text-center text-sm">
        {mode === "login" ? t.toRegister : t.toLogin}{" "}
        <Link
          href={mode === "login" ? "/register" : "/login"}
          className="text-brand-ink font-semibold hover:underline"
        >
          {mode === "login" ? t.toRegisterLink : t.toLoginLink}
        </Link>
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  autoComplete,
  hint,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  hint?: string;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="text-ink-2 mb-1.5 block text-sm font-semibold">{label}</span>
      <input
        type={type}
        name={name}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        className={cn(
          "border-line bg-paper-2 text-ink focus:border-brand focus:ring-brand/25 w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2",
          error && "border-bad",
        )}
      />
      {hint ? <span className="text-ink-3 mt-1.5 block text-xs">{hint}</span> : null}
    </label>
  );
}
