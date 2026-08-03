import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalPage } from "@/components/marketing/legal-page";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/i18n/config";
import { LEGAL_UPDATED_AT } from "@/config/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDictionary(locale).pages.legal.privacy.title, robots: { index: false } };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const legal = getDictionary(locale).pages.legal;

  return (
    <LegalPage
      locale={locale}
      eyebrow={legal.privacy.eyebrow}
      title={legal.privacy.title}
      reviewNotice={legal.reviewNotice}
      updatedLabel={legal.privacy.updated}
      updatedAt={LEGAL_UPDATED_AT}
      sections={legal.privacy.sections}
    />
  );
}
