import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Brush,
  Building2,
  Camera,
  Film,
  Hammer,
  Layers,
  MonitorSmartphone,
  Printer,
  ScrollText,
  Signpost,
} from "lucide-react";
import { SectionHeading } from "@/components/brand/section-heading";
import { Photo } from "@/components/brand/photo";
import { HeroStage } from "@/components/marketing/hero-stage";
import { HeroCarousel } from "@/components/marketing/hero-carousel";
import { TemplateCard } from "@/components/marketing/template-card";
import { DashboardPreview, type PreviewVariant } from "@/components/marketing/dashboard-preview";
import { IndustryTabs } from "@/components/marketing/industry-tabs";
import { TemplateGallery } from "@/components/marketing/template-gallery";
import { EcosystemTabs } from "@/components/marketing/ecosystem-tabs";
import { ProcessRail } from "@/components/marketing/process-rail";
import { CtaPanel } from "@/components/marketing/cta-panel";
import { PricingGrid } from "@/components/marketing/pricing-grid";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Marquee, TextMarquee } from "@/components/motion/marquee";
import { Parallax } from "@/components/motion/parallax";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/i18n/config";
import { siteConfig } from "@/config/site";
import type { PhotoKey } from "@/data/media";
import { MARKETING_TEMPLATES } from "@/data/templates";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return {
    title: `${siteConfig.productName} — ${t.hero.headline}`,
    description: t.hero.sub,
    alternates: { languages: { vi: "/vi", de: "/de" } },
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);

  return (
    <>
      {/* ══ 1 · HERO ══════════════════════════════════════ */}
      <HeroStage locale={locale} t={t.hero} />

      {/* ══ 2 · VÁCH NGĂN: chữ khổ lớn + ảnh chạy ngược chiều ══
          Hai dải đi ngược nhau tạo cảm giác chuyển động mà không cần người xem
          làm gì — đồng thời liệt kê ngành nghề phục vụ. */}
      <div className="border-line relative border-y py-8 lg:py-10">
        <TextMarquee words={t.hero.rotating} duration={46} />
        <Marquee className="mt-7" reverse duration={52}>
          {MARQUEE.map((name) => (
            <div key={name} className="lv-shot h-28 w-44 shrink-0 sm:h-32 sm:w-52">
              <Photo
                name={name}
                locale={locale}
                width={280}
                height={180}
                sourceWidth={420}
                className="h-full w-full"
              />
            </div>
          ))}
        </Marquee>
      </div>

      {/* ══ 3 · HỆ SINH THÁI — bấm chọn từng bước, không cần cuộn ══ */}
      <Band>
        <SectionHeading
          eyebrow={t.ecosystem.eyebrow}
          title={t.ecosystem.title}
          accent={t.ecosystem.titleAccent}
          lead={t.ecosystem.lead}
          tone="sky"
        />
        <EcosystemTabs locale={locale} t={t.ecosystem} />
      </Band>

      {/* ══ 4 · CAROUSEL GIẢI PHÁP ════════════════════════ */}
      <Band tone="paper-3">
        <p className="lv-rule-label">{t.hero.eyebrow}</p>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <h2 className="lv-display-sm text-ink">
            {highlight(t.hero.headline, t.hero.headlineAccent)}
          </h2>
          <p className="text-ink-2 text-lg leading-relaxed lg:pb-2">{t.hero.sub}</p>
        </div>
        <Reveal delay={0.1} className="mt-12">
          <HeroCarousel locale={locale} t={t.hero} />
        </Reveal>
      </Band>

      {/* ══ 5 · GIẢI PHÁP THEO NGÀNH ══════════════════════ */}
      <Band id="nganh-nghe">
        <SectionHeading
          eyebrow={t.industries.eyebrow}
          title={t.industries.title}
          accent={t.industries.titleAccent}
          lead={t.industries.lead}
          tone="violet"
        />
        <Reveal delay={0.1} className="mt-12">
          <IndustryTabs locale={locale} />
        </Reveal>
      </Band>

      {/* ══ 6 · QUY TRÌNH — đường ray vẽ dần theo cuộn ════ */}
      <Band tone="paper-3">
        <SectionHeading
          eyebrow={t.process.eyebrow}
          title={t.process.title}
          accent={t.process.titleAccent}
          tone="sky"
          align="center"
        />
        <ProcessRail t={t.process} />
      </Band>

      {/* ══ 7 · BÊN TRONG NỀN TẢNG — lưới lệch nhịp ═══════ */}
      <Band tone="ink">
        <SectionHeading
          eyebrow={t.demo.eyebrow}
          title={t.demo.title}
          accent={t.demo.titleAccent}
          lead={t.demo.lead}
          className="[&_h2]:text-slab-ink [&_p:last-of-type]:text-slab-ink-soft"
        />

        {/*
          Lưới 12 cột, mỗi module một bề rộng khác nhau theo `DEMO_SPANS`.
          Lưới đều 6 ô như trước khiến sáu tính năng trông ngang hàng nhau,
          trong khi Calendar và Studio mới là thứ đáng xem nhất.
        */}
        <RevealGroup className="mt-14 grid gap-5 lg:grid-cols-12">
          {t.demo.modules.map((mod, i) => {
            const scene = DEMO_SCENES[i] ?? DEMO_SCENES[0];
            return (
              <RevealItem key={mod.key} className={DEMO_SPANS[i] ?? "lg:col-span-4"}>
                <div className="border-slab-line group h-full overflow-hidden rounded-3xl border bg-white/[0.06] backdrop-blur-sm transition-colors duration-400 hover:bg-white/[0.1]">
                  {/*
                    Ảnh thật của ngành nằm dưới, ảnh chụp giao diện đè lên trên:
                    ghép hai thứ trong một khung cho thấy màn hình nào dùng cho
                    tình huống nào, thay vì sáu ảnh giao diện trôi nổi không bối cảnh.
                  */}
                  <div className="relative h-40 overflow-hidden sm:h-48">
                    <Photo
                      name={scene.photo}
                      locale={locale}
                      width={720}
                      height={420}
                      sizes="(min-width: 1024px) 30vw, 92vw"
                      className="h-full w-full transition-transform duration-700 group-hover:scale-105"
                    />
                    <span
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(20,23,26,0.25) 0%, rgba(20,23,26,0.85) 100%)",
                      }}
                      aria-hidden
                    />
                    <span
                      className={cn(
                        "absolute top-3 left-3 rounded-full px-3 py-1 text-[0.65rem] font-bold text-white",
                        scene.chip,
                      )}
                    >
                      {scene.tag}
                    </span>
                  </div>

                  <div className="px-5 pb-5">
                    {/* Kéo ảnh giao diện lên đè một phần ảnh nền */}
                    <div className="bg-paper-2 relative -mt-12 overflow-hidden rounded-2xl p-3 shadow-[var(--shadow-lg)]">
                      <DashboardPreview variant={mod.key as PreviewVariant} bare />
                    </div>
                    <div className="mt-5">
                      <h3 className="text-slab-ink text-sm font-bold">{mod.name}</h3>
                      <p className="text-slab-ink-soft mt-1.5 text-sm leading-relaxed">
                        {mod.text}
                      </p>
                    </div>
                  </div>
                </div>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </Band>

      {/* ══ 8 · THƯ VIỆN TEMPLATE ═════════════════════════ */}
      <Band id="template">
        <SectionHeading
          eyebrow={t.templates.eyebrow}
          title={t.templates.title}
          accent={t.templates.titleAccent}
          lead={t.templates.lead}
        />

        <Reveal delay={0.08} className="mt-11">
          <TemplateGallery locale={locale} />
        </Reveal>

        <Reveal delay={0.05}>
          <p className="text-ink-3 mt-5 text-xs">{t.templates.note}</p>
        </Reveal>

        {/* Một chiến dịch chạy qua mọi kênh — cùng thông điệp, đúng định dạng từng nơi */}
        <Reveal delay={0.08} className="mt-20">
          <div className="lv-card overflow-hidden rounded-[2rem]">
            <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
              <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-14">
                <span className="lv-eyebrow lv-eyebrow-violet self-start">
                  {t.templates.campaignLabel}
                </span>
                <h3 className="lv-display-sm text-ink mt-6">{t.templates.campaignTitle}</h3>
                <p className="text-ink-2 mt-5 text-base leading-relaxed">
                  {t.templates.campaignText}
                </p>
                <ul className="mt-8 space-y-0">
                  {t.templates.campaignChannels.map((channel, i) => (
                    <li
                      key={channel}
                      className="border-line group flex items-center gap-3.5 border-b py-3 first:border-t"
                    >
                      <span
                        className={cn(
                          "grid size-7 shrink-0 place-items-center rounded-lg text-[0.65rem] font-extrabold",
                          CAMPAIGN_TONES[i % CAMPAIGN_TONES.length],
                        )}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-ink text-sm font-medium transition-transform duration-300 group-hover:translate-x-1">
                        {channel}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-paper-3 relative p-6 sm:p-8">
                {/* So le theo cột để cụm ảnh không thành một khối chữ nhật phẳng */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {CAMPAIGN_TEMPLATES.map((slug, i) => {
                    const template = MARKETING_TEMPLATES.find((item) => item.slug === slug);
                    if (!template) return null;
                    return (
                      <div
                        key={slug}
                        className={cn("lv-card overflow-hidden rounded-xl", i % 2 === 1 && "sm:mt-8")}
                      >
                        <TemplateCard template={template} locale={locale} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </Band>

      {/* ══ 9 · DỊCH VỤ KẾT HỢP — cụm ảnh so le có parallax ══ */}
      <Band tone="paper-3">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-20">
          <div>
            <SectionHeading
              eyebrow={t.services.eyebrow}
              title={t.services.title}
              accent={t.services.titleAccent}
              lead={t.services.lead}
              className="max-w-none"
            />
            <RevealGroup as="ul" className="mt-9 grid gap-2.5 sm:grid-cols-2">
              {t.services.items.map((item, i) => {
                const Icon = SERVICE_ICONS[i] ?? Layers;
                return (
                  <RevealItem key={item} as="li">
                    <div className="lv-card group flex items-center gap-3 rounded-2xl px-4 py-3 transition-transform duration-300 hover:translate-x-1">
                      <span
                        className={cn(
                          "grid size-8 shrink-0 place-items-center rounded-xl",
                          SERVICE_TONES[i % SERVICE_TONES.length],
                        )}
                      >
                        <Icon className="size-4" aria-hidden />
                      </span>
                      <span className="text-ink text-sm font-medium">{item}</span>
                    </div>
                  </RevealItem>
                );
              })}
            </RevealGroup>
          </div>

          {/* Ba ảnh trôi lệch tốc độ nhau khi cuộn */}
          <div className="grid grid-cols-2 gap-4">
            <Parallax speed={30}>
              <div className="lv-shot aspect-[4/5]">
                <Photo
                  name="showroomSofa"
                  locale={locale}
                  width={520}
                  height={650}
                  sizes="(min-width: 1024px) 24vw, 45vw"
                  className="h-full w-full"
                />
              </div>
            </Parallax>
            <Parallax speed={-24} className="space-y-4">
              <div className="lv-shot aspect-square">
                <Photo
                  name="interiorAccent"
                  locale={locale}
                  width={480}
                  height={480}
                  sizes="(min-width: 1024px) 24vw, 45vw"
                  className="h-full w-full"
                />
              </div>
              <div className="lv-shot aspect-square">
                <Photo
                  name="interiorModern"
                  locale={locale}
                  width={480}
                  height={480}
                  sizes="(min-width: 1024px) 24vw, 45vw"
                  className="h-full w-full"
                />
              </div>
            </Parallax>
          </div>
        </div>
      </Band>

      {/* ══ 10 · CASE STUDY — một ô lớn dẫn đầu, ba ô nhỏ theo sau ══ */}
      <Band>
        <SectionHeading
          eyebrow={t.cases.eyebrow}
          title={t.cases.title}
          accent={t.cases.titleAccent}
          tone="magenta"
        />

        <Reveal delay={0.06}>
          <p className="bg-amber-tint text-amber-ink mt-7 max-w-3xl rounded-2xl px-4 py-3 text-sm">
            {t.cases.disclaimer}
          </p>
        </Reveal>

        <RevealGroup className="mt-11 grid gap-6 lg:grid-cols-3">
          {t.cases.items.map((item, i) => {
            const lead = i === 0;
            return (
              <RevealItem
                key={item.title}
                as="article"
                className={lead ? "lg:col-span-3" : undefined}
              >
                <div
                  className={cn(
                    "lv-card lv-card-hover h-full overflow-hidden rounded-3xl",
                    lead && "lg:grid lg:grid-cols-[1.25fr_1fr]",
                  )}
                >
                  <div
                    className={cn(
                      "relative",
                      lead ? "min-h-[18rem]" : "aspect-[16/10] max-h-[18rem]",
                    )}
                  >
                    <Photo
                      name={CASE_PHOTOS[i]}
                      locale={locale}
                      width={lead ? 1100 : 620}
                      height={lead ? 700 : 390}
                      sizes={lead ? "(min-width: 1024px) 55vw, 92vw" : "(min-width: 1024px) 30vw, 92vw"}
                      className="absolute inset-0 h-full w-full"
                    />
                    <span
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(20,23,26,0) 40%, rgba(20,23,26,0.72) 100%)",
                      }}
                      aria-hidden
                    />
                    <p className="absolute right-5 bottom-4 left-5 text-xs font-semibold text-white/85">
                      {item.industry}
                    </p>
                  </div>

                  <div className={cn("p-7", lead && "flex flex-col justify-center lg:p-12")}>
                    <h3
                      className={cn("text-ink font-extrabold", lead ? "lv-display-sm" : "text-lg")}
                    >
                      {item.title}
                    </h3>
                    <p className="text-ink-2 mt-3 text-sm leading-relaxed">{item.text}</p>
                    <div className="border-line mt-6 flex items-baseline gap-4 border-t pt-5">
                      <span
                        className={cn(
                          "font-extrabold",
                          CASE_TONES[i],
                          lead ? "text-5xl lg:text-6xl" : "text-3xl",
                        )}
                      >
                        <AnimatedNumber value={item.metric} />
                      </span>
                      <span className="text-ink-3 text-xs leading-snug">{item.metricLabel}</span>
                    </div>
                  </div>
                </div>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </Band>

      {/* ══ 11 · PRICING ══════════════════════════════════ */}
      <Band id="bang-gia" tone="paper-3">
        <SectionHeading
          eyebrow={t.pricing.eyebrow}
          title={t.pricing.title}
          accent={t.pricing.titleAccent}
          lead={t.pricing.lead}
          align="center"
        />
        <Reveal delay={0.1} className="mt-14">
          <PricingGrid locale={locale} t={t.pricing} />
        </Reveal>
      </Band>

      {/* ══ 12 · CTA CUỐI ═════════════════════════════════ */}
      <CtaPanel locale={locale} t={t.finalCta} />
    </>
  );
}

/**
 * Tô màu gradient cho một cụm từ NẰM NGUYÊN TẠI CHỖ trong câu.
 * Phải cắt theo vị trí chứ không `replace` rồi nối lại: cụm nhấn của tiêu đề nằm
 * giữa câu ("Marketing thông minh cho…"), nối vào cuối sẽ thành câu vô nghĩa.
 */
function highlight(text: string, accent: string) {
  const at = text.indexOf(accent);
  if (at === -1) return text;
  return (
    <>
      {text.slice(0, at)}
      <span className="lv-gradient-text">{accent}</span>
      {text.slice(at + accent.length)}
    </>
  );
}

/** Dải section — đổi nền để tạo nhịp sáng/tối giữa các phần. */
function Band({
  children,
  id,
  tone = "paper",
}: {
  children: React.ReactNode;
  id?: string;
  tone?: "paper" | "paper-3" | "ink";
}) {
  return (
    <section
      id={id}
      className={cn("relative", tone === "paper-3" && "bg-paper-3", tone === "ink" && "lv-slab")}
    >
      <div className="lv-container py-20 lg:py-28">{children}</div>
    </section>
  );
}

/* ── dữ liệu bố cục ──────────────────────────────────────── */

const MARQUEE: PhotoKey[] = [
  "restaurantInterior",
  "manicureHands",
  "spaStones",
  "cafeTable",
  "retailStore",
  "showroomChairs",
  "fineDiningPlate",
  "nailsDark",
  "spaProducts",
  "berlinGate",
];

/**
 * Ảnh bối cảnh cho từng module ở section "Bên trong nền tảng".
 * Thứ tự phải khớp `t.demo.modules`: calendar · studio · inbox · campaign · reviews · leads.
 */
const DEMO_SCENES: { photo: PhotoKey; chip: string; tag: string }[] = [
  { photo: "teamDesk", chip: "bg-brand", tag: "Nhà hàng" },
  { photo: "phoneSocial", chip: "bg-violet", tag: "Nội dung" },
  { photo: "manicureHands", chip: "bg-sky", tag: "Tiệm nail" },
  { photo: "teamMeeting", chip: "bg-magenta", tag: "Chiến dịch" },
  { photo: "spaFacial", chip: "bg-amber", tag: "Spa" },
  { photo: "showroomChairs", chip: "bg-mint", tag: "Showroom" },
];

/** Bề rộng từng module trong lưới 12 cột — hai module đầu chiếm nửa hàng. */
const DEMO_SPANS = [
  "lg:col-span-7",
  "lg:col-span-5",
  "lg:col-span-4",
  "lg:col-span-4",
  "lg:col-span-4",
  "lg:col-span-12",
];

const SERVICE_TONES = [
  "bg-brand-tint text-brand-ink",
  "bg-violet-tint text-violet-ink",
  "bg-mint-tint text-mint-ink",
  "bg-amber-tint text-amber-ink",
  "bg-sky-tint text-sky-ink",
  "bg-magenta-tint text-magenta-ink",
];

const CASE_PHOTOS: PhotoKey[] = [
  "restaurantBright",
  "manicureWork",
  "spaFacialTwo",
  "showroomChairs",
];

const CASE_TONES = ["text-brand-ink", "text-magenta-ink", "text-sky-ink", "text-violet-ink"];

const CAMPAIGN_TONES = [
  "bg-brand-tint text-brand-ink",
  "bg-violet-tint text-violet-ink",
  "bg-sky-tint text-sky-ink",
  "bg-amber-tint text-amber-ink",
  "bg-magenta-tint text-magenta-ink",
];

/** Sáu định dạng đại diện cho "một chiến dịch chạy nhiều kênh". */
const CAMPAIGN_TEMPLATES = [
  "post-restaurant",
  "story-promo",
  "google-post",
  "menu-a4",
  "voucher",
  "loyalty-card",
];

const SERVICE_ICONS = [
  Brush,
  MonitorSmartphone,
  Camera,
  Film,
  ScrollText,
  Printer,
  Signpost,
  Hammer,
  Building2,
];
