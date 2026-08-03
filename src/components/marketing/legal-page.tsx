import { AlertTriangle } from "lucide-react";
import { PageHero } from "@/components/marketing/page-hero";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import type { Locale } from "@/i18n/config";

/** Khung dùng chung cho ba trang pháp lý — cùng bố cục, chỉ khác nội dung. */
export function LegalPage({
  locale,
  eyebrow,
  title,
  reviewNotice,
  updatedLabel,
  updatedAt,
  intro,
  sections,
  children,
}: {
  locale: Locale;
  eyebrow: string;
  title: string;
  reviewNotice: string;
  updatedLabel?: string;
  updatedAt?: string;
  intro?: string;
  sections?: { h: string; p: string }[];
  children?: React.ReactNode;
}) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} lead={intro} locale={locale} />

      <section className="lv-container pb-20">
        <div className="max-w-3xl">
          {/* Cảnh báo trung thực: đây là bản dự thảo, chưa qua luật sư */}
          <Reveal>
            <div className="border-line bg-amber-tint text-amber-ink flex items-start gap-3 rounded-2xl border px-4 py-3.5">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
              <p className="text-sm leading-relaxed">{reviewNotice}</p>
            </div>
          </Reveal>

          {updatedLabel && updatedAt ? (
            <Reveal delay={0.05}>
              <p className="text-ink-3 mt-6 text-xs">
                {updatedLabel}: {updatedAt}
              </p>
            </Reveal>
          ) : null}

          {sections ? (
            <RevealGroup as="div" className="mt-8 space-y-8">
              {sections.map((section) => (
                <RevealItem key={section.h}>
                  <h2 className="text-ink text-lg font-extrabold">{section.h}</h2>
                  <p className="text-ink-2 mt-2.5 text-sm leading-relaxed">{section.p}</p>
                </RevealItem>
              ))}
            </RevealGroup>
          ) : null}

          {children}
        </div>
      </section>
    </>
  );
}
