"use client";

import { motion } from "framer-motion";

interface MarqueeProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}

/**
 * Edge-faded horizontal marquee.
 * Pauses on hover.
 * Speed in seconds for one full scroll cycle (default 35s).
 */
export function Marquee({
  children,
  speed = 35,
  className = "",
}: MarqueeProps) {
  return (
    <div className={`marquee group relative w-full overflow-hidden ${className}`}>
      {/* Edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[var(--bg)] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[var(--bg)] to-transparent" />

      <motion.div
        className="flex w-max items-center gap-16"
        animate={{ x: [0, -768] }}
        transition={{
          x: {
            duration: speed,
            repeat: Infinity,
            ease: "linear",
            repeatType: "loop",
          },
        }}
        whileHover={{ animationPlayState: "paused" }}
        style={{ animationPlayState: "inherit" }}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}
