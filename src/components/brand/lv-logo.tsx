import Image from "next/image";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

type LvLogoProps = {
  /** Chiều cao hiển thị tính bằng px. Logo vuông 1:1 nên chiều rộng bằng chiều cao. */
  size?: number;
  /**
   * `badge` — huy hiệu tròn viền bạc, đọc rõ trên nền sáng (mặc định).
   * `mark` — dấu LV nền trong suốt, dành cho nền tối.
   */
  variant?: "badge" | "mark";
  withWordmark?: boolean;
  className?: string;
  priority?: boolean;
};

/**
 * Logo LV GROUP — dùng đúng file gốc trong `public/brand`, giữ nguyên tỷ lệ 1:1.
 * Không bóp méo, không đổi màu, không vẽ lại.
 */
export function LvLogo({
  size = 40,
  variant = "badge",
  withWordmark = false,
  className,
  priority = false,
}: LvLogoProps) {
  const src = variant === "mark" ? siteConfig.logo.mark : siteConfig.logo.badge;

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src={src}
        alt={`${siteConfig.company} logo`}
        width={size}
        height={size}
        priority={priority}
        sizes={`${size}px`}
        className="shrink-0 object-contain"
        style={{ width: size, height: size }}
      />
      {withWordmark ? (
        <span className="flex flex-col leading-none">
          <span className="font-display text-ink text-[1.02rem] font-extrabold tracking-[-0.02em]">
            LV GROUP
          </span>
          <span className="text-ink-3 mt-1 text-[0.62rem] font-semibold tracking-[0.16em] uppercase">
            Marketing Hub
          </span>
        </span>
      ) : null}
    </span>
  );
}
