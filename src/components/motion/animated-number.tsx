"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

/**
 * Đếm số khi phần tử vào tầm nhìn. Giữ nguyên tiền tố/hậu tố (%, +, ★…)
 * để không phải tách chuỗi ở nơi gọi.
 */
export function AnimatedNumber({
  value,
  className,
  duration = 1400,
}: {
  value: string;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(value);

  const match = value.match(/^(\D*)([\d.,]+)(.*)$/);

  useEffect(() => {
    if (!match || !inView || reduce) return;

    const [, prefix, rawNumber, suffix] = match;
    const decimalSep = rawNumber.includes(",") && !rawNumber.includes(".") ? "," : ".";
    const numeric = Number(rawNumber.replace(/\./g, decimalSep === "." ? "" : ".").replace(",", "."));
    if (!Number.isFinite(numeric)) return;

    // Số một chữ số đếm lên trông như lỗi hiển thị — để nguyên.
    if (Math.abs(numeric) < 10) return;

    const decimals = rawNumber.split(/[.,]/)[1]?.length ?? 0;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      // easeOutExpo — nhanh lúc đầu, dừng mượt
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = (numeric * eased).toFixed(decimals).replace(".", decimalSep);
      setDisplay(`${prefix}${current}${suffix}`);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, match, duration, reduce]);

  return (
    <span ref={ref} className={className}>
      {match && inView && !reduce ? display : value}
    </span>
  );
}
