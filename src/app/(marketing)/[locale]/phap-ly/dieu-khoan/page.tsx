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
  return { title: getDictionary(locale).pages.legal.terms.title, robots: { index: false } };
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const legal = getDictionary(locale).pages.legal;

  return (
    <LegalPage
      locale={locale}
      eyebrow={legal.terms.eyebrow}
      title={legal.terms.title}
      reviewNotice={legal.reviewNotice}
      updatedLabel={legal.terms.updated}
      updatedAt={LEGAL_UPDATED_AT}
      sections={legal.terms.sections}
    />
  );
}
