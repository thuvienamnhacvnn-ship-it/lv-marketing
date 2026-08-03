"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitContact } from "@/features/contact/actions";
import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

type Status = "idle" | "success" | "storageError";

export function ContactForm({
  locale,
  t,
  defaultIndustry,
  defaultMessage,
}: {
  locale: Locale;
  t: Dictionary["pages"]["contact"];
  defaultIndustry?: string;
  defaultMessage?: string;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const payload = {
      name: String(data.get("name") ?? ""),
      business: String(data.get("business") ?? ""),
      industry: String(data.get("industry") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      message: String(data.get("message") ?? ""),
      consent: data.get("consent") === "on",
    };

    startTransition(async () => {
      const result = await submitContact(payload);
      if (result.ok) {
        setFieldErrors({});
        setStatus("success");
        form.reset();
        return;
      }
      if (result.reason === "validation") {
        setFieldErrors(result.fields ?? {});
        setStatus("idle");
        return;
      }
      setFieldErrors({});
      setStatus("storageError");
    });
  }

  if (status === "success") {
    return (
      <div className="lv-card rounded-3xl p-8 text-center sm:p-10">
        <span className="bg-brand-tint text-brand-ink mx-auto grid size-14 place-items-center rounded-full">
          <CheckCircle2 className="size-7" aria-hidden />
        </span>
        <h3 className="text-ink mt-5 text-xl font-extrabold">{t.successTitle}</h3>
        <p className="text-ink-2 mt-3 text-sm leading-relaxed">{t.successText}</p>
        <Button
          variant="outline"
          size="lg"
          className="mt-7 rounded-full"
          onClick={() => setStatus("idle")}
        >
          {t.formTitle}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="lv-card rounded-3xl p-6 sm:p-8">
      <h3 className="text-ink text-lg font-extrabold">{t.formTitle}</h3>

      {status === "storageError" ? (
        <div
          role="alert"
          className="border-line bg-amber-tint text-amber-ink mt-5 flex items-start gap-3 rounded-2xl border px-4 py-3"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span className="text-sm">
            <strong className="block font-bold">{t.errorTitle}</strong>
            {t.errorText}
          </span>
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label={t.fields.name} name="name" error={fieldErrors.name} required />
        <Field label={t.fields.business} name="business" error={fieldErrors.business} required />

        <label className="block">
          <span className="text-ink-2 mb-1.5 block text-sm font-semibold">
            {t.fields.industry} <span className="text-brand">*</span>
          </span>
          <select
            name="industry"
            required
            defaultValue={defaultIndustry ?? ""}
            className={cn(
              "border-line bg-paper-2 text-ink focus:border-brand focus:ring-brand/25 w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2",
              fieldErrors.industry && "border-bad",
            )}
          >
            <option value="" disabled>
              —
            </option>
            {t.industries.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
        </label>

        <Field label={t.fields.phone} name="phone" type="tel" error={fieldErrors.phone} />
        <div className="sm:col-span-2">
          <Field label={t.fields.email} name="email" type="email" error={fieldErrors.email} required />
        </div>

        <label className="block sm:col-span-2">
          <span className="text-ink-2 mb-1.5 block text-sm font-semibold">
            {t.fields.message} <span className="text-brand">*</span>
          </span>
          <textarea
            name="message"
            rows={5}
            required
            defaultValue={defaultMessage}
            placeholder={t.fields.messagePlaceholder}
            className={cn(
              "border-line bg-paper-2 text-ink placeholder:text-ink-3 focus:border-brand focus:ring-brand/25 w-full resize-y rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2",
              fieldErrors.message && "border-bad",
            )}
          />
        </label>
      </div>

      <label className="mt-5 flex items-start gap-3">
        <input
          type="checkbox"
          name="consent"
          required
          className="accent-brand mt-0.5 size-4 shrink-0"
        />
        <span className={cn("text-ink-2 text-xs leading-relaxed", fieldErrors.consent && "text-bad")}>
          {t.consent}
        </span>
      </label>

      <Button type="submit" size="xl" disabled={pending} className="mt-7 w-full rounded-full">
        {pending ? t.submitting : t.submit}
        {!pending ? <Send className="size-4" aria-hidden /> : null}
      </Button>

      <p className="text-ink-3 mt-4 text-center text-xs">
        {locale === "vi" ? "Chúng tôi không gửi thư quảng cáo." : "Wir versenden keine Werbe-Mails."}
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  error,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  error?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-ink-2 mb-1.5 block text-sm font-semibold">
        {label} {required ? <span className="text-brand">*</span> : null}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        aria-invalid={error ? true : undefined}
        className={cn(
          "border-line bg-paper-2 text-ink placeholder:text-ink-3 focus:border-brand focus:ring-brand/25 w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2",
          error && "border-bad",
        )}
      />
    </label>
  );
}
