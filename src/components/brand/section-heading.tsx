import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/reveal";

export type AccentTone = "brand" | "magenta" | "violet" | "sky";

const EYEBROW_TONE: Record<AccentTone, string> = {
  brand: "",
  magenta: "lv-eyebrow-magenta",
  violet: "lv-eyebrow-violet",
  sky: "lv-eyebrow-sky",
};

const UNDERLINE_COLOR: Record<AccentTone, string> = {
  brand: "var(--brand)",
  magenta: "var(--magenta)",
  violet: "var(--violet)",
  sky: "var(--sky)",
};

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  /** Cụm từ trong tiêu đề được gạch chân màu. Phải khớp chính xác chuỗi con. */
  accent?: string;
  lead?: string;
  align?: "left" | "center";
  tone?: AccentTone;
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  accent,
  lead,
  align = "left",
  tone = "brand",
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow ? (
        <Reveal direction="none">
          <p className={cn("lv-eyebrow", EYEBROW_TONE[tone])}>{eyebrow}</p>
        </Reveal>
      ) : null}

      <Reveal delay={0.06}>
        <h2 className="text-ink mt-5 text-[2rem] leading-[1.1] font-extrabold sm:text-[2.6rem] lg:text-[3.1rem]">
          {renderTitle(title, accent, tone)}
        </h2>
      </Reveal>

      {lead ? (
        <Reveal delay={0.12}>
          <p className="text-ink-2 mt-5 text-lg leading-relaxed">{lead}</p>
        </Reveal>
      ) : null}
    </div>
  );
}

function renderTitle(title: string, accent: string | undefined, tone: AccentTone) {
  if (!accent) return title;
  const at = title.indexOf(accent);
  if (at === -1) return title;

  return (
    <>
      {title.slice(0, at)}
      <span
        className="lv-underline"
        style={{ ["--brand" as string]: UNDERLINE_COLOR[tone] }}
      >
        {accent}
      </span>
      {title.slice(at + accent.length)}
    </>
  );
}
