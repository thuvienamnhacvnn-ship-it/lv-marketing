import Image from "next/image";
import { PHOTOS, photoUrl, type PhotoKey } from "@/data/media";
import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n/config";

type PhotoProps = {
  name: PhotoKey;
  locale: Locale;
  width: number;
  height: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Kích thước ảnh nguồn yêu cầu từ Unsplash — mặc định gấp 1,6 lần chiều rộng hiển thị. */
  sourceWidth?: number;
};

/**
 * Ảnh có alt song ngữ lấy từ registry `src/data/media.ts`.
 * Không truyền URL trực tiếp ở component để mọi ảnh đều có alt đúng ngôn ngữ.
 */
export function Photo({
  name,
  locale,
  width,
  height,
  className,
  sizes,
  priority,
  sourceWidth,
}: PhotoProps) {
  const photo = PHOTOS[name];
  return (
    <Image
      src={photoUrl(name, sourceWidth ?? Math.round(width * 1.6))}
      alt={photo.alt[locale]}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      className={cn("object-cover", className)}
    />
  );
}
