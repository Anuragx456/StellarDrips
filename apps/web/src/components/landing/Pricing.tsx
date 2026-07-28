"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { Pill } from "@/components/primitives/Pill";
import { GlowButton } from "@/components/primitives/GlowButton";
import { DarkCard } from "@/components/primitives/DarkCard";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const FREE_FEATURES = [
  "On-chain drip creation",
  "Up to 3 active drips",
  "Manual payment execution",
  "Event dashboard",
  "Open-source contract",
];

const PRO_FEATURES = [
  "Unlimited active drips",
  "Automated scheduling (30-min intervals)",
  "Priority event indexing",
  "Multi-token support",
  "Advanced analytics",
  "Community support",
];

export function Pricing() {
  const [annual, setAnnual] = useState(false);
  const { ref, isInView } = useScrollReveal<HTMLDivElement>();

  return (
    <section id="contracts" className="relative py-28">
      <div
        ref={ref}
        className="mx-auto max-w-[1280px] px-6 md:px-10"
      >
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Pill>Plans</Pill>
          </motion.div>

          <motion.h2
            className="mt-4 font-[family-name:var(--font-display)] text-[clamp(1.9rem,3.4vw,2.75rem)] font-semibold leading-[1.05] tracking-[-0.01em] text-[var(--text)]"
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          >
            Pick Your <span className="text-[var(--accent-bright)]">Plan</span>
          </motion.h2>

          {/* Toggle */}
          <motion.div
            className="mt-8 flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <span className={`text-sm ${!annual ? "text-[var(--text)]" : "text-[var(--faint)]"}`}>
              Monthly
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              className="relative h-7 w-12 rounded-full bg-[var(--surface-3)] transition-colors hover:border-[var(--accent-soft)]"
              role="switch"
              aria-checked={annual}
              aria-label="Toggle annual pricing"
            >
              <motion.span
                className="absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-[var(--accent)]"
                animate={{ x: annual ? 20 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
            <span className={`text-sm ${annual ? "text-[var(--text)]" : "text-[var(--faint)]"}`}>
              Annual
            </span>
            <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] text-[var(--accent)]">
              Save 20%
            </span>
          </motion.div>
        </div>

        {/* Cards */}
        <div className="mt-12 grid gap-6 md:grid-cols-2 md:gap-8">
          {/* Free */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
          >
            <DarkCard className="flex h-full flex-col p-6 md:p-8">
              <h3 className="text-lg font-semibold text-[var(--text)]">Free</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-[family-name:var(--font-display)] text-[2.5rem] font-semibold text-[var(--text)]">
                  $0
                </span>
                <span className="text-sm text-[var(--faint)]">/ forever</span>
              </div>
              <p className="mt-1 text-xs text-[var(--faint)]">
                The contract is permissionless — plans cover the hosted scheduler.
              </p>
              <ul className="mt-6 flex flex-col gap-3" role="list">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-[var(--muted)]">
                    <Check className="h-4 w-4 text-[var(--accent)] shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-8">
                <GlowButton variant="ghost" className="w-full">
                  Start Free
                </GlowButton>
              </div>
            </DarkCard>
          </motion.div>

          {/* Pro */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
          >
            <DarkCard className="flex h-full flex-col border-[var(--accent-soft)] p-6 md:p-8">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[var(--text)]">Pro</h3>
                <span className="rounded-full bg-[var(--accent-soft)] px-3 py-0.5 text-[10px] font-medium text-[var(--accent)]">
                  Popular
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={annual ? "annual" : "monthly"}
                    className="font-[family-name:var(--font-display)] text-[2.5rem] font-semibold text-[var(--text)]"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2 }}
                  >
                    {annual ? "$10" : "$12"}
                  </motion.span>
                </AnimatePresence>
                <span className="text-sm text-[var(--faint)]">
                  {annual ? "/ month" : "/ month"}
                </span>
              </div>
              <p className="mt-1 text-xs text-[var(--faint)]">
                Annual: ${annual ? "120" : "144"} billed yearly.
              </p>
              <ul className="mt-6 flex flex-col gap-3" role="list">
                {PRO_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-[var(--muted)]">
                    <Check className="h-4 w-4 text-[var(--accent)] shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-8">
                <GlowButton variant="primary" className="w-full">
                  Go Pro
                </GlowButton>
              </div>
            </DarkCard>
          </motion.div>
        </div>

        <p className="mt-8 text-center text-xs text-[var(--faint)]">
          The on-chain contract is permissionless and free — plans cover the hosted scheduler &amp; dashboard.
        </p>
      </div>
    </section>
  );
}
