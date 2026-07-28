"use client";

import { motion } from "framer-motion";
import { GlowButton } from "@/components/primitives/GlowButton";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const TILES = [
  "Soroban", "Rust", "Next.js", "TypeScript",
  "Tailwind", "Freighter", "Stellar SDK", "GitHub Actions",
];

export function TechStack() {
  const { ref, isInView } = useScrollReveal<HTMLDivElement>();

  return (
    <section className="relative py-24">
      {/* Faint line-art corner decoration */}
      <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 opacity-[0.04" aria-hidden="true">
        <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M160 0v160H0" stroke="var(--accent)" strokeWidth="0.5" />
          <circle cx="140" cy="20" r="2" fill="var(--accent)" />
          <circle cx="20" cy="140" r="2" fill="var(--accent)" />
        </svg>
      </div>

      <div
        ref={ref}
        className="mx-auto grid max-w-[1280px] items-center gap-12 px-6 md:grid-cols-2 md:gap-16 md:px-10"
      >
        {/* Left text */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="font-[family-name:var(--font-display)] text-[clamp(1.9rem,3.4vw,2.75rem)] font-semibold leading-[1.05] tracking-[-0.01em] text-[var(--text)]">
            Built on a production <span className="text-[var(--accent-bright)]">Stellar</span> stack
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
            From smart contract to frontend — every layer is built with battle-tested
            Stellar ecosystem tools and modern web infrastructure.
          </p>
          <div className="mt-6">
            <GlowButton variant="ghost">Read the architecture →</GlowButton>
          </div>
        </motion.div>

        {/* Right tile grid */}
        <motion.div
          className="grid grid-cols-4 gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        >
          {TILES.map((name) => (
            <div
              key={name}
              className="flex aspect-square items-center justify-center rounded-[var(--r-tile)] border border-[var(--border)] bg-[var(--surface)] p-2 text-center text-[10px] font-medium leading-tight text-[var(--faint)] transition-colors duration-200 hover:border-[var(--accent-soft)] hover:text-[var(--accent)]"
            >
              {name}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
