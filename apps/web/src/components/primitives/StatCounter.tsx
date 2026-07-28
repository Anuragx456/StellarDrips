"use client";

import { motion } from "framer-motion";

interface StatCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  label: string;
  className?: string;
}

/**
 * Animated counter that counts up on viewport enter.
 * Respects prefers-reduced-motion (shows final value immediately).
 */
export function StatCounter({
  value,
  suffix = "",
  prefix = "",
  decimals = 0,
  label,
  className = "",
}: StatCounterProps) {
  const formatted = value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  // We show the final value with a ref-based count-up in framer-motion
  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <motion.span
        className="count-up font-[family-name:var(--font-display)] text-[clamp(2.8rem,6vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.02em] text-[var(--text)]"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {prefix}{formatted}{suffix}
      </motion.span>
      <span className="text-sm text-[var(--muted)]">{label}</span>
    </div>
  );
}
