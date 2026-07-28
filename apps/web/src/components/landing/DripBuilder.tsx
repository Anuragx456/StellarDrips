"use client";

import { motion } from "framer-motion";
import { Pill } from "@/components/primitives/Pill";
import { GlowButton } from "@/components/primitives/GlowButton";
import { DarkCard } from "@/components/primitives/DarkCard";
import { SectionShell } from "@/components/primitives/SectionShell";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const PRESETS = [
  {
    category: "SaaS",
    count: 12,
    suggestions: ["10 XLM / month", "Per seat"],
  },
  {
    category: "Membership",
    count: 8,
    suggestions: ["5 XLM / month", "Annual"],
  },
  {
    category: "Donation",
    count: 6,
    suggestions: ["1 XLM / day", "One-time + recur"],
  },
  {
    category: "Payroll",
    count: 4,
    suggestions: ["100 XLM / 14 days"],
  },
];

export function DripBuilder() {
  const { ref, isInView } = useScrollReveal<HTMLDivElement>();

  return (
    <SectionShell beam="horizontal" className="py-28">
      <div
        ref={ref}
        className="mx-auto max-w-[800px]"
      >
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Pill>Create a Drip</Pill>
          </motion.div>

          <motion.h2
            className="mt-4 font-[family-name:var(--font-display)] text-[clamp(1.9rem,3.4vw,2.75rem)] font-semibold leading-[1.05] tracking-[-0.01em] text-[var(--text)]"
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          >
            More Powerful With <span className="text-[var(--accent-bright)]">Scheduling</span>
          </motion.h2>
        </div>

        {/* Builder card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        >
          <DarkCard className="mt-10 p-6 md:p-8" hover={false}>
            {/* Input row */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex flex-1 items-center gap-3 rounded-[var(--r-input)] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm transition-colors focus-within:border-[var(--accent)]">
                <span className="text-[var(--faint)]">Amount</span>
                <input
                  type="text"
                  placeholder="10"
                  className="flex-1 bg-transparent text-[var(--text)] outline-none placeholder:text-[var(--faint)]"
                  aria-label="Amount"
                />
                <span className="font-mono text-xs text-[var(--muted)]">XLM</span>
              </div>
              <GlowButton variant="primary" className="shrink-0">
                Create Drip ⚡
              </GlowButton>
            </div>

            {/* Presets */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {PRESETS.map((preset) => (
                <div key={preset.category}>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-medium text-[var(--text)]">{preset.category}</span>
                    <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] text-[var(--accent)]">
                      {preset.count}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {preset.suggestions.map((s) => (
                      <button
                        key={s}
                        className="rounded-full border border-[var(--border)] bg-[var(--surface-3)] px-3 py-1 text-[11px] text-[var(--muted)] transition-colors hover:border-[var(--accent-soft)] hover:text-[var(--accent)]"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </DarkCard>
        </motion.div>

        {/* Caption + CTAs */}
        <motion.div
          className="mt-6 flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-center"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <p className="text-xs text-[var(--faint)]">
            Presets are suggestions — configure any amount, token, and schedule.
          </p>
          <div className="flex items-center gap-3">
            <GlowButton variant="ghost">Launch App</GlowButton>
            <GlowButton variant="ghost">See Demo</GlowButton>
          </div>
        </motion.div>
      </div>
    </SectionShell>
  );
}
