import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/vi";

/** Gói được đánh dấu là lựa chọn phổ biến — không phải cam kết giá. */
const HIGHLIGHTED = "GROWTH";

const TONES: Record<string, { tint: string; text: string; dot: string }> = {
  STARTER: { tint: "bg-sky-tint", text: "text-sky-ink", dot: "bg-sky" },
  GROWTH: { tint: "bg-brand-tint", text: "text-brand-ink", dot: "bg-brand" },
  PRO: { tint: "bg-violet-tint", text: "text-violet-ink", dot: "bg-violet" },
  ENTERPRISE: { tint: "bg-magenta-tint", text: "text-magenta-ink", dot: "bg-magenta" },
};

export function PricingGrid({ locale, t }: { locale: Locale; t: Dictionary["pricing"] }) {
  return (
    <RevealGroup className="grid items-stretch gap-5 lg:grid-cols-4">
      {t.plans.map((plan) => {
        const featured = plan.key === HIGHLIGHTED;
        const tone = TONES[plan.key] ?? TONES.STARTER;

        return (
          <RevealItem key={plan.key} className={cn(featured && "lg:-my-4")}>
            <div
              className={cn(
                "lv-card lv-card-hover flex h-full flex-col rounded-3xl p-7",
                featured && "ring-brand shadow-[var(--shadow-lg)] ring-2",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={cn("lv-chip border-transparent", tone.tint, tone.text)}>
                  {plan.name}
                </span>
                {featured ? (
                  <span className="bg-brand rounded-full px-2.5 py-1 text-[0.6rem] font-bold text-white">
                    {t.popular}
                  </span>
                ) : null}
              </div>

              <p className="text-ink-2 mt-5 text-sm leading-relaxed">{plan.for}</p>

              <p className="text-ink border-line mt-6 border-t pt-5 text-lg font-extrabold">
                {t.priceNote}
              </p>

              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <span className={cn("mt-0.5 grid size-4 shrink-0 place-items-center rounded-full", tone.dot)}>
                      <Check className="size-2.5 text-white" strokeWidth={3.5} aria-hidden />
                    </span>
                    <span className="text-ink-2 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="mt-8 w-full rounded-full"
                variant={featured ? "default" : "outline"}
                size="lg"
                render={<Link href={`/${locale}/lien-he?plan=${plan.key}`} />}
              >
                {t.contactCta}
              </Button>
            </div>
          </RevealItem>
        );
      })}
    </RevealGroup>
  );
}
