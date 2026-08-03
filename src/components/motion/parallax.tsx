"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Dịch chuyển phần tử theo tiến độ cuộn để tạo chiều sâu.
 *
 * `speed` dương = đi chậm hơn trang (lùi ra sau), âm = đi nhanh hơn (tiến lên trước).
 * Giá trị nên nằm trong khoảng −60…60 px, quá tay là bố cục bị hở đáy khi cuộn nhanh.
 */
export function Parallax({
  children,
  className,
  speed = 40,
  scale = false,
}: {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  /** Phóng nhẹ khi đi qua khung nhìn — dùng cho ảnh lớn, không dùng cho chữ. */
  scale?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Làm mượt để không giật theo từng nấc lăn chuột.
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 });
  const y = useTransform(progress, [0, 1], [speed, -speed]);
  const scaleValue = useTransform(progress, [0, 0.5, 1], [1.06, 1, 1.06]);

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      ref={ref}
      className={cn("will-change-transform", className)}
      style={{ y, scale: scale ? scaleValue : undefined }}
    >
      {children}
    </motion.div>
  );
}
